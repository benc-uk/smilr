//
// Simple static helper functions
//

const ASSET_DIR = `${__dirname}/../assets`

class Utils {

  // Random int between 0 and (max - 1)
  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static sendRandomPhrase(session, phrases) {
    // TODO!
  }

  static getImageSVG(filename) {
    let svgImg = require('fs').readFileSync(`${ASSET_DIR}/${filename}`);
    return `data:image/svg+xml;utf8,${svgImg.toString()}`
  }
}

module.exports = Utils;