const Service = require('./service')
const fs = require('fs')
const Feedback = require('../../models/feedback')
const querystring = require('querystring')

const MSG_NO_RESULT = 'No matching docs with given id'

//
// ******** MOCK *********
// CRUD service for feedback
// ******** MOCK *********
//
class FeedbackService extends Service {
  constructor() {
    // Get an instance of the Event model
    const eventModel = new Feedback().getInstance()
    // Pass it to the superclass
    super(eventModel)

    // Load mock data
    const mockDataDir = __dirname+'/../../../../testing/mock-data'
    const mockJson = fs.readFileSync(`${mockDataDir}/feedback.json`)
    this.mockData = JSON.parse(mockJson)

    this.preSaveHook = Feedback.preSaveHook
  }

  // Override due to extra params passed to the preSaveHook
  async insert(data) {
    let model = new this.model(data)

    // Manually call validation, as we're not running with a DB
    let validationErrs = model.validateSync()
    if (validationErrs) { return validationErrs }

    // Manually call pre save hook(s), as we're not running with a DB
    // Note. we pass a EventService as it calls it to check for event existence
    const EventService = require('./event-service')
    const eventSvc = new EventService()
    await this.preSaveHook((nextResult) => {
      if (nextResult) { throw nextResult }
    }, model, eventSvc)

    this.mockData.push(model)
    return model
  }

  query(q) {
    // Query with filter on time ranges
    if (q.filter) {
      const parsedQuery = querystring.parse(q.filter)
      const feedback = this.mockData.find((f) => f.event == parsedQuery.event && f.topic == parsedQuery.topic)
      console.log('fffffffffff', feedback)
      if (feedback) { return feedback } else { return new Error(MSG_NO_RESULT) }
    }

    return super.query(q)
  }
}

module.exports = FeedbackService