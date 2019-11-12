const Service = require('./service')
const Feedback = require('../models/feedback');

//
// CRUD service for events
//
class FeedbackService extends Service {
  constructor() {
    // Get an instance of the Feedback model
    const feedbackModel = new Feedback().getInstance();
    // Pass it to the superclass
    super(feedbackModel);
  }
};

module.exports = FeedbackService;