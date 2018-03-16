require('dotenv').config()
const utils = require('./utils');

class DataAccess {

  constructor() {
    // Unlikely you'll ever want to change these
    this.DBNAME = 'smilrDb';
    this.EVENT_COLLECTION = 'events';
    this.FEEDBACK_COLLECTION= 'feedback'; 
    this.MongoClient = require('mongodb').MongoClient;
  }

  // Only called once
  async connectMongo(connectionString) {
    let err
    if(!this.db) {
      await this.MongoClient.connect(connectionString)
      .then(client => {
        this.client = client;
        this.db = client.db(this.DBNAME)
      })
      .catch(e => {
        err = e
      });
    }
    
    return new Promise((resolve, reject) => {
      if(this.db) { resolve(this.db) }
      else { reject(err) }
    });
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
      return this.db.collection(this.EVENT_COLLECTION).updateOne({_id:event._id}, {$set:event});
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
    return this.db.collection(this.FEEDBACK_COLLECTION).insertOne(feedback)
  }
}

// Create a singleton instance which is exported NOT the class 
const self = new DataAccess();
module.exports = self; //DataAccess;