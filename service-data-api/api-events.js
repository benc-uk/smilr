const express = require('express');
const routes = express.Router();
const DataAccess = require('./data-access');
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');
var data = new DataAccess();

// Routes for events API 

routes
.get('/api/events', function (req, res, next) {
  res.type('application/json');

  if(req.query.time) {
    let today = new Date().toISOString().substring(0, 10);
    
    switch(req.query.time) {
      case 'active': 
        data.queryEvents(`d["start"] <= '${today}' AND d["end"] >= '${today}'`) //`start le '${today}' and end ge '${today}'`
          .then(d => res.send(d))
          .catch(e => res.status(400).send(e));
        break;
      case 'future': 
        data.queryEvents(`d["start"] > '${today}'`) //`start gt '${today}'`
          .then(d => res.send(d))
          .catch(e => res.status(400).send(e));
        break;
      case 'past': 
        data.queryEvents(`d["end"] < '${today}'`) //`end lt '${today}'`
          .then(d => res.send(d))
          .catch(e => res.status(400).send(e));
        break;
      default:
        // If time not valid
        res.status(400).send({message:'Error. Supplied time not valid, must be one of: [active, future, past]'});      
    }
  } else {
    // If time omitted, return all events
    data.queryEvents('true')
      .then(d => res.send(d))
      .catch(e => res.status(400).send(e));    
  }
})

.get('/api/events/:id', function (req, res, next) {
  res.type('application/json');
  data.getEvent(req.params.id)
    // Return a single entity
    .then(d => res.send(d)) 
    .catch(e => res.status(400).send(e));
})

.post('/api/events', function (req, res, next) {
  res.type('application/json');
  let event = req.body;

  data.createOrUpdateEvent(event)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(400).send(e));
})

.put('/api/events', function (req, res, next) {
  res.type('application/json');
  let event = req.body;

  data.createOrUpdateEvent(event)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(400).send(e));
})

.delete('/api/events/:id', function (req, res, next) {
  res.type('application/json');

  data.deleteEvent(req.params.id)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(400).send(e));
})

module.exports = routes;
