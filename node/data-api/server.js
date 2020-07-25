const App = require('./core/app.js')

// const logger = require('morgan')
const ExpressSwaggerGenerator = require('express-swagger-generator')
const databaseConnection = require('./core/database')
const EventService = require('./services/event-service')
const FeedbackService = require('./services/feedback-service')

// App Insights. Set APPINSIGHTS_INSTRUMENTATIONKEY as App Setting or env var
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require('applicationinsights')
  appInsights.setup()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
  appInsights.start()
  console.log('### Server will report data to App Insights')
}

// Create express app
console.log('### API service starting...')
const app = App.create(new EventService(), new FeedbackService)
console.log(`### Node environment is: ${app.get('env')}`)

// Get config from env vars or defaults where not provided
const port = process.env.PORT || 4000
let mongoUrl = process.env.MONGO_CONNSTR || process.env.MONGO_CONNECTION || process.env.MONGO_URL || 'mongodb://localhost/smilrDb'
const mongoTimeout = process.env.MONGO_CONNECT_TIMEOUT || 30000

// Set up express-swagger-generator
const expressSwagger = new ExpressSwaggerGenerator(app)
let options = {
  swaggerDefinition: {
    // Customize here, see docs https://github.com/pgroot/express-swagger-generator#usage
    info: {
      description: 'Smilr microservice, RESTful data API',
      title: 'Smilr API',
      version: '6.2.0',
    },
    produces: [
      'application/json',
    ]
  },
  basedir: __dirname,
  files: ['./controllers/**/*.js', './models/**/*.js']
}
expressSwagger(options)

// =========================================
// Start the app and connect to MongoDB
// =========================================
app.listen(port, async () => {
  try {
    // Try to connect to database, and await the promise returned
    await new databaseConnection(mongoUrl, mongoTimeout)

    console.log(`### Connected OK. Server up & listening on port ${port}`)
  } catch (err) {
    console.log(`### Error connecting to MongoDB: ${err}\n### Terminating...`)
    process.exit(1)
  }
})
