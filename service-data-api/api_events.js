const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
const dataAccess = require('./data-access');
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');
var data = new dataAccess();

// Routes for events API 

routes
.get('/api/events', function (req, res, next) {
  res.type('application/json');

  if(req.query.mode) {
    let today = new Date().toISOString().substring(0, 10);
    switch(req.query.mode) {
      case 'active': 
        data.queryEvents(`start le '${today}' and end ge '${today}'`)
          .then(d => res.send(d))
          .catch(e => res.status(e.statusCode).send(e));
        break;
      case 'future': 
        data.queryEvents(`start gt '${today}'`)
          .then(d => res.send(d))
          .catch(e => res.status(e.statusCode).send(e));
        break;
      case 'past': 
        data.queryEvents(`end lt '${today}'`)
          .then(d => res.send(d))
          .catch(e => res.status(e.statusCode).send(e));
        break;
      default:
        // Return all events
        data.queryEvents('true')
          .then(d => res.send(d))
          .catch(e => res.status(e.statusCode).send(e));      
    }
  } else {
    // If mode omitted, return all events
    data.queryEvents('true')
      .then(d => res.send(d))
      .catch(e => res.status(e.statusCode).send(e));    
  }
})

.get('/api/events/:id', function (req, res, next) {
  res.type('application/json');
  data.getEvent(req.params.id)
    .then(d => res.send(d))
    .catch(e => res.status(e.statusCode).send(e));
})

.post('/api/events', function (req, res, next) {
  res.type('application/json');
  let event = req.body;

  data.createOrUpdateEvent(event)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(e.statusCode).send(e));
})

.put('/api/events', function (req, res, next) {
  res.type('application/json');
  let event = req.body;

  data.createOrUpdateEvent(event)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(e.statusCode).send(e));
})

.delete('/api/events/:id', function (req, res, next) {
  res.type('application/json');

  data.deleteEvent(req.params.id)
    .then(d => res.status(200).send(d))
    .catch(e => res.status(e.statusCode).send(e));
})

module.exports = routes;
