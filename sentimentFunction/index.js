const request = require('request');

module.exports = function (context, docs) {
    if (!!docs && docs.length > 0) {
        context.log(`Received ${docs.length} new docs from Cosmos DB`);
    
        // Process all modified docs, ready for text-analytics
        var analyseDocs = {
            "documents": []
        }
        docs.forEach(doc => {
            // Skip over non-feedback docs
            if(doc.doctype != 'feedback') return;
            // Very important! This stops our updated docs from re-triggering this Function
            // and creating an infinite loop!
            if(doc.sentiment) return;

            context.log(`Feedback received: ${doc.comment}`);
            analyseDocs.documents.push({language:"en", id:doc.id, text:doc.comment});
        });

        if(analyseDocs.documents.length > 0) {
            // Text analytics request
            var requestOptions = {
                url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment?',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': 'e58617773ce74e199181359a6c2386bb'
                },
                method: 'post',
                body: analyseDocs,
                json: true,
            };

            var updateDocs = [];
            request(requestOptions, (err, resp, body) => {
                if(err) {
                    context.log("ERROR in API call", err, body);
                } else {
                    context.log("H2");

                    docs.forEach(doc => {
                        context.log("H3");
                        if(doc.doctype != 'feedback') return;
                        if(doc.sentiment) return;             
                        body.documents.forEach(respDoc => {
                            console.log('respDoc', respDoc);
                            if(respDoc.id == doc.id) {
                                doc.sentiment = respDoc.sentiment;
                                updateDocs.push(doc)
                            }
                        });
                    });                   
                }
            });

            context.bindings.outputDoc = JSON.stringify(updateDocs);
        }
        
    }
    context.done();
}
