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
routes.get('/api/events/filter/:time', function (req, res, next) {
  let time = req.params.time;
  let today = new Date().toISOString().substring(0, 10);
  
  switch(time) {
    case 'active': 
      res.app.get('data').queryEvents({$and: [{start: {$lte: today}}, {end: {$gte: today}}]})
        .then(data => utils.sendData(res, data))
        .catch(err => utils.sendError(res, err, 500, 'data-access-queryEvents'));
      break;
    case 'future': 
      res.app.get('data').queryEvents({start: {$gt: today}})
        .then(data => utils.sendData(res, data))
        .catch(err => utils.sendError(res, err, 500, 'data-access-queryEvents'));
      break;
    case 'past': 
      res.app.get('data').queryEvents({end: {$lt: today}})
        .then(data => utils.sendData(res, data))
        .catch(err => utils.sendError(res, err, 500, 'data-access-queryEvents'));
      break;
    default:
      // If time not valid
      utils.sendError(res, 'Error. Supplied time not valid, must be one of: [active, future, past]', 400, 'parameter-validation');   
  }
})

//
// GET events - return array of all events, probably should have pagination at some point
//
routes.get('/api/events', function (req, res, next) {
  res.app.get('data').queryEvents({})
    .then(data => {   
      if(!data) utils.sendData(res, [])
      else utils.sendData(res, data)
    })
    .catch(err => utils.sendError(res, err, 500, 'data-access-queryEvents'))
})

//
// GET event - return a single event by ID
//
routes.get('/api/events/:id', function (req, res, next) {
  res.app.get('data').getEvent(req.params.id)
    .then(data => {
      // Return 404 if data empty
      if(!data) utils.sendError(res, `Event with id '${req.params.id}' not found`, 404, 'no-event')
      // Otherwise return the event data
      else utils.sendData(res, data)
    })
    .catch(err => utils.sendError(res, err, 500, 'data-access-queryEvents'))
})

//
// POST event - create a new event, call with event body with no id
//
routes.post('/api/events', function (req, res, next) {
  utils.verifyAuthentication(req)
  .then(valid => {
    let event = req.body;

    if(event._id) utils.sendError(res, `Should not POST events with _id in body`, 400, 'event-validation');

    // We send back the new record, which has the new id
    res.app.get('data').createOrUpdateEvent(event, false)
    .then(data => utils.sendData(res, data.ops[0]))
    .catch(err => utils.sendError(res, err, 500, 'data-access-createOrUpdateEvent'));
  })
  .catch(err => utils.sendError(res, err, 401, 'verify-identity-failed'));        
})

//
// PUT event - update an existing event, call with event id
//
routes.put(['/api/events/:id'], function (req, res, next) {
  utils.verifyAuthentication(req)
  .then(valid => {
    let event = req.body;

    // Ensure event id is in body, URL params take priority
    event._id = req.params.id;

    // Note we send back the same event object we receive, Monogo doesn't return it
    res.app.get('data').createOrUpdateEvent(event, false)
    .then(data => {
      if(data.result.n == 0) {
        utils.sendError(res, `No event with id '${event._id}' found to modify`, 404, 'event-update-failed');
        return;
      }
      utils.sendData(res, event);
    })
    .catch(err => utils.sendError(res, err, 500, 'data-access-createOrUpdateEvent'));
  })
  .catch(err => utils.sendError(res, err, 401, 'verify-identity-failed'));        
})

//
// DELETE event - delete single event by ID
//
routes.delete('/api/events/:id', function (req, res, next) {

  utils.verifyAuthentication(req)
  .then(valid => {
    res.app.get('data').deleteEvent(req.params.id)
    .then(data => {
      if(data.deletedCount == 0) utils.sendError(res, `No event with id '${req.params.id}' found to delete`, 404, 'event-delete-failed');
      else utils.sendData(res, {message: `Deleted event '${req.params.id}' ok`})
    })
    .catch(err => utils.sendError(res, err, 500, 'data-access-deleteEvent')); 
  })
  .catch(err => utils.sendError(res, err, 401, 'verify-identity-failed'));  
})

module.exports = routes;