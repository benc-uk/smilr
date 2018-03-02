#!/bin/node
require('dotenv').config()
console.log(`### DB init script starting...`);

// Unlikely you'll ever want to change these
var DBNAME = 'smilrDb';
var COLLNAME = 'alldata';
var EVENT_PKEY = 'event';
var FEEDBACK_PKEY = 'feedback'; 

// To work with the Cosmos DB emulator, and self signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load Cosmos config from env vars / app settings
var cosmosEndpoint = process.argv[2] || process.env.COSMOS_ENDPOINT;
var cosmosKey = process.argv[3] || process.env.COSMOS_KEY;
if(!cosmosEndpoint || !cosmosKey) {
  console.log("### COSMOS_ENDPOINT and COSMOS_KEY must be specified");
  console.log("### This can be done via env vars, creating .env file or passing as parameters");
  process.exit(0);
}

// Connect to Azure Cosmos DB
const documentClient = require("documentdb").DocumentClient;
console.log('### Will use Cosmos DB instance:', cosmosEndpoint);
var client = new documentClient(cosmosEndpoint, { "masterKey": cosmosKey });
let collectionUrl = `dbs/${DBNAME}/colls/${COLLNAME}`;

// Do the magic...
initDb()
.catch(err => { console.log(`### Bad thing ${err}`) });

async function initDb() {
  // Create DB and collection
  await createDbPromise()
        .then(console.log("### Database created, wow!") )
        .catch(err => { console.log("### Database exists, ok meh whatever") });
  await deleteCollPromise()
        .catch(err => { /* expected */ });
  await createCollPromise();

  // Load seed data
  let seedData = JSON.parse(require('fs').readFileSync('seed-data.json', 'utf8'));
  let eventData = seedData.events;   
  let feedbackData = seedData.feedback;  
  for(let event of eventData) {        
    await createDocPromise(event);
    console.log(`### Loaded event ${event.id}`);
  }
  for(let feedback of feedbackData) {        
    await createDocPromise(feedback);
    console.log(`### Loaded feedback ${feedback.id}`);
  }
}

// ===============================================================================
// Promise wrappers, because the Cosmos SDK for Node was written in the dark ages
// ===============================================================================

function createDbPromise() {
  return new Promise(function(resolve, reject) {
    client.createDatabase({id: DBNAME}, (err, res) => { if(err) reject(err); resolve(res) });
  });
}

function deleteCollPromise() {
  return new Promise(function(resolve, reject) {
    client.deleteCollection(collectionUrl, (err, res) => { if(err) reject(err); resolve(res) });
  });
}

function createCollPromise() {
  return new Promise(function(resolve, reject) {
    client.createCollection(`dbs/${DBNAME}`, { id: COLLNAME, partitionKey : { paths: ["/doctype"], kind: "Hash" } }, (err, res) => { if(err) reject(err); resolve(res) });
  });
}

function createDocPromise(doc) {
  return new Promise(function(resolve, reject) {
    client.createDocument(collectionUrl, doc, (err, res) => { if(err) reject(err); resolve(res) });
  });
}
