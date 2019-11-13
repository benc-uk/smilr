const Controller = require('./controller');

//
// FeedbackController handles HTTP operations for feedback
//
class FeedbackController extends Controller {
  constructor(service) { 
    super(service);
  }

  async get(req, res) {
    let eventId = req.params.eventid;
    let topicId = req.params.topicid;

    req.query = { filter: `event=${eventId}&topic=${topicId}` };

    this.query(req, res);
  }
}

module.exports = FeedbackController;