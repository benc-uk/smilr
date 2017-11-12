# Azure Function - Sentiment Analysis
This is an optional serverless component which analyses feedback, posts it to Azure Cognitive text analytics service for sentiment analysis. The results are pushed back to the feedback record in Cosmos DB

# Triggers & Input / Output
The function is triggered when new documents are loaded into the Cosmos DB database. It will only act on documents which are feedback (i.e. `doctype: 'feedback'`) and don't already have sentiment (checks for existing `sentiment` property)  
The comment part of the feedback is sent to text analytics cognitive service and the score recorded.

The sentiment score is added to the feedback document as property `sentiment` and then output from the Function to Cosmos DB to update the document. 

---

# Deployment

### Pre Req - Cognitive Service
Deploy a text analytics cognitive service in Azure, and make a note of the key

### Azure Function 
Simply create a new Function App and new C# function, then upload the `function.json` and `run.csx` overwriting the existing files. Alternatively copy & paste the contents up, which also works!  

Create an app setting called `COGNITIVE_API_KEY` and set the value to the key of cognitive service you created.