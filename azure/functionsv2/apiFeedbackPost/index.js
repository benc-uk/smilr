const dataAccess = require('../lib/data-access')

module.exports = async function (context, req) {
  context.log('### Serverless Smilr API received request for feedback post');

  try {
    if(!req.body) throw "ERROR! feedback body missing"

    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 3, 5, true)
    var result = await dataAccess.createFeedback(req.body)
    if(!result) throw "Problem with dataAccess.createFeedback"

    await dataAccess.db.close()
    return { status: 200, body: JSON.stringify(result.ops[0]), headers: {'Content-Type': 'application/json'} }
  } catch(err) {
    context.log(`### ERROR! ${err}`)
    return { status: 500, body: err.toString() }
  }
};