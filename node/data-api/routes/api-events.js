//
// Routing controllers for the event API
// ----------------------------------------------
// Ben C, March 2018
//

const express = require('express');
const routes = express.Router();
const utils = require('../lib/utils');

//
// GET events - return array of events; with time range filter (active, future, past)
//
routes
.get('/api/events/filter/:time', function (req, res, next) {
  res.type('application/json');
  let time = req.params.time;
  let today = new Date().toISOString().substring(0, 10);
  
  switch(time) {
    case 'active': 
      res.app.get('data').queryEvents({$and: [{start: {$lte: today}}, {end: {$gte: today}}]})
        .then(data => utils.sendData(res, data))
        .catch(err => utils.sendError(res, err));
      break;
    case 'future': 
      res.app.get('data').queryEvents({start: {$gt: today}})
        .then(data => utils.sendData(res, data))
        .catch(err => utils.sendError(res, err));
      break;
    case 'past': 
      res.app.get('data').queryEvents({end: {$lt: today}})
        .then(data => utils.sendData(res, data))
        .catch(err => utils.sendError(res, err));
      break;
    default:
      // If time not valid
      res.status(400).send({message:'Error. Supplied time not valid, must be one of: [active, future, past]'});      
  }
})

//
// GET events - return array of all events, probably should have pagination at some point
//
routes
.get('/api/events', function (req, res, next) {
  res.type('application/json');
  res.app.get('data').queryEvents({})
    .then(data => {   
      if(!data) utils.sendData(res, [])
      else utils.sendData(res, data)
    })
    .catch(err => { res.status(500).send(err)})
})

//
// GET event - return a single event by ID
//
routes
.get('/api/events/:id', function (req, res, next) {
  res.type('application/json');
  res.app.get('data').getEvent(req.params.id)
    .then(data => {
      // Return 404 if data empty
      if(!data) res.sendStatus(404);
      // Otherwise return the event data
      else utils.sendData(res, data)
    })
    .catch(err => { res.status(500).send(err)})
})

//
// POST event - create a new event, call with event body with no id
//
routes
.post('/api/events', function (req, res, next) {
  if(!utils.verifyCode(req.headers['x-secret'])) { res.sendStatus(401); return; }

  res.type('application/json');
  let event = req.body;

  if(event._id || event.id) utils.sendError(res, {message: "Should not POST events with id"});

  // We send back the new record, which has the new id
  res.app.get('data').createOrUpdateEvent(event)
    .then(data => utils.sendData(res, data.ops[0]))
    .catch(err => utils.sendError(res, err));
})

//
// PUT event - update an existing event, call with event body with id
//
routes
.put('/api/events', function (req, res, next) {
  if(!utils.verifyCode(req.headers['x-secret'])) { res.sendStatus(401); return; }

  res.type('application/json');
  let event = req.body;
  event._id = event.id;

  if(!event._id) utils.sendError(res, {message: "Should not PUT events without id"});

  // Note we send back the same event object we receive, Monogo doesn't return it
  res.app.get('data').createOrUpdateEvent(event)
    .then(data => utils.sendData(res, event))
    .catch(err => utils.sendError(res, err));
})

//
// DELETE event - delete single event by ID
//
routes
.delete('/api/events/:id', function (req, res, next) {
  if(!utils.verifyCode(req.headers['x-secret'])) { res.sendStatus(401); return; }

  res.type('application/json');
  res.app.get('data').deleteEvent(req.params.id)
    .then(data => {
      if(data.deletedCount == 0) res.sendStatus(404);
      else utils.sendData(res, {msg:`Deleted doc ${req.params.id} ok`})
    })
    .catch(err => utils.sendError(res, err));
})

module.exports = routes;