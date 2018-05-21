const request = require('request-promise-native');

//
// Simple API wrapper, using request library and native Promises
//
class SmilrApi {

  constructor(endPoint = 'http://localhost:4000/api') {
    this.apiEndpoint = process.env.API_ENDPOINT || endPoint;
  }

  getEvents(filter) {
    return request(`${this.apiEndpoint}/events/filter/${filter}`)
  }

  sendFeedback(rating, comment = "") {
    return request.post(`${this.apiEndpoint}/feedback/`, {})
  }  
}

// Return singleton
module.exports = new SmilrApi();