//import Controller from  './Controller';
const Controller = require('./controller');

class PostController extends Controller {
  constructor(service) { 
    super(service);
  }
}

module.exports = PostController;