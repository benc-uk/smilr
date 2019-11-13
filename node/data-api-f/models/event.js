const mongoose = require ('mongoose');

class Event {
  initSchema() {
    const topicSchema = new mongoose.Schema({
      id:   { type: Number, required: true },
      desc: { type: String, required: true }
    },{ _id : false });

    const eventSchema = new mongoose.Schema({
      _id: { type: String },
      title: { type: String, required: true },
      type:  { type: String, required: true, enum: ['event', 'workshop', 'hack', 'lab'] },
      start: { type: Date, required: true },
      end:   { type: Date, required: true },
      topics: { type: [topicSchema], required: true }
    });
    
    // Custom pre-save check which creates _id for us, we DONT use the 
    // built in MonogDB ObjectId for ids, there's historical reasons...
    eventSchema.pre('save', function(next) {
        var event = this;
        if(!event._id) {
          event._id = makeId(5);
        }
        if(event.topics.length < 1) {
          next("ValidationError: event must have at least 1 topic");
        }

        next();
      },
      function(err) {
        next(err);
      }
    );

    mongoose.model("events", eventSchema);
  }

  getInstance() {
    // Ensure model schema is initialized only once
    if(!mongoose.modelNames().includes("events"))
      this.initSchema();

    return mongoose.model("events");
  }
}

function makeId(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = Event;
