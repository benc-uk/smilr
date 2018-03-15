// Connect to Mongo DB
const MongoClient = require('mongodb').MongoClient;

const url = "mongodb://smilr-mongo:kCZKUM9cDlRcP2I1YeJpkPJg59JXPV1YCoBISjO8KhorrpbuCJAjHhg5gzqeHL1qMtczBFcVgdqOHj9n3TTpMQ%3D%3D@smilr-mongo.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";
var dbb = null;
MongoClient.connect(url)
.then(function (db) {
  var dbo = db.db("testdb");
  dbo.collection("customers").insertOne({name:"fred"}, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
})
.catch(function (err) {
  console.error(err);
});
