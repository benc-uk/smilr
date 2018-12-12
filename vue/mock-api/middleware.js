
// This little bit of middle ware rewrites requests so they work with json-server
// When I PUT an event I don't send the id of the event on the URL, it's just in the body
// But json-server expects them to be like PUT /events/27

module.exports = (req, res, next) => {
  if(req.method == 'PUT' && req.path == "/events") {
    req.url = "/events/" + req.body.id
  }
  next()
}