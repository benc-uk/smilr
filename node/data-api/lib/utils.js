//
// Simple utils class with static helper functions
// -----------------------------------------------
// Ben C, March 2018
//

class Utils {
  //
  // Send back errors in standard format and log with App Insights
  //
  sendError(res, err, title = 'smilr-api-error') {
    console.log(`### Error with events API ${err.toString()}`); 
    let source = ((new Error().stack).split("at ")[2]).trim();

    let statusCode = err.code ? err.code : 500;
    if(statusCode < 100 || statusCode > 999) statusCode = 500;

    // Problem Details object as per https://tools.ietf.org/html/rfc7807
    let problemDetails = {
      error: true,
      title: title,
      details: err.toString(),
      status: statusCode,
      source: source
    };

    // App Insights
    const appInsights = require("applicationinsights");    
    if(appInsights.defaultClient) appInsights.defaultClient.trackException({apiError: problemDetails});

    res.status(statusCode).send(problemDetails);
  }

  //
  // This will send data back to caller
  //
  sendData(res, data) {
    // App Insights
    const appInsights = require("applicationinsights");    
    if(appInsights.defaultClient) appInsights.defaultClient.trackEvent({name: "dataEvent", properties: {data: JSON.stringify(data)}});
    
    res.type('application/json');
    res.status(205).send(data)
    return;    
  }

  //
  // Simple random ID generator, good enough, with len=6 it's a 1:56 billion chance of a clash
  //
  makeId(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  //
  // Sleep, call with await
  //
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }  
}

module.exports = new Utils();
