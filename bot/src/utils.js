//
// Simple static helper functions
//

class Utils {

  // Random int between 0 and (max - 1)
  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Utils;