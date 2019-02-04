const dataAccess = require('../lib/data-access')

module.exports = async function (context, req) {
  context.log('### Serverless Smilr API received request for single event');

  try {
    if(!req.query.id) throw "ERROR! id parameter missing"

    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 3, 5, true)
    var events = await dataAccess.queryEvents({_id: req.query.id})
    if(!events) throw "Problem with dataAccess.queryEvents"
    if(events.length == 0) return { status: 404, body: `ERROR! Event ${req.query.id} not found` }

    await dataAccess.db.close()
    return { status: 200, body: JSON.stringify(events), headers: {'Content-Type': 'application/json'} }
  } catch(err) {
    context.log(`### ERROR! ${err}`)
    return { status: 500, body: err.toString() }
  }
};