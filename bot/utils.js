const request = require('request-promise-native');

class Utils {

  // Random int between 0 and (max - 1)
  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  static getEvents(filter) {
    let apiEndpoint = process.env.API_ENDPOINT || 'http://localhost:4000/api';
    return request(`${apiEndpoint}/events/filter/${filter}`)
  }
  
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Utils;