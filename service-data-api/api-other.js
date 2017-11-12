const express = require('express');
const routes = express.Router();
const DataAccess = require('./data-access');
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');
var data = new DataAccess();

// Admin and db maintenance routes

routes
.get('/api/dbinit', function (req, res, next) {
  res.type('application/json');
  data.initDatabase()
    .then(d => res.send(d))
    .catch(e => res.status(400).send(e));  
})

.get('/api/info', function (req, res, next) {
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
    nodeVer: process.version,
    cosmosDb: data.getCosmosInfo()
  }  
  res.send(info);
})

.get('*', function (req, res, next) {
  res.sendStatus(400);
})

module.exports = routes;
