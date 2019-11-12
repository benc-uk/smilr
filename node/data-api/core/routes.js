
const EventController = require('../controllers/event-controller');
const EventService = require('../services/event-service');
const FeedbackController = require('../controllers/feedback-controller');
const FeedbackService = require('../services/feedback-service');
const HealthController = require('../controllers/health-controller');

//
// This function is called by server.js and sets up all routes
//
module.exports = (app) => {
  // Set up main Smilr controllers
  const eventController = new EventController(new EventService());
  const feedbackController = new FeedbackController(new FeedbackService());

  // Health controller has no model
  const healthController = new HealthController(null);

  // Event endpoints, full CRUD + some extra
  app.post('/api/events',       eventController.create);
  app.get('/api/events/:id',    eventController.get);
  app.get('/api/events',        eventController.query);
  app.put('/api/events/:id',    eventController.update);
  app.delete('/api/events/:id', eventController.delete);
  app.get('/api/events/filter/:time', eventController.timeFilter);

  // Feedback endpoints, just get and post
  app.get('/api/feedback/:eventid/:topicid', feedbackController.get)
  app.post('/api/feedback',                  feedbackController.create)

  // Health and info endpoints
  app.get(['/api/health(z)?', '/api/info'],  healthController.get)
}