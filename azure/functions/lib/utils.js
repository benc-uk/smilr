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
    if(Array.isArray(data)) {
      let unMongoData = data.map(d => {d.id = d._id; delete(d._id); return d});
      res.status(200).send(unMongoData)
      return;    
    } else {
      data.id = data._id;
      delete data._id;
      res.status(200).send(data)
      return;
    }
  }

  //
  // Security check function, check a supplied code using TOTP
  //
  verifyCode(code) {
    if(!process.env.API_SECRET) return true;
    let jsotp = require('jsotp');
    let totp = jsotp.TOTP(process.env.API_SECRET);
    return totp.verify(code);
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
