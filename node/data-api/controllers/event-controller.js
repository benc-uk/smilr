const Controller = require('./controller');

//
// EventController handles HTTP operations for events
//
class EventController extends Controller {
  constructor(service) { 
    super(service);

    this.timeFilter = this.timeFilter.bind(this);
  }

  async timeFilter(req, res) {
    let today = new Date().toISOString().substring(0, 10);

    switch(req.params.time) {
      case 'active': 
        req.query = {filter: `start=<=${today}&end=>=${today}`};
        break;
      case 'future': 
        req.query = {filter: `start=>${today}`};
        break;
      case 'past': 
        req.query = {filter: `end=<${today}`};
        break;
      default:
        this._sendError(res, new Error("ValidationError: Supplied time value must be one of: [active, future, past]"));
    }

    this.query(req, res);
  }
}

module.exports = EventController;