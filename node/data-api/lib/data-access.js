require('dotenv').config()

class DataAccess {

  constructor() {
    // Unlikely you'll ever want to change these
    this.DBNAME = 'smilrDb';
    //this.COLLNAME = 'alldata';
    this.EVENT_COLLECTION = 'events';
    this.FEEDBACK_COLLECTION= 'feedback'; 
    this.MongoClient = require('mongodb').MongoClient;
  }

  // Only called once
  async connectMongo() {
    let err
    if(!this.db) {
      await this.MongoClient.connect(process.env.MONGO_URL)
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
      event._id = this.makeId(5);
      event.doctype = this.EVENT_PKEY;
      return this.db.collection(this.EVENT_COLLECTION).insertOne(event);
    }
  }

  //
  // Data access methods for feedback documents
  //

  listFeedbackForEventTopic(eventid, topicid) {
    return new Promise((resolve, reject) => {
      let q = `SELECT * FROM d WHERE d.doctype='${this.FEEDBACK_PKEY}' AND d.event = '${eventid}' AND d.topic = ${topicid}`;
      this.client.queryDocuments(this.collectionUrl, q).toArray((err, res) => {
        if (err) { reject(err) }
        else { resolve(res) };
      });
    });
  }

  createFeedback(feedback) {
    // Just discovered that Cosmos does this for us! Creates a GUID
    //feedback.id = this.makeId(6);
    feedback.doctype = this.FEEDBACK_PKEY;
    return new Promise((resolve, reject) => {
      this.client.createDocument(this.collectionUrl, feedback, (err, res) => {
        if (err) reject(err)
        else resolve(res);
      });
    });
  }

  // Simple random ID generator, good enough, with len=6 it's a 1:56 in billion chance of a clash
  makeId(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

}

// Create a singleton instance which is exported NOT the class 
const self = new DataAccess();
module.exports = self; //DataAccess;