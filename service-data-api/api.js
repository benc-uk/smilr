const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
const dataAccess = require('./data-access');
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');
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

.get('/api/admin/info', function (req, res, next) {
  res.type('application/json');
  var info = { 
    hostname: os.hostname(), 
    container: fs.existsSync('/.dockerenv'), 
    osType: os.type(), 
    osRelease: os.release(), 
    arch: os.arch(),
    cpuModel: os.cpus()[0].model, 
    cpuCount: os.cpus().length, 
    memory: Math.round(os.totalmem() / 1048576),
    siteName: process.env.WEBSITE_SITE_NAME ? process.env.WEBSITE_SITE_NAME.split('-')[0] : 'Local',
    nodeVer: process.version
  }  
  res.send(info);
})

.get('*', function (req, res, next) {
  res.send(400);
})

module.exports = routes;
