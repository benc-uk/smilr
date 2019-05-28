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
routes.get('/api/info', async function (req, res, next) {
  try {
    var info = { 
      // General info
      hostname: os.hostname(), 
      container: fs.existsSync('/.dockerenv'), 
      osType: os.type(), 
      osRelease: os.release(), 
      cpuArch: os.arch(),
      cpuModel: os.cpus()[0].model, 
      cpuCount: os.cpus().length, 
      memory: Math.round(os.totalmem() / 1048576),
      nodeVer: process.version,
      appVersion: require('../package.json').version,
      appBuildInfo: process.env.BUILD_INFO || "No build info",
      appReleaseInfo: process.env.RELEASE_INFO || "No release info",

      // Some info about the DB
      mongoDb: {
        connected: req.app.get('data').db.serverConfig.isConnected(),
        host: req.app.get('data').db.serverConfig.host,
        port: req.app.get('data').db.serverConfig.port,
        driverVer: req.app.get('data').db.serverConfig.clientInfo.driver.version
      }      
    }  

    // MongoDB server version
    var adminDb = req.app.get('data').db.admin();
    let serverStatus = await adminDb.serverStatus();
    info.mongoDb.serverVersion = serverStatus.version;
    
    utils.sendData(res, info)
  } catch(err) {
    utils.sendError(res, err, 'info-failed');
  }
})

module.exports = routes;
