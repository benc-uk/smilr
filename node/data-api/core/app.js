const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const EventController = require('../controllers/event-controller')
const FeedbackController = require('../controllers/feedback-controller')
const HealthController = require('../controllers/health-controller')
const BulkController = require('../controllers/bulk-controller')
const passport = require('passport')
const logger = require('morgan')

// Load .env file if it exists
require('dotenv').config()

//
// This function is called by server.js and sets up all routes
//
module.exports = {
  create(eventService, feedbackService) {
    const app = express()

    // Set up logging based on environment (set by NODE_ENV)
    if (app.get('env') === 'production') {
      app.use(logger('short'))
    } else {
      app.use(logger('dev'))
    }

    // Allow all CORS and parse any JSON we receive
    app.use(cors())
    app.use(bodyParser.json())

    // Set up main Smilr controllers, wrapping what services have been injected
    const eventController = new EventController(eventService)
    const feedbackController = new FeedbackController(feedbackService)

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
      // Optionally initialize Passport for bearer token validation
      require('../core/auth')(app)
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

    app.get('/foo', (req, res) => {
      res.status(200).send({ d: 3 })
    })

    // Global catch all for all requests not caught by other routes
    // Return a HTTP 404 plus our standard error response JSON
    app.use('*', function (req, res, next) {
      // Fake dummy controller, so we can call _sendError()
      const ctrl = new (require('./controllers/controller'))(null)
      ctrl._sendError(res, new Error('API route not implemented'), 'not-found', 404)
    })

    // Catch annoying favicon.ico & robot.txt requests, return nothing
    app.get(['/favicon.ico', '/robots*.txt'], function (req, res, next) {
      res.sendStatus(204)
    })

    return app
  }
}