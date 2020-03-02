const Controller = require('./controller');
const EventService = require('../services/event-service');
const FeedbackService = require('../services/feedback-service');

//
// BulkController has no backend DB model or state
//
class BulkController extends Controller {
  constructor(service) { 
    super(service);

    this.load = this.load.bind(this);
  }

  // Bulk load event and feedback data from JSON
  async load(req, res) {
    // We only allow API to be called from localhost
    var trustedIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

    try {
      console.log(`### Bulk load request from IP: ${req.connection.remoteAddress}`);
      if(trustedIps.indexOf(req.connection.remoteAddress) == -1) {
        throw new Error(`Not authorized, only ${trustedIps} allowed`);
      }
      
      let bulkData = req.body;
      let eventData = bulkData.events;   
      let feedbackData = bulkData.feedback;
      let eventCount = 0; 
      let feedbackCount = 0;
      let eventService = new EventService();
      let feedbackService = new FeedbackService();

      for(let event of eventData) {        
        let resp = await eventService.update(event, true)
        console.log(`### Created event: ${resp._id}`);
        eventCount++;
      }

      for(let feedback of feedbackData) {        
        let resp = await feedbackService.insert(feedback)
        console.log(`### Created feedback: ${resp.comment}`);
        feedbackCount++;
      }     

      this._sendData(res, { eventsLoaded: eventCount, feedbackLoaded: feedbackCount });
    } catch(err) {
      this._sendError(res, err);
    }
  }  
}

module.exports = BulkController;

// ===== OpenAPI / Swagger generator comments below  =====

/**
 * Bulk load events and feedback
 * @route POST /api/bulk
 * @group Misc - Misc operations
 * @operationId bulkLoad
 * @param {Bulk.model} bulk.body.required - Bulk payload
 * @returns {object} 200 - Status message
 * @returns {ProblemDetails.model} 500 - Unexpected error 
 */

/**
 * @typedef Bulk
 * @property {Array.<Event>} events.required - Array of events to create
 * @property {Array.<Feedback>} feedback.required  - Array of feedback to create
 */