const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
const dataAccess = require('./data-access');
const uuidv4 = require('uuid/v4');
var data = new dataAccess();

// Routes for topics API 

routes
.get('/api/topics', function (req, res, next) {
  res.type('application/json');
  data.getAllTopics()
    .then(d => res.send(d))
    .catch(e => res.status(e.statusCode).send(e));
})

.get('/api/topics/:id', function (req, res, next) {
  res.type('application/json');
  data.getTopic(req.params.id)
    .then(d => res.send(d))
    .catch(e => res.status(e.statusCode).send(e));
})

// Routes for feedback API 

routes
.get('/api/feedback', function (req, res, next) {
  res.type('application/json');
  data.getAllFeedback()
    .then(d => res.send(d))
    .catch(e => res.status(e.statusCode).send(e));
})

routes
.post('/api/feedback', function (req, res, next) {
  var feedback = req.body;
  res.type('application/json');
  data.createFeedback(feedback)
    .then(d => res.send(d))
    .catch(e => res.status(e.statusCode).send(e));
})

// Admin and db maintenance routes

.get('/api/db/delete', function (req, res, next) {
  res.type('application/json');
  data.deleteTable()
    .then(d => res.send(d))
    .catch(e => res.status(e.statusCode).send(e));  
})

.get('/api/db/create', function (req, res, next) {
  res.type('application/json');
  data.createTable()
    .then(d => res.send(d))
    .catch(e => res.status(e.statusCode).send(e));  
})

.get('/api/db/seed', function (req, res, next) {
  res.type('application/json');
  data.populate()
    .then(d => res.send(d))
    .catch(e => res.status(e.statusCode).send(e));  
})

.get('*', function (req, res, next) {
  res.send(400);
})

module.exports = routes;
