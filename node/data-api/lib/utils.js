//
// Simple utils class with static helper functions
// -----------------------------------------------
// Ben C, March 2018
//

class Utils {
  //
  // Try to send back the underlying error code and message
  //
  sendError(res, err, code = 500) {
    console.log(`### Error with events API ${JSON.stringify(err)}`); 
    let statuscode = code;
    if(err.code > 1) statuscode = err.code;

    // App Insights
    const appInsights = require("applicationinsights");    
    if(appInsights.defaultClient) appInsights.defaultClient.trackException({exception: err});
    
    res.status(statuscode).send(err);
    return;
  }

  //
  // This will unMongo our data and send it back 
  //
  sendData(res, data) {
    // IMPORTANT!
    // This lets us pretend we're not really using Mongo!
    // It simply swaps the '_id' field for 'id' in all data returned
    // This way we don't need to change the front-end, which is expecting 'id' :)
    let unMongoData = null;

    if(Array.isArray(data)) {
      unMongoData = data.map(d => {d.id = d._id; delete(d._id); return d});
    } else {
      unMongoData = data;
      unMongoData.id = unMongoData._id;
      delete unMongoData._id;
    }
    // App Insights
    const appInsights = require("applicationinsights");    
    if(appInsights.defaultClient) appInsights.defaultClient.trackEvent({name: "dataEvent", properties: {data: JSON.stringify(unMongoData)}});
    
    res.status(200).send(unMongoData)
    return;    
  }

  //
  // Security check function, check a supplied code using TOTP
  //
  // verifyCode(code) {
  //   if(!process.env.API_SECRET) return true;
  //   let jsotp = require('jsotp');
  //   let totp = jsotp.TOTP(process.env.API_SECRET);
  //   return totp.verify(code);
  // }

  //
  // Security check function, attempts to validate JWT tokens
  //
  verifyAuthentication(req) {

    return new Promise(function(resolve, reject) {
      // Short circuit validation if SECURE_API is switched off
      if(process.env.SECURE_API != "true") 
        resolve(true);

      // Check we even have a authorization header
      if(!req.headers['authorization']) {
        reject('SECURE_API enabled, and authorization token missing');
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

      let aadV2 = false;
      if(process.env.AAD_V2 == "true") aadV2 = true;
      aad.verify(jwtToken, null, true, aadV2, function(err, result) {
        if (result) {
          console.log(`### Verified identity of '${result.name}' in token on API call`);
          resolve(result)
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
