module.exports = function (context, req) {
    context.log('### Serverless Smilr API received request for event data');
    const DataAccess = require('../data-access');
    const data = new DataAccess();
    let today = new Date().toISOString().substring(0, 10);
    let dataPromise;

    if(req.query.id) {
        dataPromise = data.queryEvents(`event.id = '${req.query.id}'`);
    }

    switch(req.query.time) {
        case 'active':
            dataPromise = data.queryEvents(`event["start"] <= '${today}' AND event["end"] >= '${today}'`);
            break;
        case 'future':
            dataPromise = data.queryEvents(`event["start"] > '${today}'`);
            break
        case 'past':
            dataPromise = data.queryEvents(`event["end"] < '${today}'`);
            break        
    }
    if(dataPromise) {
        dataPromise
        .then(data => {
            // return single item not array if id provided
            if(req.query.id) data = data[0];
            context.res = {status: 200, body: data, headers:{'Content-Type': 'application/json'}}
            context.done();
        })
        .catch(err => {
            context.res = {status: 400, body: "ERROR "+err.toString()}
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