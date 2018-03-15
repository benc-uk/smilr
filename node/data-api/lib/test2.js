process.env.MONGO_URL = "mongodb://smilr-mongo:kCZKUM9cDlRcP2I1YeJpkPJg59JXPV1YCoBISjO8KhorrpbuCJAjHhg5gzqeHL1qMtczBFcVgdqOHj9n3TTpMQ%3D%3D@smilr-mongo.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";

var dataAccess = require('./data-access');

async function run() {
  await dataAccess.connectMongo();
  var temp = await dataAccess.createOrUpdateEvent({_id:"1NvAW",test:"ben was NOT here"});
  console.log(temp.result);
  console.log("Should I be here? Probably.");
  await dataAccess.done();
}

// ----------

run()
.then(() => {
  console.log("DONE?");
})
.catch(err => {
  console.error(err)
  dataAccess.done();
});
