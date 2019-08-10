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
const ApiError = require('../lib/api-error');

//
// GET info - Return system info and other debugging details 
//
routes.get('(/api)?/info', async function (req, res, next) {
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
      sentimentAPI: process.env.SENTIMENT_API_ENDPOINT || "Sentiment API not enabled",

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

//
// POST bulk - load data in bulk, only allow from localhost
//
routes.post('(/api)?/bulk', async function (req, res, next) {
  var trustedIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  try {
    console.log(`### Bulk load request from ${req.connection.remoteAddress}`);
    if(trustedIps.indexOf(req.connection.remoteAddress) == -1) {
      throw new ApiError(`Not authorized, only ${trustedIps} allowed`, 401);
    }

    let bulkData = req.body;
    let eventData = bulkData.events;   
    let feedbackData = bulkData.feedback;
    let eventCount = 0; feedbackCount = 0;

    for(let event of eventData) {        
      var e = await res.app.get('data').createOrUpdateEvent(event, true);
      console.log(`### Created event ${e.result}`);
      eventCount++;
    }
    for(let feedback of feedbackData) {        
      var f = await res.app.get('data').createFeedback(feedback);
      console.log(`### Created feedback ${f.ops[0]._id}`);
      feedbackCount++;
    }
    
    utils.sendData(res, { eventsLoaded: eventCount, feedbackLoaded: feedbackCount})
  } catch(err) {
    utils.sendError(res, err, 'bulk-failed');
  }
})

module.exports = routes;
