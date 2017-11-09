require('dotenv').config()
var documentClient = require("documentdb").DocumentClient;

// Unlikely you'll ever want to change these
const DBNAME = 'microserviceDb';
const COLLNAME = 'alldata';
const EVENT_PKEY = 'event';
const FEEDBACK_PKEY = 'feedback';

// Load Cosmos config from env vars / app settings
const cosmosEndpoint = process.env.COSMOS_ENDPOINT;
const cosmosKey = process.env.COSMOS_KEY;

//
// Constructor
//

function DataAccess() {
  // Connect to Azure Cosmos DB
  console.log('### Connecting to Cosmos DB ', cosmosEndpoint);
  this.client = new documentClient(cosmosEndpoint, { "masterKey": cosmosKey });
  this.collUrl = `dbs/${DBNAME}/colls/${COLLNAME}`;
}

//
// Data access methods for event documents
//

DataAccess.prototype.queryEvents = function (query) {
  return new Promise((resolve, reject) => {
    let q = `SELECT * FROM d WHERE d.doctype='${EVENT_PKEY}' AND ${query}`;
    this.client.queryDocuments(this.collUrl, q).toArray((err, res) => {
      if (err) { reject(err) }
      else { resolve(res) };
    });
  });
}

DataAccess.prototype.getEvent = function (id) {
  let docUrl = `${this.collUrl}/docs/${id}` 
  return new Promise((resolve, reject) => {
    // The partitionKey part is poorly documented required magic
    this.client.readDocument(docUrl, { partitionKey: EVENT_PKEY }, (err, res) => {
      if (err) { reject(err) }
      else { resolve(res) };
    });
  });
}

DataAccess.prototype.deleteEvent = function (id) {
  let docUrl = `${this.collUrl}/docs/${id}` 
  return new Promise((resolve, reject) => {
    // The partitionKey part is poorly documented required magic
    this.client.deleteDocument(docUrl, { partitionKey: EVENT_PKEY }, (err, res) => {
      if (err) { reject(err) }
      else { resolve({msg:`Deleted doc ${id} ok`}) };
    });
  });
}

DataAccess.prototype.createOrUpdateEvent = function (event) {
  if (event.id) {
    return new Promise((resolve, reject) => {
      let docUrl = `${this.collUrl}/docs/${event.id}` 
      this.client.replaceDocument(docUrl, event, (err, res) => {
        if (err) reject(err)
        else resolve(res);
      });
    });
  } else {
    // Create a random id for new events
    event.id = this.makeId(6);
    event.doctype = EVENT_PKEY;
    return new Promise((resolve, reject) => {
      this.client.createDocument(this.collUrl, event, (err, res) => {
        if (err) reject(err)
        else resolve(res);
      });
    });
  }
}

//
// Data access methods for feedback documents
//

DataAccess.prototype.listFeedbackForEventTopic = function (eventid, topicid) {
  return new Promise((resolve, reject) => {
    let q = `SELECT * FROM d WHERE d.doctype='${FEEDBACK_PKEY}' AND d.event = '${eventid}' AND d.topic = ${topicid}`;
    this.client.queryDocuments(this.collUrl, q).toArray((err, res) => {
      if (err) { reject(err) }
      else { resolve(res) };
    });
  });
}

DataAccess.prototype.createFeedback = function (feedback) {
  feedback.id = this.makeId(6);
  feedback.doctype = FEEDBACK_PKEY;
  return new Promise((resolve, reject) => {
    this.client.createDocument(this.collUrl, feedback, (err, res) => {
      if (err) reject(err)
      else resolve(res);
    });
  });
}

//
// Data utils - re-init the database, delete everything and load seed data
//

DataAccess.prototype.initDatabase = function () {
  console.log(`### DB init starting...`);
  return new Promise((resolve, reject) => {
    this.client.deleteDatabase(`dbs/${DBNAME}`, (err) => {
      if(err) reject(err)
      this.client.createDatabase({id: DBNAME}, (err, res) => {
        if(err) reject(err)
        // More undocumented magic, only found on Stackoverflow!
        // How to create a partitioned collection, by adding `partitionKey : { paths: ["/foo"], kind: "Hash" }` to the spec
        this.client.createCollection(`dbs/${DBNAME}`, { id: COLLNAME, partitionKey : { paths: ["/doctype"], kind: "Hash" } }, (err, res) => {
          if(err) reject(err)
          console.log(`### DB and collection deleted and recreated...`);

          // Load seed data
          var seedData = JSON.parse(require('fs').readFileSync('seed-data.json', 'utf8'));
          eventData = seedData.events;   
          feedbackData = seedData.feedback;  
          eventData.forEach(event =>  {
            this.client.createDocument(this.collUrl, event, (err, res) => {if(!err) console.log(`### Loaded event '${event.title}' into collection`); else reject(err) });
          });
          feedbackData.forEach(event =>  {
            this.client.createDocument(this.collUrl, event, (err, res) => {if(!err) console.log(`### Loaded feedback into collection`); else reject(err) });
          });          

          console.log(`### DB init complete`);
          resolve({msg:'DB init complete, documents may still be loading async...'});
        }); 

      });
    });
  });
}

// Simple random ID generator, good enough, with len=6 it's a 1:56 in billion chance of a clash
DataAccess.prototype.makeId = function(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// export the class
module.exports = DataAccess;