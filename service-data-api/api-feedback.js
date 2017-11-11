const express = require('express');
const routes = express.Router();
const DataAccess = require('./data-access');
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');
var data = new DataAccess();

// Routes for feedback API 

routes
.get('/api/feedback/:eventid/:topicid', function (req, res, next) {
  res.type('application/json');
  data.listFeedbackForEventTopic(req.params.eventid, parseInt(req.params.topicid))
    .then(d => res.send(d))
    .catch(e => res.status(400).send(e));
})

.post('/api/feedback', function (req, res, next) {
  let feedback = req.body;
  res.type('application/json');
  data.createFeedback(feedback)
    .then(d => res.send(d))
    .catch(e => res.status(400).send(e));
})

module.exports = routes;
