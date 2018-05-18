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
      utils.sendError(res, {msg:'Error. Supplied time not valid, must be one of: [active, future, past]'}, 400);   
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
    .catch(err => { utils.sendError(res, err) })
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
      if(!data) utils.sendError(res, {msg: `Event with id '${req.params.id}' not found`}, 404)
      // Otherwise return the event data
      else utils.sendData(res, data)
    })
    .catch(err => { utils.sendError(res, err) })
})

//
// POST event - create a new event, call with event body with no id
//
routes
.post('/api/events', function (req, res, next) {
  if(!utils.verifyCode(req.headers['x-secret'])) { utils.sendError(res, {msg: "Supplied x-secret code not valid"}, 401); return; }

  res.type('application/json');
  let event = req.body;

  if(event._id || event.id) utils.sendError(res, {msg: "Should not POST events with id"}, 400);

  // We send back the new record, which has the new id
  res.app.get('data').createOrUpdateEvent(event, false)
    .then(data => utils.sendData(res, data.ops[0]))
    .catch(err => utils.sendError(res, err));
})

//
// PUT event - update an existing event, call with event body with id
//
routes
.put('/api/events', function (req, res, next) {
  if(!utils.verifyCode(req.headers['x-secret'])) { utils.sendError(res, {msg: "Supplied x-secret code not valid"}, 401); return; }

  res.type('application/json');
  let event = req.body;

  // IMPORTANT! We munge and swap the _id and id fields so it matches MonogDB
  event._id = event.id;
  delete(event.id);

  if(!event._id) utils.sendError(res, {msg: "Should not PUT events without id"}, 400);

  // Note we send back the same event object we receive, Monogo doesn't return it
  res.app.get('data').createOrUpdateEvent(event, false)
    .then(data => {
      if(data.result.n == 0) {
        utils.sendError(res, {msg: `No event with id ${event._id} found to modify`}, 404);
        return;
      }
      utils.sendData(res, event);
    })
    .catch(err => utils.sendError(res, err));
})

//
// DELETE event - delete single event by ID
//
routes
.delete('/api/events/:id', function (req, res, next) {
  if(!utils.verifyCode(req.headers['x-secret'])) { utils.sendError(res, {msg: "Supplied x-secret code not valid"}, 401); return; }

  res.type('application/json');
  res.app.get('data').deleteEvent(req.params.id)
    .then(data => {
      if(data.deletedCount == 0) utils.sendError(res, {msg: `No event with id ${req.params.id} found to delete`}, 404);
      else utils.sendData(res, {msg: `Deleted doc ${req.params.id} ok`})
    })
    .catch(err => utils.sendError(res, err));
})

module.exports = routes;