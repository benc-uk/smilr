//
// Routing controllers for other API routes
// ----------------------------------------------
// Ben C, March 2018
//

const express = require('express');
const routes = express.Router();
const os = require('os');
const fs = require('fs');
const utils = require('../lib/utils');

//
// GET info - Return system info and other debugging details 
//
routes
.get('/api/info', function (req, res, next) {
  res.type('application/json');
  
  var info = { 
    version: require('../package.json').version,
    hostname: os.hostname(), 
    container: fs.existsSync('/.dockerenv'), 
    osType: os.type(), 
    osRelease: os.release(), 
    arch: os.arch(),
    cpuModel: os.cpus()[0].model, 
    cpuCount: os.cpus().length, 
    memory: Math.round(os.totalmem() / 1048576),
    nodeVer: process.version,
    buildInfo: process.env.BUILD_INFO || "No build info",
    releaseInfo: process.env.RELEASE_INFO || "No release info",
    mongoDb: {
      connected: req.app.get('data').db.serverConfig.isConnected(),
      host: req.app.get('data').db.serverConfig.host,
      port: req.app.get('data').db.serverConfig.port,
      driverVer: req.app.get('data').db.serverConfig.clientInfo.driver.version
    }
  }  

  utils.sendData(res, info)
})

//
// Catch annoying favicon.ico & robot.txt requests
//
routes
.get('/favicon.ico', function (req, res, next) {
  res.status(204).send();
})
.get('/robots*.txt', function (req, res, next) {
  res.status(204).send();
})

module.exports = routes;
