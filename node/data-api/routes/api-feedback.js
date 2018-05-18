//
// Routing controllers for the feedback API
// ----------------------------------------------
// Ben C, March 2018
//

const express = require('express');
const routes = express.Router();
const utils = require('../lib/utils');

//
// GET feedback - return array of feedback for specific eventid and topicid
//
routes
.get('/api/feedback/:eventid/:topicid', function (req, res, next) {
  res.type('application/json');
  res.app.get('data').listFeedbackForEventTopic(req.params.eventid, parseInt(req.params.topicid))
    .then(data => utils.sendData(res, data))
    .catch(err => utils.sendError(res, err));
})

//
// POST feedback - submit feedback, body should include: event, topic, rating & comment
//
routes
.post('/api/feedback', function (req, res, next) {
  let feedback = req.body;
  let topicId = feedback.topic;
  let eventId = feedback.event;
  // Some simple validation
  if(!feedback.rating || !feedback.topic || !feedback.event) {
    utils.sendError(res, "Invalid feedback object, must contain properties: 'rating', 'topic' & 'event'"); 
    return;
  }

  // Validation - check event & topic exists
  res.app.get('data').getEvent(eventId)
  .then(event => {
    // If no event then return error
    if(!event) { 
      utils.sendError(res, "Event does not exist", 404);
      return;
    } else {
      // Scan topics, and return error if not found
      let topicFound = false;
      for (let topic of event.topics) {
        if(topic.id == topicId) { topicFound = true; break; }
      }
      if(!topicFound) { 
        utils.sendError(res, "Topic does not exist in event", 404); 
        return;
      }

      // Got this far, we have a valid event & topic
      res.app.get('data').createFeedback(feedback)
        .then(data => utils.sendData(res, data.ops[0]))
        .catch(err => utils.sendError(res, err));
    }
  })
  .catch(err => { utils.sendError(res, err) })
})

module.exports = routes;