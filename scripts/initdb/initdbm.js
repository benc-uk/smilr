#!/bin/node
require('dotenv').config()
console.log(`### DB init script starting...`);

// Unlikely you'll ever want to change these
var DBNAME = 'smilrDb';
var EVENT_COLLECTION = 'events';
var FEEDBACK_COLLECTION= 'feedback'; 
var MongoClient = require('mongodb').MongoClient;

// Cosmos settings from commandline params or from env vars 
var monogUrl = process.argv[2] || process.env.MONGO_CONNSTR;
if(!monogUrl) {
  console.log("### MONGO_CONNSTR must be specified");
  console.log("### This can be done via env vars, creating a .env file or passing as parameter to the sctipt");
  process.exit(0);
}

initDb()
.then(() => {
  console.log(`### Done! Exiting`);
  process.exit(0);
})
.catch(err => { console.log(`### Bad thing ${err.body}`); });

async function initDb() {
  var dataAccess = require('../../node/data-api/lib/data-access');

  // Connect to Mongo 
  await dataAccess.connectMongo(monogUrl);
  dataAccess.db.dropDatabase();

  // Load seed data
  let seedData = JSON.parse(require('fs').readFileSync('seed-data.json', 'utf8'));
  let eventData = seedData.events;   
  let feedbackData = seedData.feedback;  
  for(let event of eventData) {        
    await dataAccess.createOrUpdateEvent(event);
    console.log(`### Created event ${event.id}`);
  }
  for(let feedback of feedbackData) {        
    await dataAccess.createFeedback(feedback);
    console.log(`### Created feedback ${feedback.id}`);
  }
}