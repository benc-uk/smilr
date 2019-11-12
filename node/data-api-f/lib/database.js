const mongoose = require('mongoose');

class Connection {
  constructor(mongoUrl) {
    console.log(`### Establishing MongoDB connection with: ${mongoUrl}`);
    mongoose.Promise = global.Promise;
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false);
    mongoose.set("useCreateIndex", true);
    mongoose.set("useUnifiedTopology", true);
    return mongoose.connect(mongoUrl);
  }
}

module.exports = Connection;