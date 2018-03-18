//
// Routing controllers for other API routes
// ----------------------------------------------
// Ben C, March 2018
//

const express = require('express');
const routes = express.Router();
const os = require('os');
const fs = require('fs');

//
// GET info - Return system info and other debugging details 
//
routes
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
    mongoDb: {
      connected: req.app.get('data').db.serverConfig.isConnected(),
      host: req.app.get('data').db.serverConfig.host,
      port: req.app.get('data').db.serverConfig.port,
      client: req.app.get('data').db.serverConfig.clientInfo
    }
  }  

  res.send(info);
})


module.exports = routes;
