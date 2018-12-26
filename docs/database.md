# Database Notes
All data is held in a single MongoDB database called **smilrDb** across two collections `events` and `feedback`.
If they don't exist, the database and collections will be created by the data API on first access, so there is no need to initialize the database.  
The app has been developed and tested again MongoDB versions 3.6 and 3.4, however only very standard Mongo API functionality is used, so it is expected that other 3.x versions will be compatible.

The choice of MongoDB allows us to explore several deployment architectures, the main two being 
- Running MongoDB as a containerised microservice
- Using cloud platform service, namely *Azure Cosmos DB*

Switching between the two options is simply a matter of changing the MongoDB connection string used by the data API (`MONGO_CONNSTR`), this can be done to highlight or demonstrate the compatibility of Cosmos DB

## Option 1 - MongoDB as a containerised microservice
If you don't want to use platform services or have any external dependencies, then running MongoDB in a container along side our two other microservices is an option. This represents a more "pure microservices" scenario 

The provided [Azure Templates](../azure/templates) and [Kubernetes](../kubernetes) configurations and docs provide examples of this scenario

## Option 2 - Using Azure Cosmos DB
As *Azure Cosmos DB* fully supports the MonogDB API, you can use Cosmos DB to deploy Smilr. This provides a number of benefits, such as near global scale, geo-replication and a range of consistency models.
Deployment of a new Cosmos DB account is simple, using the Azure CLI it is a single command. Note the account name must be globally unique so you will have to change it
```
az cosmosdb create --resource-group {res_group} --name {change_me} --kind MongoDB
```

You can then obtain the MongoDB connection string using the Azure portal or the following command:
```
az cosmosdb list-connection-strings --resource-group {res_group} --name {change_me}
```

## Option 3 - Run MongoDB Locally
You have three options when it comes to running MongoDB locally:

### Use Windows Subsystem For Linux (WSL) - Ubuntu
Using Windows Subsystem For Linux (WSL) is probably the easiest way to run MongoDB on a Windows 10 machine. If you haven't already enabled WSL and installed a Linux distribution, [then do so](https://docs.microsoft.com/en-us/windows/wsl/install-win10). I strongly recommend picking Ubuntu as the distribution to run.

Open an Ubuntu bash terminal and install MonogDB with the following:
```
sudo apt update
sudo apt install -y mongodb
sudo mkdir /data/db
```

Then start the server with:
```
sudo mongod
```
MonogDB server will start and be listening on all IPs by default, there is no authentication or SSL so you can simply connect with `mongodb://localhost` as the connection string


## Loading Demo Data
The database requires no initialization, however a helper script is provided to populate the system with demo data:
#### [:page_with_curl: Helper Script: demoData](../scripts/demoData)


# Notes on the id field
For historical reasons the id field is named `id` on all objects client side and exposed by the API. This was due to the use of DocumentDB early on in the project's life. MongoDB uses `_id` and this is what will be stored physically in the data collections. 

Rather than introduce breaking changes a translation is done between the two id fields by the data API, see [node/data-api/lib/utils.js](../node/data-api/lib/utils.js) and the ***sendData()*** method.

UNDER CONSIDERATION - In the future this translation may be removed and _id will be used everywhere