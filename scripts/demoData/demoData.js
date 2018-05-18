#!/usr/bin/node
require('dotenv').config()
console.log(`### DB init script starting...`);

// Unlikely you'll ever want to change these
var DBNAME = 'smilrDb';
var EVENT_COLLECTION = 'events';
var FEEDBACK_COLLECTION= 'feedback'; 
var MongoClient = require('mongodb').MongoClient;

// monogUrl settings from commandline params or from env vars 
// Note. Default is to fall back to localhost
var monogUrl = process.argv[2] || process.env.MONGO_CONNSTR || "mongodb://localhost";

// Default is to NOT wipe the db, pass in this value to override
var wipe = process.argv[3] || process.env.WIPE_DB || 0;

//
// Start the process
//
initDb()
.then(() => {
  console.log(`### Done! Exiting`);
  process.exit(0);
})
.catch(err => { console.log(`### Bad thing ${err}`); });

//
// Worker function
//
async function initDb() {
  var dataAccess = require('../../node/data-api/lib/data-access');

  // Connect to Mongo 
  await dataAccess.connectMongo(monogUrl);

  // Drop database unless we don't!
  if(wipe == 1) {
    console.log(`### Dropping Smilr collections! ...`);
    // Note we consume any errors
    await dataAccess.db.collection('events').drop().catch(e => {})
    await dataAccess.db.collection('feedback').drop().catch(e => {})
  }

  // Load source demo data
  let seedData = JSON.parse(require('fs').readFileSync('source-data.json', 'utf8'));
  let eventData = seedData.events;   
  let feedbackData = seedData.feedback;  
  for(let event of eventData) {        
    var e = await dataAccess.createOrUpdateEvent(event, true);
    console.log(`### Created event ${e.result}`);
  }
  for(let feedback of feedbackData) {        
    var f = await dataAccess.createFeedback(feedback);
    console.log(`### Created feedback ${f.ops[0]._id}`);
  }
}