const PostController = require('../controllers/post-controller');
const PostService = require('../services/post-service');
const Post = require('../models/post');

module.exports = (app) => {
  const post = new Post().getInstance()
  const postController = new PostController(new PostService(post))
  
  // POST ROUTES
  app.get(`/api/post`, postController.getAll);
  app.get(`/api/post/:id`, (res, req) => {postController.getAll(res, req)});
  app.post(`/api/post`, postController.insert)
  app.put(`/api/post/:id`, postController.update);
  app.delete(`/api/post/:id`, postController.delete);
}