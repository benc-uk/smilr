class Utils {
  //
  // Try to send back the underlying error code and message
  //
  sendError(res, err) {
    console.log(`### Error with events API ${JSON.stringify(err)}`); 
    let code = 500;
    if(err.code > 1) code = err.code;
    res.status(code).send(err);
    return;
  }

  //
  // This sends data back in JSON un-Mongo-fied
  //
  sendData(res, data) {
    // This lets us pretend we're not using Mongo
    // It simply swaps the '_id' field for 'id' in all data returned
    // This way we don't need to change the front-end, which is expecting 'id'
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
  // A bit of security, check a supplied code using TOTP
  //
  verifyCode(code) {
    if(!process.env.API_SECRET) return true;
    let jsotp = require('jsotp');
    let totp = jsotp.TOTP(process.env.API_SECRET);
    return totp.verify(code);
  }

  // Simple random ID generator, good enough, with len=6 it's a 1:56 in billion chance of a clash
  makeId(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}

module.exports = new Utils();
