// 
// Mock REST API server without database
// Uses JSON Server https://github.com/typicode/json-server
//
const jsonServer = require('json-server')
const server = jsonServer.create()
const path = require('path')
const router = jsonServer.router(path.join(__dirname, 'db.json'))

const middlewares = jsonServer.defaults()
server.use(middlewares)

server.get('/api', (req, res) => {
  res.send('<h1>Mock API server for Smilr is running</h1>')
})

// server.get('/api/events/filter/:time', (req, res) => {
//   var db = router.db
//   var today = new Date().toISOString().substr(0, 10)
//   var events = db
//     .get('events')
//     .filter(function (e) {
//       if(req.params.time.toLowerCase() == 'future') return e.start > today
//       if(req.params.time.toLowerCase() == 'past') return e.end < today
//       if(req.params.time.toLowerCase() == 'active') return (e.start <= today && e.end >= today)
//       return res.send(400, {error:'Invalid time for filter, must be: [past, active, future]'})
//     })
//     .value()

//   res.jsonp(events)  
// })

var today = new Date().toISOString().substr(0, 10)
server.use(jsonServer.rewriter({
  "/api/feedback/:eid/:tid":    "/api/feedback?event=:eid&topic=:tid",
  "/api/events/filter/future":  "/api/events?start_gte="+today+"&start_ne="+today,
  "/api/events/filter/past":    "/api/events?end_lte="+today+"&start_ne="+today,
  "/api/events/filter/active":  "/api/events?start_lte="+today+"&end_gte="+today
}))

server.use((req, res, next) => {
  if(req.method == 'PUT' && req.path == "/api/events") {
    req.url = "/api/events/" + req.body.id
  }
  next()
})

server.use('/api', router)

server.listen(4000, () => {
  console.log('### Mock API server for Smilr is running...')
  console.log('### http://localhost:4000')
})
