module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const DataAccess = require('../data-access');
    const data = new DataAccess();
    let today = new Date().toISOString().substring(0, 10);
    let dataPromise;

    if(req.body) {
        context.log(req.body);
        data.createFeedback(req.body)
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