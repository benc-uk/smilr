//
// Simple utils class with static helper functions
// -----------------------------------------------
// Ben C, March 2018
//

class Utils {
  //
  // Try to send back the underlying error code and message
  //
  sendError(res, err, code = 500, title = 'smilr-api-error') {
    console.log(`### Error with events API ${JSON.stringify(err)}`); 
    let statuscode = code;
    if(err.code > 200) statuscode = err.code;

    // App Insights
    const appInsights = require("applicationinsights");    
    if(appInsights.defaultClient) appInsights.defaultClient.trackException({exception: err});
    
    // Problem Details object as per https://tools.ietf.org/html/rfc7807
    let problemDetails = {
      'error': true,
      'title' : title,
      'details' : err,
      'status': statuscode
    };

    res.status(statuscode).send(problemDetails);
    return;
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
