const express = require('express');
const routes = express.Router();
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');

var dataAccess = require('../lib/data-access');

// Routes for feedback API 

routes
.get('/api/feedback/:eventid/:topicid', function (req, res, next) {
  res.type('application/json');
  dataAccess.listFeedbackForEventTopic(req.params.eventid, parseInt(req.params.topicid))
    .then(d => res.send(d))
    .catch(e => sendError(res, e));
})

.post('/api/feedback', function (req, res, next) {
  let feedback = req.body;
  res.type('application/json');
  dataAccess.createFeedback(feedback)
    .then(d => res.send(d))
    .catch(e => sendError(res, e));
})

//
// Try to send back the underlying error code and message
//
function sendError(res, err) {
  console.log(`### Error with feedback API ${JSON.stringify(err)}`); 
  let code = 500;
  if(err.code > 1) code = err.code;
  res.status(code).send(err);
  return;
}

module.exports = routes;
