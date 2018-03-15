const express = require('express');
const routes = express.Router();
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');

// Routes for events API 
//var dataAccess = res.app.get('data');//require('../lib/data-access');

routes
.get('/api/events/filter/:time', function (req, res, next) {
  res.type('application/json');
  let time = req.params.time;
  let today = new Date().toISOString().substring(0, 10);
  
  switch(time) {
    case 'active': 
      res.app.get('data').queryEvents({$and: [{start: {$lte: today}}, {end: {$gte: today}}]})
        .then(data => sendData(res, data))
        .catch(err => sendError(res, err));
      break;
    case 'future': 
      res.app.get('data').queryEvents({start: {$gt: today}})
        .then(data => sendData(res, data))
        .catch(err => sendError(res, err));
      break;
    case 'past': 
      res.app.get('data').queryEvents({end: {$lt: today}})
        .then(data => sendData(res, data))
        .catch(err => sendError(res, err));
      break;
    default:
      // If time not valid
      res.status(400).send({message:'Error. Supplied time not valid, must be one of: [active, future, past]'});      
  }
})

.get('/api/events', function (req, res, next) {
  res.type('application/json');
  res.app.get('data').queryEvents({})
    .then(data => {
      if(!data) sendData(res, [])
      else {
        let unMongoData = data.map(e => {e.id = e._id; delete(e._id); return e});
        sendData(res, unMongoData)
      }
    })
    .catch(err => { res.status(500).send(err)})
})

.get('/api/events/:id', function (req, res, next) {
  res.type('application/json');
  res.app.get('data').getEvent(req.params.id)
    .then(data => {
      // Return 404 if data empty
      if(!data) res.sendStatus(404);
      // Otherwise return the event data
      else sendData(res, data)
    })
    .catch(err => { res.status(500).send(err)})
})

.post('/api/events', function (req, res, next) {
  if(!verifyCode(req.headers['x-secret'])) { res.sendStatus(401); return; }

  res.type('application/json');
  let event = req.body;

  if(event._id || event.id) sendError(res, {message: "Should not POST events with id"});

  // We send back the new record, which has the new id
  res.app.get('data').createOrUpdateEvent(event)
    .then(data => sendData(res, data.ops[0]))
    .catch(err => sendError(res, err));
})

.put('/api/events', function (req, res, next) {
  if(!verifyCode(req.headers['x-secret'])) { res.sendStatus(401); return; }

  res.type('application/json');
  let event = req.body;
  event._id = event.id;

  if(!event._id) sendError(res, {message: "Should not PUT events without id"});

  // Note we send back the same event object we receive, Monogo doesn't return it
  res.app.get('data').createOrUpdateEvent(event)
    .then(data => sendData(res, event))
    .catch(err => sendError(res, err));
})

.delete('/api/events/:id', function (req, res, next) {
  if(!verifyCode(req.headers['x-secret'])) { res.sendStatus(401); return; }

  res.type('application/json');
  res.app.get('data').deleteEvent(req.params.id)
    .then(data => sendData(res, {msg:`Deleted doc ${req.params.id} ok`}))
    .catch(err => sendError(res, err));
})

//
// Try to send back the underlying error code and message
//
function sendError(res, err) {
  console.log(`### Error with events API ${JSON.stringify(err)}`); 
  let code = 500;
  if(err.code > 1) code = err.code;
  res.status(code).send(err);
  return;
}

//
// This sends data back and we change _id to id 
//
function sendData(res, data) {
  // This lets us pretend we're not using Mongo
  data.id = data._id;
  delete data._id;
  res.status(200).send(data)
  return;
}

//
// A bit of security, using TOTP
//
function verifyCode(code) {
  if(!process.env.API_SECRET) return true;
  let jsotp = require('jsotp');
  let totp = jsotp.TOTP(process.env.API_SECRET);
  return totp.verify(code);
}

module.exports = routes;
