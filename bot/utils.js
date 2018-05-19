
class Utils {

  // Random int between 0 and (max - 1)
  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}

module.exports = Utils;