module.exports = function (context, req) {
    context.log('### Serverless Smilr API received feedback data');
    const dataAccess = require('../lib/data-access');
    let today = new Date().toISOString().substring(0, 10);
    
    if(req.body) {
        context.log(req.body);
        dataAccess.createFeedback(req.body)
        .then(data => {
            context.res = {status: 200, body: data, headers:{'Content-Type': 'application/json'}}
            context.done();
        })
        .catch(err => {
            context.res = {status: 400, body: "ERROR "+err}
            context.done();
        }); 
    }

    return;
};