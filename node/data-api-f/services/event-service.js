const Service = require('./service')
const Event = require('../models/event');

class EventService extends Service {
  constructor() {
    const event = new Event().getInstance();
    super(event);
  }
};

module.exports = EventService;