const Service = require('./service')
const Event = require('../models/event');

//
// CRUD service for events
//
class EventService extends Service {
  constructor() {
    // Get an instance of the Event model
    const eventModel = new Event().getInstance();
    // Pass it to the superclass
    super(eventModel);
  }
};

module.exports = EventService;