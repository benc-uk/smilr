const dataAccess = require('../lib/data-access')

module.exports = async function (context, req) {
  context.log('### Serverless Smilr API received request for all events');

  try {
    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 3, 5, true)
    var events = await dataAccess.queryEvents({})
    if(!events) throw "Problem with dataAccess.queryEvents"

    await dataAccess.db.close()
    return { status: 200, body: JSON.stringify(events), headers: {'Content-Type': 'application/json'} }
  } catch(err) {
    context.log(`### ERROR! ${err}`)
    return { status: 500, body: err.toString() }
  }
};