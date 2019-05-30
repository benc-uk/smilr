//
// Routing controllers for the feedback API
// ----------------------------------------------
// Ben C, March 2018
//

const express = require('express');
const routes = express.Router();
const utils = require('../lib/utils');
const ApiError = require('../lib/api-error');

//
// GET feedback - return array of feedback for specific eventid and topicid
//
routes.get('(/api)?/feedback/:eventid/:topicid', async function (req, res, next) {
  try {
    let result = await res.app.get('data').listFeedbackForEventTopic(req.params.eventid, parseInt(req.params.topicid))
    utils.sendData(res, result)
  } catch(err) {
    utils.sendError(res, err, 'feedback-get'); 
  }
})

//
// POST feedback - submit feedback, body should include: event, topic, rating & comment
//
routes.post('(/api)?/feedback', async function(req, res, next) {
  let feedback = req.body;
  let topicId = feedback.topic;
  let eventId = feedback.event;
  
  try {
    // Some simple validation
    if(!feedback.rating || !feedback.topic || !feedback.event) {
      throw new ApiError(`Invalid feedback object, must contain properties: 'rating', 'topic' & 'event'`, 400)
    }

    let event = await res.app.get('data').getEvent(eventId)
    // If no event then return error
    if(!event) { 
      throw new ApiError(`Event does not exist`, 404);
    } else {
      // Scan topics, and return error if not found
      let topicFound = false;
      for (let topic of event.topics) {
        if(topic.id == topicId) { topicFound = true; break; }
      }
      if(!topicFound) 
        throw new ApiError(`Topic does not exist in event`, 400); 

      let result = await res.app.get('data').createFeedback(feedback)
      utils.sendData(res, result.ops[0])
    }    
  } catch(err) {
    utils.sendError(res, err, 'feedback-post'); 
  }
})

module.exports = routes;