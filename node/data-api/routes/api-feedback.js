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
  res.type('application/json');
  res.app.get('data').createFeedback(feedback)
    .then(data => utils.sendData(res, data.ops[0]))
    .catch(err => utils.sendError(res, err));
})

module.exports = routes;