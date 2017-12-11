const express = require('express');
const routes = express.Router();
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');

// Routes for events API 
var dataAccess = require('../lib/data-access');

routes
.get('/api/events/filter/:time', function (req, res, next) {
  res.type('application/json');
  let time = req.params.time;
  //if(req.params.time) {
    let today = new Date().toISOString().substring(0, 10);
    
    switch(time) {
      case 'active': 
        dataAccess.queryEvents(`event["start"] <= '${today}' AND event["end"] >= '${today}'`) //`start le '${today}' and end ge '${today}'`
          .then(d => res.send(d))
          .catch(e => res.status(400).send(e));
        break;
      case 'future': 
        dataAccess.queryEvents(`event["start"] > '${today}'`) //`start gt '${today}'`
          .then(d => res.send(d))
          .catch(e => res.status(400).send(e));
        break;
      case 'past': 
        dataAccess.queryEvents(`event["end"] < '${today}'`) //`end lt '${today}'`
          .then(d => res.send(d))
          .catch(e => res.status(400).send(e));
        break;
      default:
        // If time not valid
        res.status(400).send({message:'Error. Supplied time not valid, must be one of: [active, future, past]'});      
    }
  //} else {
  //  // If time omitted, return all events
  //  dataAccess.queryEvents('true')
  //    .then(d => res.send(d))
  //    .catch(e => res.status(400).send(e));    
  //}
})

.get('/api/events', function (req, res, next) {
  res.type('application/json');
  dataAccess.queryEvents('true')
    // Return a single entity
    .then(d => res.send(d)) 
    .catch(e => res.status(400).send(e));
})

.get('/api/events/:id', function (req, res, next) {
  res.type('application/json');
  dataAccess.getEvent(req.params.id)
    // Return a single entity
    .then(d => res.send(d)) 
    .catch(e => res.status(400).send(e));
})

.post('/api/events', function (req, res, next) {
  res.type('application/json');
  let event = req.body;

  dataAccess.createOrUpdateEvent(event)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(400).send(e));
})

.put('/api/events', function (req, res, next) {
  res.type('application/json');
  let event = req.body;

  dataAccess.createOrUpdateEvent(event)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(400).send(e));
})

.delete('/api/events/:id', function (req, res, next) {
  res.type('application/json');

  dataAccess.deleteEvent(req.params.id)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(400).send(e));
})

module.exports = routes;
