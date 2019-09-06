const WORKSPACE_KEY = "KAI8338lcjQbARh+auMBKXxC68DnywnAPffE1La8o3PqccYgo2wdaxy3B9NgWcSgBKKYsapDSoTYZfR1qsa0tg=="
const WORKSPACE_ID = "35f6f2a6-8ff2-4079-84c2-96bcf0ea95ce"

const TABLE_NAME = "LoadTesting"
const BATCH_SIZE = 40000  // Equates to very roughly 10mb chunks
const DATE_TIME_FIELD = "data_time"

//
// Main send to Azure Log Analytics function
//
const postToLogAnalytics = async function(workspaceId, key, rawData, timeField) {
  let data = JSON.stringify(rawData)
  let rfcDate = new Date().toUTCString()

  var contentLength = Buffer.byteLength(data, 'utf8');
  var signature = buildSignature(key, rfcDate, contentLength, 'POST', 'application/json', '/api/logs')
  var authorization = `SharedKey ${workspaceId}:${signature}`
  var headers = {
    'x-ms-date': rfcDate,
    'Log-Type': TABLE_NAME,
    'Authorization': authorization,
    'Content-Length': contentLength
  }
  if(timeField) {
    headers['time-generated-field'] = timeField
  }
  
  // POST the data to the API
  return httpClient.postJSON(`https://${workspaceId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`, data, headers)
  .then(resp => {
    if(resp && resp.statusCode == 200) {
      console.log(`### OK! ${contentLength} bytes of data sent to Log Analytics`);
    } else {
      console.log("### ERROR! ");
    }
  })
  .catch(err => console.log(err))
};

//
// Create a HMAC-SHA256 signature for Log Analytics
//
const buildSignature = function(sharedKey, date, contentLen, method, contentType, resource) {
  let headers = 'x-ms-date:' + date
  let stringToSign = method + "\n" + contentLen + "\n" + contentType + "\n" + headers + "\n" + resource 
  let decodedKey = new Buffer.from(sharedKey, 'base64')
  let hmac = require('crypto').createHmac('sha256', decodedKey).update(stringToSign, 'utf-8')
  return hmac.digest('base64')
};

//
// Mini HTTP client library so we don't have to import 'request'
//
const httpClient = { }
httpClient.postJSON = function(url, data, headers = {}) {
  let req = require('url').parse(url);
  req.headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
  Object.assign(req.headers, headers);
  req.method = 'POST';

  return this._rawHttpRequest(req, data)
    .then((resp) => {return resp})
    .catch((err) => console.error(err));
};
httpClient._rawHttpRequest = function(req, sendbody = null) {
  return new Promise((resolve, reject) => {
    const lib = req.protocol && req.protocol.startsWith('https') ? require('https') : require('http');
    const request = lib.request(req, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed, status code: ' + response.statusCode));
      }
      let body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(response));
    });
    request.on('error', (err) => reject(err));
    if(sendbody) request.write(sendbody);
    request.end();
  })
};


/* =================================================================================== */

async function loadData(filename, runName, workspaceId, workspaceKey) {
  var databatch = []      // Batch of results
  var interface = readline.createInterface({
    input: fs.createReadStream(filename),
    console: false
  });
  
  // Handle the last batch 
  interface.on('close', async (line) =>{
    await postToLogAnalytics(workspaceId, workspaceKey, databatch, DATE_TIME_FIELD)
  })

  // Main loop over all lines in fine
  for await (const line of interface) {
    data = JSON.parse(line)
    data.runName = runName
    databatch.push(data)

    // Batch data into reasonable chunks, the Log Analytics API has a 30mb per POST limit
    if(databatch.length > BATCH_SIZE) {
      await postToLogAnalytics(workspaceId, workspaceKey, databatch, DATE_TIME_FIELD)
      databatch = [] // Clear this batch out
    }    
  }
}

/* =================================================================================== */

const fs = require('fs');
const readline = require('readline');

console.log("\n══════════════════════════════════════════════")
console.log("📈  K6 to Azure Log Analytics Data Loader 🚀");
console.log("══════════════════════════════════════════════\n")

var filename = process.argv[2]
var runName = process.argv[3]
var workspaceId = process.argv[4]
var workspaceKey = process.argv[5]
if(!filename || !runName || !workspaceId || !workspaceKey) {
  console.log(`### ERROR! Missing arguments\n`)
  console.log(`### USAGE: node k6ToAzure.js {filename} {runName} {workspaceId} {workspaceKey}`)
  console.log(`###   {filename}     - Path to JSON file to be imported`)
  console.log(`###   {runName}      - Name to give this run, can be any string`)
  console.log(`###   {workspaceId}  - Azure Log Analytics workspace id`)
  console.log(`###   {workspaceKey} - Azure Log Analytics workspace shared key\n`)
  process.exit(1)
}
if (!fs.existsSync(filename)) {
  console.log(`### ERROR! ${filename} does not exist`)
  process.exit(1)
}

console.log(`### Will process file: ${filename}`)
loadData(filename, runName, workspaceId, workspaceKey);
