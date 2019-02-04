const dataAccess = require('../lib/data-access')

module.exports = async function (context, req) {
  context.log('### Serverless Smilr API received request for info');
  const os = require('os');
  const fs = require('fs');

  try {
    await dataAccess.connectMongo(process.env.MONGO_CONNSTR, 3, 5, true)

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
          connected: dataAccess.db.serverConfig.isConnected(),
          host: dataAccess.db.serverConfig.host,
          port: dataAccess.db.serverConfig.port,
          client: dataAccess.db.serverConfig.clientInfo            
      }
    }

    return { status: 200, body: JSON.stringify(info), headers: {'Content-Type': 'application/json'} }
  } catch(err) {
    context.log(`### ERROR! ${err}`)
    return { status: 500, body: err.toString() }
  }
};