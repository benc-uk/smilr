const mongoose = require('mongoose')

const SCHEMA_NAME = 'Events'

//
// Hook for validation hoisted up, for re-use in tests and database updateOne & save pre-hooks
//
const preSaveHook = function(next, event) {
  // Create our own id, for historical reasons
  if (!event._id) {
    event._id = _makeId(5)
  }

  if (event.topics.length < 1) {
    next(new Error('ValidationError: event must have at least 1 topic'))
    return
  }
  if (event.start > event.end) {
    next(new Error('ValidationError: start date can not be after end date'))
    return
  }

  next()
}

/**
 * @typedef Event
 * @property {string} _id.required - Id of this event - eg: FOO12
 * @property {string} title.required - Descriptive title - eg: Workshop about cheese
 * @property {enum} type.required - Type of this event - eg: event,hack,lab,workshop
 * @property {string} start.required - Start date in RFC 3339 format - eg: 2020-02-15
 * @property {string} end.required - End date in RFC 3339 format - eg: 2020-02-16
 * @property {Array.<Topic>} topics.required - Topic list
 */

/**
 * @typedef Topic
 * @property {integer} id.required - Id of this topic - eg: 2
 * @property {string} desc.required - Description of the topic - eg: How to make nice cheese
 */

class Event {
  // Set up the Mongoose schema, see https://mongoosejs.com/docs/guide.html
  initSchema() {
    const topicSchema = new mongoose.Schema({
      id:   { type: Number, required: true },
      desc: { type: String, required: true }
    }, { _id : false })

    const eventSchema = new mongoose.Schema({
      _id: { type: String },
      title: { type: String, required: true },
      type:  { type: String, required: true, enum: ['event', 'workshop', 'hack', 'lab'] },
      start: { type: Date,   required: true },
      end:   { type: Date,   required: true },
      topics: { type: [topicSchema], required: true }
    })

    // Middleware for mutation and validation
    eventSchema.pre('save', function(next) { preSaveHook(next, this) })

    // Middleware for validation of updates
    eventSchema.pre('updateOne', function(next) { preSaveHook(next, this._update['$set']) })

    // Create the mongoose model from eventSchema
    mongoose.model(SCHEMA_NAME, eventSchema)
  }

  // Return an instance of Thing model
  getInstance() {
    // Ensure model schema is initialized only once
    if (!mongoose.modelNames().includes(SCHEMA_NAME)) { this.initSchema() }

    return mongoose.model(SCHEMA_NAME)
  }
}

//
// Simple random ID generator, good enough, with len=6 it's a 1:56 billion chance of a clash
//
function _makeId(len) {
  let text = ''
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < len; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

module.exports = Event
module.exports.preSaveHook = preSaveHook
