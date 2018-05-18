const dataAccess = require('../lib/data-access');

module.exports = async function (context, req) {
    context.log('### Serverless Smilr API received request for all events');

    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 1, 3, true)
    .catch(err => {
        context.log('### ERROR! Can\'t connect to Mongo! '+err);
        context.done();
        return;
    });

    // Get ALL events
    var events = await dataAccess.queryEvents({})
    .catch(err => {
        context.log(err); context.res = {status: 500, body:err}; context.done(); return; 
    })
    
    context.res = {status: 200, body: unMongo(events), headers:{'Content-Type': 'application/json'}}
    await dataAccess.db.close();
    context.done();
};

//
// ======= Helpers ========
// 

function unMongo(data) {
    if(Array.isArray(data)) {
      let unMongoData = data.map(d => {d.id = d._id; delete(d._id); return d});
      return unMongoData;    
    } else {
      data.id = data._id;
      delete data._id;
      return data;
    }
}