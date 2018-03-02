require('dotenv').config()

class DataAccess {

  constructor() {
    // Unlikely you'll ever want to change these
    this.DBNAME = 'smilrDb';
    this.COLLNAME = 'alldata';
    this.EVENT_PKEY = 'event';
    this.FEEDBACK_PKEY = 'feedback'; 

    // Load Cosmos config from env vars / app settings
    this.cosmosEndpoint = process.env.COSMOS_ENDPOINT;
    let cosmosKey = process.env.COSMOS_KEY;

    // Connect to Azure Cosmos DB
    const documentClient = require("documentdb").DocumentClient;
    console.log('### Will use Cosmos DB instance:', this.cosmosEndpoint);
    this.client = new documentClient(this.cosmosEndpoint, { "masterKey": cosmosKey });
    this.collectionUrl = `dbs/${this.DBNAME}/colls/${this.COLLNAME}`;
  }

  //
  // Data access methods for event documents
  //

  queryEvents(query) {
    return new Promise((resolve, reject) => {
      let q = `SELECT * FROM event WHERE event.doctype='${this.EVENT_PKEY}' AND ${query}`;
      this.client.queryDocuments(this.collectionUrl, q).toArray((err, res) => {
        if (err) { reject(err) }
        else { resolve(res) };
      });
    });
  }

  getEvent(id) {
    let docUrl = `${this.collectionUrl}/docs/${id}` 
    return new Promise((resolve, reject) => {
      // The partitionKey part is poorly documented required magic
      this.client.readDocument(docUrl, { partitionKey: this.EVENT_PKEY }, (err, res) => {
        if (err) { reject(err) }
        else { resolve(res) };
      });
    });
  }

  deleteEvent(id) {
    let docUrl = `${this.collectionUrl}/docs/${id}` 
    return new Promise((resolve, reject) => {
      // The partitionKey part is poorly documented required magic
      this.client.deleteDocument(docUrl, { partitionKey: this.EVENT_PKEY }, (err, res) => {
        if (err) { reject(err) }
        else { resolve({msg:`Deleted doc ${id} ok`}) };
      });
    });
  }

  createOrUpdateEvent(event) {
    if (event.id) {
      return new Promise((resolve, reject) => {
        let docUrl = `${this.collectionUrl}/docs/${event.id}` 
        this.client.replaceDocument(docUrl, event, (err, res) => {
          if (err) reject(err)
          else resolve(res);
        });
      });
    } else {
      // Create a random short-code style id for new events, 
      event.id = this.makeId(5);
      event.doctype = this.EVENT_PKEY;
      return new Promise((resolve, reject) => {
        this.client.createDocument(this.collectionUrl, event, (err, res) => {
          if (err) reject(err)
          else resolve(res);
        });
      });
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

  getCosmosInfo() {
    return this.cosmosEndpoint+'/'+this.collectionUrl;
  }
}

// Create a singleton instance which is exported NOT the class 
const self = new DataAccess();
module.exports = self;