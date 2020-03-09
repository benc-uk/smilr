const Controller = require('./controller');

//
// EventController handles HTTP operations for events
//
class EventController extends Controller {
  constructor(service) { 
    super(service);

    this.timeFilter = this.timeFilter.bind(this);
  }

  // Bound to GET /api/events/filter/:time
  // Returns subset of events matching given time range: past, active or future
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
        return;
    }

    this.query(req, res);
  }
}

module.exports = EventController;

// ===== OpenAPI / Swagger generator comments below  =====

/**
 * This returns ALL events
 * @route GET /api/events
 * @group Events - Operations about events
 * @operationId eventGetAll
 * @returns {Array.<Event>} 200 - An array of events
 * @returns {ProblemDetails.model} 500 - Unexpected error 
 */

/**
 * This returns events matching given time range: past, active or future
 * @route GET /api/events/filter/{time}
 * @group Events - Operations about events
 * @param {enum} time.path.required - Time range to filter on - eg: past,active,future
 * @operationId eventGetFiltered
 * @returns {Array.<Event>} 200 - An array of events
 * @returns {ProblemDetails.model} 500 - Unexpected error 
 */

/**
 * Get a single event
 * @route GET /api/events/{id}
 * @group Events - Operations about events
 * @param {string} id.path.required - Id of event to update
 * @consumes application/json
 * @operationId eventGetSingle
 * @returns {Array.<Event>} 200 - An array of events
 * @returns {ProblemDetails.model} 404 - Event with given id not found
 * @returns {ProblemDetails.model} 500 - Unexpected error 
 */ 

/**
 * Create a new event
 * @route POST /api/events
 * @group Events - Operations about events
 * @param {Event.model} event.body.required - The new event to create
 * @consumes application/json
 * @operationId eventCreate
 * @returns {Array.<Event>} 200 - An array of events
 * @returns {ProblemDetails.model} 400 - Validation error, invalid event
 * @returns {ProblemDetails.model} 500 - Unexpected error 
 */

/**
 * Update an event
 * @route PUT /api/events/{id}
 * @group Events - Operations about events
 * @param {Event.model} event.body.required - The event to update
 * @param {string} id.path.required - Id of event to update
 * @consumes application/json
 * @operationId eventUpdate
 * @returns {Array.<Event>} 200 - An array of events
 * @returns {ProblemDetails.model} 404 - Event with given id not found
 * @returns {ProblemDetails.model} 400 - Validation error, invalid event
 * @returns {ProblemDetails.model} 500 - Unexpected error 
 */ 

/**
 * Delete an event
 * @route DELETE /api/events/{id}
 * @group Events - Operations about events
 * @param {string} id.path.required - ID of event to delete
 * @operationId eventDelete
 * @returns {object} 200 - An confirmation message in JSON
 * @returns {ProblemDetails.model} 404 - Event with given id not found
 * @returns {ProblemDetails.model} 500 - Unexpected error 
 */ 