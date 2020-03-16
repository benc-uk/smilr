const Service = require('./service')
const Event = require('../models/event')

//
// CRUD service for events
//
class EventService extends Service {
  constructor() {
    // Get an instance of the Event model
    const eventModel = new Event().getInstance()
    // Pass it to the superclass
    super(eventModel)
  }

  // Thanks to CosmosDB having weird rules about sharding
  // We need to supply event type as well as just id
  // So we override the base Service here and add extra constraints/keys

  // UPDATE - If you *don't* manually create the collections in CosmosDB, you don't need shard keys
  // This is undocumented behaviour in CosmosDB
  // - Making this code unnecessary, leaving it here just in case

  // async update(data, doUpsert = false) {
  //   return super.update(data, doUpsert, {_id: data._id, type: data.type})
  // }

  // async delete(id) {
  //   let event = await this.fetchOne(id);
  //   return super.delete(id, {_id: id, type: event.type})
  // }
}

module.exports = EventService