const mongoose = require ('mongoose');

const SCHEMA_NAME = 'Events';

/**
 * @typedef Event
 * @property {string} title.required - Title of this event
 */

class Event {
  // Set up the Mongoose schema, see https://mongoosejs.com/docs/guide.html
  initSchema() {
    const topicSchema = new mongoose.Schema({
      id:   { type: Number, required: true },
      desc: { type: String, required: true }
    },{ _id : false });

    const eventSchema = new mongoose.Schema({
      _id: { type: String },
      title: { type: String, required: true },
      type:  { type: String, required: true, enum: ['event', 'workshop', 'hack', 'lab'] },
      start: { type: Date, required: true },
      end:   { type: Date, required: true },
      topics: { type: [topicSchema], required: true }
    });
    
    // Middleware for mutation and validation
    eventSchema.pre('save', function(next) {
      var event = this;
      
      // Create our own id, for historical reasons 
      if(!event._id) {
        event._id = _makeId(5);
      }

      if(event.topics.length < 1) {
        next(new Error("ValidationError: event must have at least 1 topic"));
      }

      if(event.start > event.end) {
        next(new Error("ValidationError: start date can not be after end date"));
      }
  
      next();
    });

    // Create the mongoose model from eventSchema
    mongoose.model(SCHEMA_NAME, eventSchema);
  }

  // Return an instance of Thing model
  getInstance() {
    // Ensure model schema is initialized only once
    if(!mongoose.modelNames().includes(SCHEMA_NAME))
      this.initSchema();

    return mongoose.model(SCHEMA_NAME);
  }
}

//
// Simple random ID generator, good enough, with len=6 it's a 1:56 billion chance of a clash
//
function _makeId(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = Event;