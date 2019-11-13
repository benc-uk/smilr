//
// Routing controllers for the event API
// ----------------------------------------------
// Ben C, March 2018
//

const express = require('express');
const routes = express.Router();
const utils = require('../lib/utils');
const ApiError = require('../lib/api-error');
const passport = require('passport');

//
// GET events - return array of events; with time range filter (active, future, past)
//
routes.get('(/api)?/events/filter/:time', async function(req, res, next) {
  let time = req.params.time;
  let today = new Date().toISOString().substring(0, 10);
  let query = {}

  try {
    switch(time) {
      case 'active': 
        query = { $and: [{start: {$lte: today}}, {end: {$gte: today}}] };
        break;
      case 'future': 
        query = { start: {$gt: today} };
        break;
      case 'past': 
        query = { end: {$lt: today} };
        break;
      default:
        throw new ApiError('Error. Supplied time value not valid, must be one of: [active, future, past]', 400);
    }

    let events = await res.app.get('data').queryEvents(query);
    if(!events) events = [];

    utils.sendData(res, events);
  } catch(err) {
    utils.sendError(res, err, 'event-get');
  }
})

//
// GET events - return array of all events, probably should have pagination at some point
//
routes.get('(/api)?/events', async function(req, res, next) {
  try {
    let events = await res.app.get('data').queryEvents({});
    if(!events) events = [];

    utils.sendData(res, events);
  } catch(err) {
    utils.sendError(res, err, 'event-get');
  }
})

//
// GET event - return a single event by ID
//
routes.get('(/api)?/events/:id', async function(req, res, next) {
  try {
    let event = await res.app.get('data').getEvent(req.params.id);
    if(!event) throw new ApiError(`Event with id '${req.params.id}' not found`, 404);

    utils.sendData(res, event)
  } catch(err) {
    utils.sendError(res, err, 'event-get');
  }
})

//
// Setup protection on 'admin' routes or bypass if SECURE_CLIENT_ID isn't set
//
// Default is a passthrough handler, with means no auth or protection on routes
let authHandler = function(req, res, next) { 
  next(); 
}
if(process.env.SECURE_CLIENT_ID) {
  // Validate bearer token with oauth scheme see lib/auth.js
  authHandler = passport.authenticate('oauth-bearer', { session: false })
} 

//
// POST event - create a new event, call with event body with no id
//
routes.post(['(/api)?/events'], authHandler, async function(req, res, next) {
  try {
    let event = req.body;
    // Don't send me an id, we don't want it
    if(event._id) 
      throw new ApiError(`Should not POST events with _id in body`, 400);
    // Date validation
    if(event.start > event.end) 
      throw new ApiError(`Event start date should be before end date`, 400);

    // Create the event and check for errors
    let result = await res.app.get('data').createOrUpdateEvent(event, false)
    if(!result || !result.ops)
      throw new ApiError(`Failed to create event in database`);

    utils.sendData(res, result.ops[0])
  } catch(err) {
    utils.sendError(res, err, 'event-create');
  }  
});

//
// PUT event - update an existing event, call with event id
//
routes.put(['(/api)?/events/:id'], authHandler, async function(req, res, next) {
  try {
    // Event object must be the body
    let event = req.body;
    // Ensure event id is in body, URL params take priority
    event._id = req.params.id;
    
    // Date validation
    if(event.start > event.end)
      throw new ApiError(`Event start date should be before end date`, 400);

    // Test for type modification - as it is shard key it can not be changed
    oldEvent = await res.app.get('data').getEvent(req.params.id);
    if(!oldEvent) 
      throw new ApiError(`Failed to modify event '${event._id}', it does not exist`, 404);
    if(oldEvent.type != event.type) 
      throw new ApiError(`Event type can not be changed`, 400);

    // Modify the event in the database
    result = await res.app.get('data').createOrUpdateEvent(event, false)
    if(!result || result.result.n == 0) 
      throw new ApiError(`Failed to modify event '${event._id}', something bad happened`);

    // Note we send back the same event object we receive, Mongo doesn't return it
    utils.sendData(res, event);
  } catch(err) {
    utils.sendError(res, err, 'event-update');
    return;
  }
});

//
// DELETE event - delete single event by ID
//
routes.delete('(/api)?/events/:id', authHandler, async function(req, res, next) {
  try {
    let event = await res.app.get('data').getEvent(req.params.id);  
    if(event) {
      let result = await res.app.get('data').deleteEvent(req.params.id, event.type) 
      if(!result || result.deletedCount == 0)
        throw new ApiError(`Event '${req.params.id}' was not deleted`, 500) 
    } else {
      throw new ApiError(`No event with id '${req.params.id}' found to delete`, 404);
    }
    
    utils.sendData(res, {message: `Deleted event '${req.params.id}' ok`});
  } catch(err) {
    utils.sendError(res, err, 'event-delete');
  }
});

module.exports = routes;