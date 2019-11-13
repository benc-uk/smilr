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