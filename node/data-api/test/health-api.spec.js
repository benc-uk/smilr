const request = require('supertest')
const App = require('../core/app')

// Create the app with mock services
const MockFeedbackService = require('./mocks/feedback-service')
const MockEventService = require('./mocks/event-service')
const app = App.create(new MockEventService(), new MockFeedbackService())

describe('Health API', () => {
  test('Get info', async () => {
    const res = await request(app).get('/api/info')
    const infoRes = res.body
    expect(res.statusCode).toBe(503)
    expect(infoRes).toHaveProperty('status', 'fail')
  })
})