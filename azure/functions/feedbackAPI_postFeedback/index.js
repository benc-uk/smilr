const dataAccess = require('../lib/data-access');

module.exports = async function (context, req) {
    context.log('### Serverless Smilr API received new feedback');

    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 1, 3, true)
    .catch(err => {
        context.log('### ERROR! Can\'t connect to Mongo! '+err);
        context.done();
        return;
    });

    // Insert new feedback 
    var resp = await dataAccess.createFeedback(req.body)
    .catch(err => {
        context.log(err); context.res = {status: 500, body:err}; context.done(); return; 
    })
    
    dataAccess.db.close();
    context.res = {status: 200, body: resp, headers:{'Content-Type': 'application/json'}}
    context.done();
};
