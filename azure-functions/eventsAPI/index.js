module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const DataAccess = require('../data-access');
    const data = new DataAccess();
    let today = new Date().toISOString().substring(0, 10);
    let dataPromise;

    if(req.query.id) {
        dataPromise = data.queryEvents(`d.id = '${req.query.id}'`);
    }

    switch(req.query.time) {
        case 'active':
            dataPromise = data.queryEvents(`d["start"] <= '${today}' AND d["end"] >= '${today}'`);
            break;
        case 'future':
            dataPromise = data.queryEvents(`d["start"] > '${today}'`);
            break
        case 'past':
            dataPromise = data.queryEvents(`d["end"] < '${today}'`);
            break        
    }
    if(dataPromise) {
        dataPromise
        .then(data => {
            context.res = {status: 200, body: data, headers:{'Content-Type': 'application/json'}}
            context.done();
        })
        .catch(err => {
            context.res = {status: 400, body: "ERROR "+err}
            context.done();
        });  
        return;
    }

    // Catch all
    data.queryEvents('true')
      .then(data => {
          context.res = {status: 200, body: data, headers:{'Content-Type': 'application/json'}}
          context.done();
      })
      .catch(err => {
          context.res = {status: 400, body: "ERROR "+err}
          context.done();
      }); 
    
    return; 
};