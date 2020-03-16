
const EventController = require('../controllers/event-controller')
const EventService = require('../services/event-service')
const FeedbackController = require('../controllers/feedback-controller')
const FeedbackService = require('../services/feedback-service')
const HealthController = require('../controllers/health-controller')
const BulkController = require('../controllers/bulk-controller')
const passport = require('passport')

//
// This function is called by server.js and sets up all routes
//
module.exports = (app) => {
  // Set up main Smilr controllers
  const eventController = new EventController(new EventService())
  const feedbackController = new FeedbackController(new FeedbackService())

  // Utility/stateless controllers with no models
  const healthController = new HealthController(null)
  const bulkController = new BulkController(null)

  // Setup protection on 'admin' routes or bypass if SECURE_CLIENT_ID isn't set
  // Default is a passthrough handler, with means no auth or protection on routes
  let authHandler = function(req, res, next) {
    next()
  }
  if (process.env.SECURE_CLIENT_ID) {
    // Validate bearer token with oauth scheme see lib/auth.js
    authHandler = passport.authenticate('oauth-bearer', { session: false })
  }

  // Event endpoints, full CRUD + some extra
  app.get('/api/events/:id', eventController.get)
  app.get('/api/events', eventController.query)
  app.get('/api/events/filter/:time',  eventController.timeFilter)
  // These routes are protected with authHandler
  app.post('/api/events', authHandler, eventController.create)
  app.put('/api/events/:id', authHandler, eventController.update)
  app.delete('/api/events/:id', authHandler, eventController.delete)

  // Feedback endpoints, just get and post
  app.get('/api/feedback/:eventid/:topicid', feedbackController.get)
  app.post('/api/feedback', feedbackController.create)

  // Health and info endpoints
  app.get(['/api/health(z)?', '/api/info'], healthController.get)

  // Bulk load data
  app.post('/api/bulk', bulkController.load)
}