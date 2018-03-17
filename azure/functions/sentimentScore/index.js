MongoClient = require('mongodb').MongoClient;
const request = require('request-promise-native');

const COGNITIVE_API_KEY = process.env.COGNITIVE_API_KEY;
const MONGO_CONNSTR = process.env.MONGO_CONNSTR;
const COGNITIVE_URL = 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';

module.exports = function (context, documents) {

    if (!!documents && documents.length > 0) {

        var docsToSend = [];
        for(let doc of documents) {
            var docValue = doc.$v;
            var comment = docValue.comment.$v;
            var docId = docValue._id.$v;
            if(docValue.hasOwnProperty('sentiment')) continue;
            context.log(`### Triggered on changed/new feedback document: ${docId}`);
            docsToSend.push({id: docId, text: comment});
        }

        if(docsToSend.length == 0) {
            context.log(`### Exiting due to no docs needing sentiment`);
            context.done();
            return;
        }

        var congnitiveBody = {
            documents: docsToSend
        }

        let congnitiveReq = {
            url: COGNITIVE_URL,
            headers: {'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': COGNITIVE_API_KEY},
            body: JSON.stringify(congnitiveBody)
        }

        request.post(congnitiveReq)
        .then(rawResult => {
            congnitiveResult = JSON.parse(rawResult);
            context.log("### Results ", rawResult);

            // Now connect to MongoDB - Note we can not use the native Functions bindings :(
            MongoClient.connect(MONGO_CONNSTR)
            .then(db => {
                context.log("### Connected to Mongo OK");
                let smilrDb = db.db('smilrDb');
                let feedback = smilrDb.collection('feedback');
                for(let res of congnitiveResult.documents) {
                    feedback.updateOne({_id:res.id}, {$set:{sentiment:res.score}})
                    .then(() => context.log(`### Updated doc '${res.id}' with score '${res.score}'`))
                    .catch(err => context.log("### Error performing update: ", err))
                }
            })
            .catch(err => {
                context.log("### MongoDB error", err);
            })   
        })
        .catch(err => {
            context.log(err);
        })
    }

    context.done();
}
