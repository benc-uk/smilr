

const dataAccess = require('../lib/data-access');

module.exports = async function (context, req) {
    context.log('### Serverless Smilr API received request for time filtered events');
    let today = new Date().toISOString().substring(0, 10);

    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 1, 3, true)
    .catch(err => {
        context.log('### ERROR! Can\'t connect to Mongo! '+err);
        context.done();
        return;
    });

    var events = [];
    switch(req.params.time) {
        case 'active':
            events = await dataAccess.queryEvents({$and: [{start: {$lte: today}}, {end: {$gte: today}}]});
            break;
        case 'future':
            events = await dataAccess.queryEvents({start: {$gt: today}});
            break
        case 'past':
            events = await dataAccess.queryEvents({end: {$lt: today}});
            break   
        default:
            context.res = {status: 400, body: "Time invalid"}; context.done(); return; 
    }  
    dataAccess.db.close();

    context.res = {status: 200, body: unMongo(events), headers:{'Content-Type': 'application/json'}}
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