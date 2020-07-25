const mongoose = require('mongoose')
const axios = require('axios')

const SCHEMA_NAME = 'Feedback'

//
// Hook for validation hoisted up, for re-use in tests and database updateOne & save pre-hooks
//
const preSaveHook = async function(next, feedback, eventService) {
  let event = await eventService.fetchOne(feedback.event)
  if (event instanceof Error) {
    next(new Error(`ValidationError: event: ${feedback.event} does not exist`))
  } else {
    // Scan topics, and return error if not found
    let topicFound = false
    for (let topic of event.topics) {
      if (topic.id == feedback.topic) { topicFound = true; break }
    }
    if (!topicFound) {
      next(new Error(`ValidationError: topic: ${feedback.topic} does not exist in event: ${feedback.event}`))
    }
  }

  // OPTIONAL - Handle sentiment analysis if it has been configured
  if (process.env.SENTIMENT_API_ENDPOINT && feedback.comment && feedback.comment.length > 0)  {
    try {
      feedback = await _sentimentScore(feedback)
      console.log(`### Got sentiment score: ${feedback.sentiment}`)
    } catch (err) {
      console.log('### WARN! sentimentScore failed, but it won\'t prevent feedback being saved')
      console.log(err.toString())
    }
  }

  next()
}

/**
 * @typedef Feedback
 * @property {string} event.required - Event id - eg: FOO12
 * @property {integer} topic.required - Topic id - eg: 3
 * @property {number} rating.required - Rating score - eg: 4
 * @property {string} comment - Optional comments - eg: This is was really interesting
 * @property {number} sentiment - Sentiment score - eg: 0.542
 */

class Feedback {
  // Set up the Mongoose schema, see https://mongoosejs.com/docs/guide.html
  initSchema() {
    const schema = new mongoose.Schema({
      event: { type: String, required: true },
      topic: { type: Number, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, maxlength: 512 },
      sentiment: { type: Number }
    })

    // Middleware for mutation and validation
    // EventService is used to validate the event referenced in the feedback exists
    const EventService = require('../services/event-service')
    const service = new EventService()
    schema.pre('save', async function(next) { await preSaveHook(next, this, service) })

    // Create the mongoose model from eventSchema
    mongoose.model(SCHEMA_NAME, schema, 'feedback')
  }

  // Return an instance of Thing model
  getInstance() {
    // Ensure model schema is initialized only once
    if (!mongoose.modelNames().includes(SCHEMA_NAME)) { this.initSchema() }

    return mongoose.model(SCHEMA_NAME)
  }
}

//
// Used for sentiment analysis of comments
//
/* istanbul ignore next */
const _sentimentScore = async function(feedback) {
  // API payload
  let payload = {
    documents: [{
      language: 'en',
      id: '1',
      text: feedback.comment
    }]
  }

  // Headers with API key
  let options = {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.SENTIMENT_API_KEY || '',
      'Content-Type': 'application/json'
    }
  }

  // Call sentiment API with axios
  let apiResp = await axios.default.post(`${process.env.SENTIMENT_API_ENDPOINT}/text/analytics/v2.1/sentiment`, JSON.stringify(payload), options)
  if (apiResp.data && apiResp.data.documents) {
    // Mutate feedback object and add sentiment score we got
    feedback.sentiment = apiResp.data.documents[0].score
  }

  return feedback
}

module.exports = Feedback
module.exports.preSaveHook = preSaveHook
