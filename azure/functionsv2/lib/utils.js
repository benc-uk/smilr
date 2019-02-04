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
    res.status(200).send(data)
    return;    
  }

  //
  // Security check function, attempts to validate JWT tokens
  //
  verifyAuthentication(req) {

    return new Promise(function(resolve, reject) {
      // Short circuit validation if SECURE_CLIENT_ID is not set
      if(!process.env.SECURE_CLIENT_ID) 
        resolve(true);

      // Check we even have a authorization header
      if(!req.headers['authorization']) {
        reject('SECURE_CLIENT_ID is set, but authorization bearer token missing');
        return;
      }
      
      // Validate using azure-ad-jwt
      // Note. azure-ad-jwt has been modified to support AAD v2 
      try {
        var aad = require('./azure-ad-jwt/azure-ad-jwt')
      } catch(e) {
        console.log(e);
      }

      var authorization = req.headers['authorization']
      var bearer = authorization.split(" ");
      var jwtToken = bearer[1];
      //console.log("### TOKEN ###", jwtToken); 

      let aadV2 = true;
      if(process.env.AAD_V1 == "true") aadV2 = false;
      
      aad.verify(jwtToken, null, true, aadV2, function(err, result) {
        if (result) {

          // validate audience is our client id
          if(result.aud == process.env.SECURE_CLIENT_ID) {
            console.log(`### Verified identity of '${result.name}' in token on API call`);
            resolve(result)
          } else {
            reject("Verify authentication failed, SECURE_CLIENT_ID doesn't match token audience claim")
          }
        } else {
          console.log("### Verify authentication failed, JWT is invalid: " + err);
          reject(err)
        }
      });
        
    });
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
