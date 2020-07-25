const Service = require('./service')
const Event = require('../../models/event')
const fs = require('fs')

//
// ******** MOCK *********
// CRUD service for events
// ******** MOCK *********
//
class EventService extends Service {
  constructor() {
    // Get an instance of the Event model
    const eventModel = new Event().getInstance()
    // Pass it to the superclass
    super(eventModel)

    // Load mock data
    const mockDataDir = __dirname+'/../../../../testing/mock-data'
    const mockJson = fs.readFileSync(`${mockDataDir}/events.json`)
    this.mockData = JSON.parse(mockJson)

    this.preSaveHook = Event.preSaveHook
  }

  query(q) {
    // Query with filter on time ranges
    if (q.filter) {
      let filterF = function() { return false }
      let date = q.filter.match(/\d+-\d+-\d+/)[0]
      if (q.filter.includes('start') && q.filter.includes('end')) {
        filterF = function(e) { return e.start <= date && e.end >= date }
      } else if (q.filter.includes('end')) {
        filterF = function(e) { return e.end < date }
      } else if (q.filter.includes('start')) {
        filterF = function(e) { return e.start > date }
      }
      return this.mockData.filter(filterF)
    }

    return super.query(q)
  }
}

module.exports = EventService