#r "Microsoft.Azure.Documents.Client"
#r "Newtonsoft.Json"
using System;
using Newtonsoft.Json;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Collections.Generic;
using Microsoft.Azure.Documents;

// Cognitive API config, set API key in app settings
static string API_KEY = Environment.GetEnvironmentVariable("COGNITIVE_API_KEY");
static string API_ENDPOINT = "https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment";

public static void Run(IReadOnlyList<Document> docs, out dynamic[] outputDoc, TraceWriter log)
{
    List<dynamic> tempResults = new List<dynamic>();
    outputDoc = null;

    if (docs != null && docs.Count > 0) { 
        log.Info("### " + docs.Count + " new or changed docs to process");
        foreach(var doc in docs) {            
            // Skip over non-feedback docs
            if(doc.GetPropertyValue<string>("doctype") != "feedback") continue;
            // Skip over feedback without comments
            if(doc.GetPropertyValue<string>("comment").Length == 0) continue;

            // !!Very important!! This stops our updated docs from re-triggering this Function
            // and creating an infinite loop!
            if(!String.IsNullOrEmpty(doc.GetPropertyValue<string>("sentiment"))) continue;

            log.Info("### Processing new comment: \"" + doc.GetPropertyValue<string>("comment") + "\"");
            // Using JSON with C# can be kind of ugly, but this works OK 
            var analyticsRequestDocArray = new dynamic[] { 
                new {
                    id = doc.Id,
                    language = "en",
                    text = doc.GetPropertyValue<string>("comment")
                }
            };
            var analyticsRequest = new {documents = analyticsRequestDocArray};

            var apiResp = callCognitiveServiceApi(analyticsRequest, log); 
            log.Info("### Text analytics API called");

            // Push results into a temporary array, in a little tuple
            tempResults.Add(new {apiResp = apiResp, origDoc = doc});
        }

        // This isn't nice - had to staticly size the output array
        // The Webjob SDK is super touchy about the output type, can't use a List or dynamic collection
        outputDoc = new dynamic[tempResults.Count];
        for(var t = 0; t < tempResults.Count; t++) {
            log.Info("### Comment has sentiment score: "+Double.Parse(tempResults[t].apiResp.documents[0].score.ToString()));
            log.Info("### Creating new doc to update Cosmos DB with...");
            outputDoc[t] = new {
                id = tempResults[t].origDoc.Id,
                doctype= "feedback",
                sentiment = Double.Parse(tempResults[t].apiResp.documents[0].score.ToString()),
                comment = tempResults[t].origDoc.GetPropertyValue<string>("comment"),
                rating = tempResults[t].origDoc.GetPropertyValue<string>("rating"),
                @event = tempResults[t].origDoc.GetPropertyValue<string>("event"),
                topic = tempResults[t].origDoc.GetPropertyValue<int>("topic")                
            };
        }
    }
}

//
// Simple HTTP POST call and JSON convert results 
//
public static dynamic callCognitiveServiceApi(dynamic request_obj, TraceWriter log)
{
    var client = new HttpClient();
    var content = new StringContent(JsonConvert.SerializeObject(request_obj), Encoding.UTF8, "application/json");
    
    content.Headers.Add("Ocp-Apim-Subscription-Key", API_KEY);
    var resp = client.PostAsync(API_ENDPOINT, content).Result;
    dynamic resp_obj = JsonConvert.DeserializeObject( resp.Content.ReadAsStringAsync().Result );
    return resp_obj;
}
