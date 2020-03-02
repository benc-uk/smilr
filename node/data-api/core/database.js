const mongoose = require('mongoose');

//
// Creates connection to MongoDB
//
class DatabaseConnection {
  // mongoUrl - is a standard MongoDB connection string
  // connectTimeout - Sets initial connection timeout in millisecs
  constructor(mongoUrl, connectTimeout = 30000) {
    console.log(`### Connecting to MongoDB: ${mongoUrl}`);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Sets how long to try establishing initial server connection. Undocumented! 
      serverSelectionTimeoutMS: connectTimeout ,
      dbName: 'smilrDb'
    }
    
    mongoose.pluralize(null);

    // Note, return the *promise* from .connect()
    return mongoose.connect(mongoUrl, options)
  }
}

module.exports = DatabaseConnection;