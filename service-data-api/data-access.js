require('dotenv').config()
var azure = require('azure-storage');
var path = require('path');
const uuid = require('uuid/v4');

// Tables and primary keys
const TABLE_NAME = 'jimiTable';
const EVENT_TABLE_PKEY = 'event';
const FEEDBACK_TABLE_PKEY = 'feedback';

// Constructor
function DataAccess() {
   // Connect to Azure storage
   console.log('### Connecting to storage account ', process.env.STORAGE_ACCOUNT);
   this.tableSvc =  azure.createTableService(process.env.STORAGE_ACCOUNT, process.env.STORAGE_KEY);
}

DataAccess.prototype.queryEvents = function (query) {
  console.log(query);
   var query = new azure.TableQuery().where('PartitionKey eq ?', EVENT_TABLE_PKEY)
                                     .and(query);
   
   return new Promise((resolve, reject) => {
      this.tableSvc.queryEntities(TABLE_NAME, query, null, function (error, result) {
         if (!error) {
            resolve( result.entries.map(t => prepareModel(t)) );
         } else {
            reject(error);
         }
      });
   });
};

DataAccess.prototype.getEvent = function (id) {
   var query = new azure.TableQuery().where('PartitionKey eq ?', EVENT_TABLE_PKEY);
   
   return new Promise((resolve, reject) => {
      this.tableSvc.retrieveEntity(TABLE_NAME, EVENT_TABLE_PKEY, id, function (error, result) {
         if (!error) {
            resolve( prepareModel(result) );
         } else {
            reject(error);
         }
      });
   });
};

DataAccess.prototype.createOrUpdateEvent = function (event) {
  event.PartitionKey = EVENT_TABLE_PKEY;
  
  if(event.id) {
    // Update with RowKey
    event.RowKey = event.id;
  } else {
    // Create a random id for RowKey
    event.RowKey = makeId(6);
  }

  // Need to stringify topics array for Azure Tables
  let topicsArray = event.topics;
  event.topics = JSON.stringify(event.topics);

  return new Promise((resolve, reject) => {
     this.tableSvc.insertOrReplaceEntity(TABLE_NAME, event, function (error, result) {
        if (!error) {
          // Clean up for returning the result, topics needs to be array again!
          event.topics = topicsArray;
          event.id = event.RowKey
          delete event.RowKey;
          delete event.PartitionKey;
          resolve(event);
        } else {
          reject(error);
        }
     });
  });
};

DataAccess.prototype.deleteEvent = function (id) {
  let event = {
    PartitionKey: {'_': EVENT_TABLE_PKEY},
    RowKey: {'_': id}
  };

  return new Promise((resolve, reject) => {
     this.tableSvc.deleteEntity(TABLE_NAME, event, function (error, result) {
        if (!error) {
           resolve(result);
        } else {
           reject(error);
        }
     });
  });
};

DataAccess.prototype.listFeedbackForEventTopic = function (eventid, topicid) {
   var query = new azure.TableQuery()
   .where('PartitionKey eq ?', FEEDBACK_TABLE_PKEY)
   .and("event eq ?", eventid)
   .and("topic eq ?", topicid);

   return new Promise((resolve, reject) => {
      this.tableSvc.queryEntities(TABLE_NAME, query, null, function (error, result) {
         if (!error) {
            resolve( result.entries.map(t => prepareModel(t)) );
         } else {
            reject(error);
         }
      });
   });
};

DataAccess.prototype.createFeedback = function (feedback) {
   feedback.PartitionKey = FEEDBACK_TABLE_PKEY;
   // Create a random UUID for RowKey because why not
   feedback.RowKey = uuid();
   return new Promise((resolve, reject) => {
      this.tableSvc.insertOrReplaceEntity(TABLE_NAME, feedback, function (error, result) {
         if (!error) {
            resolve(result);
         } else {
            reject(error);
         }
      });
   });
};

//
// Data admin functions
// 
DataAccess.prototype.deleteTable = function () {
   return new Promise((resolve, reject) => {
      this.tableSvc.deleteTableIfExists(TABLE_NAME, function (error, result, response) {
         if (!error) {
            console.log("### Table deleted! ");
            resolve(result);
         } else {
            console.log("### Table delete error! ");
            reject(error);
         }         
      });
   });
}

DataAccess.prototype.createTable = function () {
   return new Promise((resolve, reject) => {
      this.tableSvc.createTableIfNotExists(TABLE_NAME, function (error, result, response) {
         if (!error) {
            console.log("### Table created! ");
            resolve(result);
         } else {
            console.log("### Table create error! ");
            reject(error);
         }         
      });
   });
}

// Horrific mess to load seed data into table
DataAccess.prototype.populate = function () {
   return new Promise((resolve, reject) => {
      console.log("### Table populating ");
      try {
         var seedData = JSON.parse(require('fs').readFileSync('seed-data.json', 'utf8'));
         eventData = seedData.events;   
         feedbackData = seedData.feedback;   
         var eventBatch = new azure.TableBatch();
         var feedbackBatch = new azure.TableBatch();
         for (var i = 0; i < eventData.length; i++) {
            var event = {
               PartitionKey: { '_': EVENT_TABLE_PKEY },
               RowKey: { '_': eventData[i].id },
               title: { '_': eventData[i].title },
               type: { '_': eventData[i].type },
               start: { '_': eventData[i].start },
               end: { '_': eventData[i].end },
               topics: { '_': JSON.stringify(eventData[i].topics) }
            };
            eventBatch.insertOrReplaceEntity(event, { echoContent: true });
         }
         for (var i = 0; i < feedbackData.length; i++) {
            var feedback = {
               PartitionKey: { '_': FEEDBACK_TABLE_PKEY },
               RowKey: { '_': uuid() },
               event: { '_': feedbackData[i].event },
               topic: { '_': feedbackData[i].topic },
               rating: { '_': feedbackData[i].rating },
               comment: { '_': feedbackData[i].comment }
            };
            feedbackBatch.insertOrReplaceEntity(feedback, { echoContent: true });
         }         
      } catch(e) {
         reject({message:e.message, statusCode:500});
      }
      console.log(eventBatch);
      console.log(feedbackBatch);
      var that = this;
      this.tableSvc.executeBatch(TABLE_NAME, eventBatch, function (error, result, response) {
         if (!error) {
            that.tableSvc.executeBatch(TABLE_NAME, feedbackBatch, function (error, result, response) {
               if (!error) {
                  resolve(result);
               } else {
                  reject(error);
               }
            });
            resolve(result);
         } else {
            reject(error);
         }         
      });
   });
}

// export the class
module.exports = DataAccess;


// ------------ Util functions from here ------------- //

// Object flattener - moves sub-properties referenced by underscore - THANKS AZURE TABLES!!!
// Also fudges RowKey to id mapping
function prepareModel(obj) {
   for (prop in obj) {
      obj[prop] = obj[prop]._;

      // As Azure Tables isn't a real document store, we need to do this I guess. Meh.
      // Reinflate topics from serialised form
      if(prop === 'topics') {
        obj['topics'] = JSON.parse(obj['topics'] );
      }
   }
   // Copy RowKey to id, making the model cleaner, and hide some of the Azure Table mess away
   obj.id = obj.RowKey;
   delete obj.RowKey;
   delete obj.PartitionKey;

   return obj;
}

//
// Simple random ID generator, good enough, with len=6 it's a 1:56 in billion chance of a clash
//
function makeId(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;    
}