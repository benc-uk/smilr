var MongoQS = require('mongo-querystring');
var querystring = require('querystring');

// Error messages
const MSG_UPDATE_ERR = 'Update failed, no result from updateOne';
const MSG_DELETE_ERR = 'Delete failed, no result from deleteOne';
const MSG_NO_RESULT = 'No matching docs with given id';

//
// Abstract base service class, all DB interaction logic is here
// Actual concrete services should extend this
//
class Service {
  constructor(model) {
    this.model = model;
  }

  // Add/create new entity to the database
  async insert(data) {
    try {
      let item = await this.model.create(data);
      
      if(item) 
        return item;
      else
        return new Error(MSG_NO_RESULT);
    } catch (error) {      
      return error;
    }
  }

  // Get a single entity by id
  async fetchOne(id) {
    try {
      let item = await this.model.findById(id);

      if(item) 
        return item;
      else 
        return new Error(MSG_NO_RESULT);
    } catch (error) {      
      return error;
    }    
  }

  // Execute a query finding some/all of a given entity
  // See readme.md for details
  async query(queryParams) {
    try {      
      var mongoqQS = new MongoQS();
      let { limit, skip, filter } = queryParams;
      
      // Filter is string, e.g foo=bar, but we need an object of key-val pairs
      let filterQuery = querystring.parse(filter);
      // Now we can pass it to mongo-querystring
      var mongoQuery = mongoqQS.parse(filterQuery);

      console.log(`### Querying collection: '${this.model.modelName.toLowerCase()}' with ${JSON.stringify(mongoQuery)} based on filter: ${filter}`);
      
      let items = await this.model.find(mongoQuery)
      .limit(parseInt(limit) || 0)
      .skip(parseInt(skip) || 0);
      
      if(items)
        return items;
      else 
        return new Error(MSG_NO_RESULT);
    } catch (error) {      
      return error;
    }    
  }

  // Update an existing single entity, id should be in the data
  async update(data, doUpsert = false, customFilter = null) {
    try {
      let filter = customFilter ? customFilter : {_id: data._id}
      let result = await this.model.updateOne(filter, {$set: data}, {upsert: doUpsert});
      
      if(result) {
        if(result.n !== 1) return new Error(MSG_NO_RESULT)
        return data;
      } else {
        return new Error(MSG_UPDATE_ERR);
      }
    } catch (error) {      
      return error;
    }
  }

  // Delete a single entity by id
  async delete(id, customFilter = null) {
    try {
      let filter = customFilter ? customFilter : {_id: id}
      let result = await this.model.deleteOne(filter);
      
      if(result) {
        if(result.n !== 1) return new Error(MSG_NO_RESULT);
        return { message: `Doc '${id}' was successfully deleted` };
      } else {
        return new Error(MSG_DELETE_ERR);
      }
    } catch (error) {      
      return error;
    }
  }  
}

module.exports = Service;