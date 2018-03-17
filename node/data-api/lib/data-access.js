const utils = require('./utils');
const URL = require('url');

class DataAccess {

  constructor() {
    // Unlikely you'll ever want to change these
    this.DBNAME = 'smilrDb';
    this.EVENT_COLLECTION = 'events';
    this.FEEDBACK_COLLECTION= 'feedback'; 
    this.MongoClient = require('mongodb').MongoClient;
  }

  //
  // Connect to mongo, with retry logic
  //
  async connectMongo(connectionString, retries) {
    let err
    let retry = 0;
    let mongoHost = URL.parse(connectionString).host;

    while(true) {
      console.log(`### Connection attempt ${retry+1} to MongoDB server ${mongoHost}`)

      if(!this.db) {
        await this.MongoClient.connect(connectionString)
        .then(db => {
          // Switch DB and create if it doesn't exist
          this.db = db.db(this.DBNAME);
          console.log(`### Yay! Connected to MongoDB server`)
        })
        .catch(e => {
          err = e
        });
      }

      if(!this.db) {
        retry++;        
        if(retry < retries) {
          console.log(`### MongoDB connection attempt failed, retying in 2 seconds`);
          await utils.sleep(2000);
          continue;
        }
      }
      
      return new Promise((resolve, reject) => {
        if(this.db) { resolve(this.db) }
        else { reject(err) }
      });
    }
  }

  //
  // Data access methods for event documents
  //

  queryEvents(query) {
    return this.db.collection(this.EVENT_COLLECTION).find(query).toArray();
  }

  getEvent(id) {
    return this.db.collection(this.EVENT_COLLECTION).findOne({_id:id})
  }

  deleteEvent(id) {
    return this.db.collection(this.EVENT_COLLECTION).deleteOne({_id:id})
  }

  createOrUpdateEvent(event) {
    if (event._id) {
      return this.db.collection(this.EVENT_COLLECTION).updateOne({_id:event._id}, {$set:event}, {upsert:true});
    } else {
      // Create a random short-code style id for new events, 
      event._id = utils.makeId(5);
      return this.db.collection(this.EVENT_COLLECTION).insertOne(event);
    }
  }

  //
  // Data access methods for feedback documents
  //

  listFeedbackForEventTopic(eventid, topicid) {
    return this.db.collection(this.FEEDBACK_COLLECTION).find({$and: [{event: eventid}, {topic: topicid}]}).toArray();
  }

  createFeedback(feedback) {
    // We have to create our own id as a string, because Azure Functions can't handle mongo's self generated ids
    feedback._id = utils.makeId(12);
    return this.db.collection(this.FEEDBACK_COLLECTION).insertOne(feedback)
  }
}

// Create a singleton instance which is exported NOT the class 
const self = new DataAccess();
module.exports = self; //DataAccess;