// const PostController = require('../controllers/post-controller');
// const PostService = require('../services/post-service');
// const Post = require('../models/post');
const EventController = require('../controllers/event-controller');
const EventService = require('../services/event-service');
const Event = require('../models/event');

module.exports = (app) => {
  //const post = new Post().getInstance()
  //const event = new Event().getInstance()
 // const postController = new PostController(new PostService(post))
  const eventController = new EventController(new EventService())
  
  // POST ROUTES
  // app.get(`/api/post`, postController.getAll);
  // app.get(`/api/post/:id`, (res, req) => {postController.getAll(res, req)});
  // app.post(`/api/post`, postController.insert)
  // app.put(`/api/post/:id`, postController.update);
  // app.delete(`/api/post/:id`, postController.delete);

  app.post(`/api/events`, eventController.insert);
  app.put(`/api/events/:id`, eventController.update);
}