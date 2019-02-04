const dataAccess = require('../lib/data-access')

module.exports = async function (context, req) {
  context.log('### Serverless Smilr API received request for feedback get');

  try {
    if(!req.query.eventid || !req.query.topicid) throw "ERROR! eventid or topicid parameters missing"

    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 3, 5, true)
    var feedback = await dataAccess.listFeedbackForEventTopic(req.query.eventid, parseInt(req.query.topicid))
    if(!feedback) throw "Problem with dataAccess.listFeedbackForEventTopic"

    await dataAccess.db.close()
    return { status: 200, body: JSON.stringify(feedback), headers: {'Content-Type': 'application/json'} }
  } catch(err) {
    context.log(`### ERROR! ${err}`)
    return { status: 500, body: err.toString() }
  }
};