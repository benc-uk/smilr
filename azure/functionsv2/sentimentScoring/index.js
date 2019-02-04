MongoClient = require('mongodb').MongoClient;
const request = require('request-promise-native');

const COGNITIVE_API_KEY = process.env.COGNITIVE_API_KEY;
const MONGO_CONNSTR = process.env.MONGO_CONNSTR;
const COGNITIVE_URL = 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';

module.exports = async function (context, documents) { 
  if (!!!documents || documents.length <= 0)
    return;

  try {
    // Build a list of documents to send to Text Analytics
    var docsToAnalyse = [];
    for(let doc of documents) {
      var docValue = doc.$v;
      var comment = docValue.comment.$v;
      var docId = docValue._id.$v;
      // VERY IMPORTANT - Don't process docs that already have sentiment added
      if(docValue.hasOwnProperty('sentiment')) continue;
      context.log(`### Triggered on changed/new feedback document: ${docId}`);
      context.log(`### Comment: "${comment}"`);
      docsToAnalyse.push({
        id: docId, 
        text: comment
      });
    }

    if(docsToAnalyse.length == 0) {
      context.log(`### Exiting, no docs needing sentiment scoring`);
      return;
    }

    // Our REST request to call Text Analytics
    let cognitiveRequest = {
      url: COGNITIVE_URL,
      headers: { 
        'content-type': 'application/json', 
        'Ocp-Apim-Subscription-Key': COGNITIVE_API_KEY
      },
      body: JSON.stringify({documents: docsToAnalyse})
    }

    // Call the Text Analytics Cognitive Service for sentiment scoring
    let cogApiResp = await request.post(cognitiveRequest);
    cognitiveResults = JSON.parse(cogApiResp);
    context.log("### Results ", cognitiveResults);

    // Now connect to MongoDB - Note we can not use the native Functions bindings :(
    let db = await MongoClient.connect(MONGO_CONNSTR);
    let smilrDb = db.db('smilrDb');
    let feedback = smilrDb.collection('feedback');
    context.log("### Connected to Mongo OK");

    for(let cogResult of cognitiveResults.documents) {
      // For sharding we need the event property too, that's back in our original documents list
      // So we need to search for it, keying on _id 
      let sourceDoc = documents.find(d => {
        return d.$v._id.$v == cogResult.id
      })
      // Supply both the doc _id and the event, the event property is the shard key
      await feedback.updateOne({ _id: cogResult.id, event: sourceDoc.$v.event.$v }, { $set: {sentiment: cogResult.score} })
      context.log(`### Successfully updated document '${cogResult.id}' in database`);
    }
  } catch(err) {
    context.log(`### ERROR! ${err}`)
  }
}