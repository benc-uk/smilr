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

      // Sentiment scoring - optional
      // Only score feedback with comment text and API endpoint is set
      if(process.env.SENTIMENT_API_ENDPOINT && feedback.comment && feedback.comment.length > 0)  {
        try {
          feedback = await sentimentScore(feedback);
        } catch(err) {
          console.log(`### WARN! sentimentScore failed, but it won't prevent feedback being saved`)
          console.log(err); 
        }
      }

      let result = await res.app.get('data').createFeedback(feedback)
      utils.sendData(res, result.ops[0])
    }    
  } catch(err) {
    utils.sendError(res, err, 'feedback-post'); 
  }
})

//
// Process feedback for sentiment analysis using Azure cognitive services
//
function sentimentScore(feedback) {
  // API payload
  let payload = {
    documents: [
      {
        language: "en",
        id: "1",
        text: feedback.comment
      }
    ]
  }
  
  // API request
  let req = {
    method: 'POST',
    uri: `${process.env.SENTIMENT_API_ENDPOINT}/text/analytics/v2.1/sentiment`,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.SENTIMENT_API_KEY || "",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }
  
  // Call API wrapped in a promise
  return new Promise(function (resolve, reject) {
    require('request')(req, function (error, res, body) {
      if (!error && res.statusCode == 200) {        
        let apiResp = JSON.parse(body);
        
        if(!apiResp.documents || apiResp.documents.length == 0) {
          reject({statusCode: res.statusCode, error: apiResp.errors || 'Unknown API problem'})
          return;
        }
        
        console.log(`### sentimentScore: ${apiResp.documents[0].score}`);

        // Mutate feedback object and inject sentiment score
        feedback.sentiment = apiResp.documents[0].score;
        resolve(feedback);
      } else {
        reject({statusCode: res.statusCode || '-1', error: error});
      }
    });
  });
}

module.exports = routes;