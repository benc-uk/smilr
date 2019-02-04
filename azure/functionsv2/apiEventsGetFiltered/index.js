const dataAccess = require('../lib/data-access')

module.exports = async function (context, req) {
  context.log('### Serverless Smilr API received request for time filtered events');
  
  let today = new Date().toISOString().substring(0, 10);
  let query = {}

  try {
    if(!req.query.time) throw "ERROR! time parameter missing"

    switch(req.query.time) {
      case 'active': 
        query = { $and: [{start: {$lte: today}}, {end: {$gte: today}}] }
        break
      case 'future': 
        query = { start: {$gt: today} }
        break
      case 'past': 
        query = { end: {$lt: today} }
        break
      default:
        throw 'Error. Supplied time value not valid, must be one of: [active, future, past]'
    }
    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 3, 5, true)
    var events = await dataAccess.queryEvents(query)
    if(!events) throw "Problem with dataAccess.queryEvents"

    await dataAccess.db.close()
    return { status: 200, body: JSON.stringify(events), headers: {'Content-Type': 'application/json'} }
  } catch(err) {
    context.log(`### ERROR! ${err}`)
    return { status: 500, body: err.toString() }
  }
};