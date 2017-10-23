require('dotenv').config()
var azure = require('azure-storage');
var path = require('path');
const uuid = require('uuid/v4');

// Tables and primary keys
const TABLE_NAME = 'jimiTable';
const TOPIC_TABLE_PKEY = 'topic';
const FEEDBACK_TABLE_PKEY = 'feedback';

// Constructor
function DataAccess() {
   // Connect to Azure storage
   console.log('### Connecting to storage account ', process.env.APPSETTING_STORAGE_ACCOUNT);
   this.tableSvc =  azure.createTableService(process.env.APPSETTING_STORAGE_ACCOUNT, process.env.APPSETTING_STORAGE_KEY);
}

DataAccess.prototype.getAllTopics = function () {
   var query = new azure.TableQuery().where('PartitionKey eq ?', TOPIC_TABLE_PKEY);
   // Must use arrow function here to preserve context and access to this
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

DataAccess.prototype.getTopic = function (id) {
   var query = new azure.TableQuery().where('PartitionKey eq ?', TOPIC_TABLE_PKEY);
   // Must use arrow function here to preserve context and access to this
   return new Promise((resolve, reject) => {
      this.tableSvc.retrieveEntity(TABLE_NAME, TOPIC_TABLE_PKEY, id, function (error, result) {
         if (!error) {
            resolve( prepareModel(result) );
         } else {
            reject(error);
         }
      });
   });
};

DataAccess.prototype.getAllFeedback = function () {
   var query = new azure.TableQuery().where('PartitionKey eq ?', FEEDBACK_TABLE_PKEY);
   // Must use arrow function here to preserve context and access to this
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
      this.tableSvc.insertEntity(TABLE_NAME, feedback, function (error, result) {
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
         topic_data = seedData.topics;   
         feedback_data = seedData.feedback;   
         var topic_batch = new azure.TableBatch();
         var feedback_batch = new azure.TableBatch();
         for (var i = 0; i < topic_data.length; i++) {
            var topic = {
               PartitionKey: { '_': TOPIC_TABLE_PKEY },
               RowKey: { '_': topic_data[i].id.toString() },
               desc: { '_': topic_data[i].desc }
            };
            topic_batch.insertOrReplaceEntity(topic, { echoContent: true });
         }
         for (var i = 0; i < feedback_data.length; i++) {
            var feedback = {
               PartitionKey: { '_': FEEDBACK_TABLE_PKEY },
               RowKey: { '_': uuid() },
               topic: { '_': feedback_data[i].topic },
               rating: { '_': feedback_data[i].rating },
               comment: { '_': feedback_data[i].comment }
            };
            feedback_batch.insertOrReplaceEntity(feedback, { echoContent: true });
         }         
      } catch(e) {
         reject({message:e.message, statusCode:500});
      }
      var that = this;
      this.tableSvc.executeBatch(TABLE_NAME, topic_batch, function (error, result, response) {
         if (!error) {
            that.tableSvc.executeBatch(TABLE_NAME, feedback_batch, function (error, result, response) {
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
   }
   // Copy RowKey to id, making the model cleaner, and hide some of the Azure Table mess away
   obj.id = obj.RowKey;
   delete obj.RowKey;
   delete obj.PartitionKey;

   return obj;
}

