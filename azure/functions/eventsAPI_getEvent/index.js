

const dataAccess = require('../lib/data-access');

module.exports = async function (context, req) {
    context.log('### Serverless Smilr API received request for single event');

    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 1, 3, true)
    .catch(err => {
        context.log('### ERROR! Can\'t connect to Mongo! '+err);
        context.done();
        return;
    });

    var events = await dataAccess.queryEvents({_id: req.params.id})
    .catch(err => {
        context.log(err); context.res = {status: 500, body:err}; context.done(); return; 
    })

    if(events && events.length == 0) {
        context.res = {status: 404}
    } else {
        context.res = {status: 200, body: unMongo(events[0]), headers:{'Content-Type': 'application/json'}}
    }     
    
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