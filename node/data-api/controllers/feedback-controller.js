const Controller = require('./controller')

//
// FeedbackController handles HTTP operations for feedback
//
class FeedbackController extends Controller {
  constructor(service) {
    super(service)
  }

  async get(req, res) {
    let eventId = req.params.eventid
    let topicId = req.params.topicid

    // Inject query into req object
    req.query = { filter: `event=${eventId}&topic=${topicId}` }

    return super.query(req, res)
  }
}

module.exports = FeedbackController

// ===== OpenAPI / Swagger generator comments below  =====

/**
 * This returns all feedback for a given event and topic
 * @route GET /api/feedback/{eventid}/{topicid}
 * @group Feedback - Operations about feedback
 * @operationId feedbackGet
 * @param {string} eventid.path.required - Id of event containing topic
 * @param {integer} topicid.path.required - Id of topic to leave feedback on
 * @returns {Array.<Feedback>} 200 - An array of feedback, empty array if topic or event not found
 * @returns {ProblemDetails.model} 500 - Unexpected error
 */

/**
 * This submit new feedback
 * @route POST /api/feedback
 * @group Feedback - Operations about feedback
 * @operationId feedbackCreate
 * @param {Feedback.model} feedback.body.required - The feedback to submit
 * @returns {Feedback.model} 200 - Feedback object with id
 * @returns {ProblemDetails.model} 400 - Validation error with feedback
 * @returns {ProblemDetails.model} 500 - Unexpected error
 */
