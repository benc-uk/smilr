require('dotenv').config()
var express = require('express');
var app = express();
var cors = require('cors');
var path = require('path');
var azure = require('azure-storage');
var bodyParser = require('body-parser')
var public = __dirname + '/public';

console.log(`### Starting up, NODE_ENV is ${process.env.NODE_ENV}`);

// Can override location of the public folder, handy when running locally, e.g `node server.js ../dist`
if(process.argv[2]) {
    public = process.argv[2]
}

// Can't remember if this is important, leaving for now
app.use(cors());
app.use(bodyParser.json());

// Change if you like
const TABLE_NAME = 'thingTable';
const TABLE_PKEY = 'things';

// In prod mode we connect to Azure storage, and the API talks to that
// In dev mode the API here is redundant (in mem version used) so we just serve static content
if(process.env.NODE_ENV == 'production' || process.env.NODE_ENV == null) {
    console.log("### Running in production mode, so will connect to Azure storage account...");
    
    // We need these set or it's impossible to continue
    if(!process.env.APPSETTING_STORAGE_ACCOUNT || !process.env.APPSETTING_STORAGE_KEY) {
        console.log("### !ERROR! Missing env variables `APPSETTING_STORAGE_ACCOUNT` or `APPSETTING_STORAGE_KEY`. Exiting!");
        process.exit(1)
    }

    // Note APPSETTING_STORAGE_ACCOUNT and APPSETTING_STORAGE_KEY are required to be set
    var tablesvc = azure.createTableService(process.env.APPSETTING_STORAGE_ACCOUNT, process.env.APPSETTING_STORAGE_KEY);
}

// GET - List all things
app.get('/api/things', function (req, res) {
   var query = new azure.TableQuery().where('PartitionKey eq ?', TABLE_PKEY);

   tablesvc.queryEntities(TABLE_NAME, query, null, function (error, result, response) {
      if (!error) {
         result.entries.map(thing => flattenObject(thing));
         res.type('application/json');
         res.send( result.entries );
      }
   });
});

// GET - Single thing by id
app.get('/api/things/:id', function (req, res) {
   tablesvc.retrieveEntity(TABLE_NAME, TABLE_PKEY, req.params.id, function (error, result, response) {
      if (!error) {
         res.type('application/json');
         res.send(flattenObject(result) );
      }
   });
});

// PUT - Update single thing by id
app.put('/api/things/:id', function (req, res) {
   var thing = req.body;
   thing.PartitionKey = TABLE_PKEY;
   tablesvc.replaceEntity(TABLE_NAME, thing, function (error, result, response) {
      if (!error) {
         res.type('application/json');
         res.send( {message: `Thing ${thing.RowKey} was updated OK`} );
      }
   });
});

// POST - Create new thing 
app.post('/api/things', function (req, res) {
   var thing = req.body;
   thing.PartitionKey = TABLE_PKEY;

   var maxrowkey = 0;
   var query = new azure.TableQuery().where('PartitionKey eq ?', TABLE_PKEY);
   tablesvc.queryEntities(TABLE_NAME, query, null, function (error, result, response) {
      if (!error) {
         result.entries.sort((g1, g2) => g2.RowKey._ - g1.RowKey._);
         maxrowkey = result.entries[0].RowKey._;
         thing.RowKey = (parseInt(maxrowkey) + 1).toString();
         res.type('application/json');
         tablesvc.insertEntity(TABLE_NAME, thing, function (error, result, response) {
            if (!error) {
               res.status(200).send({ message: `Thing added to table OK, with RowKey ${thing.RowKey}`} );
            } else {
               res.status(500).send({ message: `Error creating thing: '${error.message}'` });
            }
         });
      } else {
         res.status(500).send(error.message)
      }
   });
});

// DELETE - Remove single thing by id
app.delete('/api/things/:id', function (req, res) {
    var thing = { PartitionKey: { '_': TABLE_PKEY }, RowKey: { '_': req.params.id } };
    tablesvc.deleteEntity(TABLE_NAME, thing, function (error, result, response) {
        res.type('application/json');
        if (!error) {
            res.status(200).send({ message: `Thing ${thing.RowKey._} was deleted OK` });
        } else {
            res.status(500).send({ message: `Error deleting thing: '${error.message}'` });
        }
    });
});

// GET - Init the database, wipe and reset data
app.get('/api/initdb', function (req, res) {
   tablesvc.deleteTableIfExists(TABLE_NAME, function (error, result, response) {
      if (!error) {
         console.log("### DB Init started. Table deleted, going to re-create it in 10secs... ");
         setTimeout(createTable, 10000);
      } else {
         console.error(error)
      }
   });
   res.type('application/json');
   res.status(200).send({ message:"Database init started. It should take ~40 seconds" })
});

// GET - Status check 
app.get('/api/status', function (req, res) {
   tablesvc.listTablesSegmented(null, function (error, result, response) {
      var message = {}

      message.APPSETTING_STORAGE_ACCOUNT = process.env.APPSETTING_STORAGE_ACCOUNT;
      message.APPSETTING_STORAGE_KEY_EXISTS = (process.env.APPSETTING_STORAGE_KEY.length > 0);
      message.TABLE_SVC_EXISTS = (tablesvc != null);

      if (!error) {
         message.TABLE_LIST = result.entries;
      } else {
         message.ERROR = "Error with storage account, could not list tables";
      }
      
      res.status(200).send(message);
   })

});

// GET - Search. Honestly this is junk, but Table Storage doesn't support wildcard/text querying  
app.get('/api/things/search/:q', function (req, res) {
   var query = new azure.TableQuery().where('PartitionKey eq ?', TABLE_PKEY);
   tablesvc.queryEntities(TABLE_NAME, query, null, function (error, result, response) {
      if (!error) {
         var srch_results = [];
         // Lets do a brute force full index string match search because we're idiots
         for(let r of result.entries) {
            if(r.name._.toString().toLowerCase().includes(req.params.q.toLowerCase())) {
               srch_results.push(flattenObject(r));
            }
         }
         res.type('application/json');
         res.send(srch_results);
      }
   });
});


// *** Serve Angular app from dist folder ***
// Serve static content files, and redirect everything else to index.html
app.use(express.static(public));
app.get('*', function (req, res) {
    res.sendFile(path.resolve(`${public}/index.html`));
});

// Start the server
var port = process.env.PORT || 3000;
app.listen(port, function () {
   console.log(`### Server and API listening on port ${port}`)
});


// ------------ Util functions from here ------------- //


// Object flattener - moves sub-properties referenced by underscore
function flattenObject(obj) {
   for (prop in obj) {
      obj[prop] = obj[prop]._;
   }
   return obj;
}

// Called when running initdb
function createTable() {
   // Load init data from JSON file
   var thing_data = JSON.parse(require('fs').readFileSync('initdata.json', 'utf8'));
   thing_data = thing_data.initData;
   // Create the table and inject data
   tablesvc.createTableIfNotExists(TABLE_NAME, function (error, result, response) {
      if (!error) {
         console.log("### Table (re)created! ");
         var batch = new azure.TableBatch();
         for (var g = 0; g < thing_data.length; g++) {
            var thing = {
               PartitionKey: { '_': TABLE_PKEY },
               RowKey: { '_': thing_data[g].id.toString() },
               name: { '_': thing_data[g].name },
               photo: { '_': thing_data[g].photo },
               likes: { '_': thing_data[g].likes },
               desc: { '_': thing_data[g].desc }
            };
            batch.insertOrReplaceEntity(thing, { echoContent: true });
         }
         tablesvc.executeBatch(TABLE_NAME, batch, function (error, result, response) {
            if (!error) {
               console.log("### Added fresh batch of things to table, DB init complete!")
            }
         });
      } else {
         if (error.statusCode == 409) {
            console.log("### Table still being deleted, will retry in 10sec... ");
            setTimeout(createTable, 10000);
         }
      }
   });
}