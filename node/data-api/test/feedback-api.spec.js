const request = require('supertest')
const App = require('../core/app')

// Create the app with mock services
const MockFeedbackService = require('./mocks/feedback-service')
const MockEventService = require('./mocks/event-service')
const app = App.create(new MockEventService(), new MockFeedbackService())

describe('Feedback API', () => {
  test('Post & store feedback', async () => {
    const feedback = { rating: 5, comment: 'blah blah', event: 'fake1', topic: 1 }

    const res = await request(app).post('/api/feedback').send(feedback)
    const feedbackRes = res.body
    expect(res.statusCode).toBe(200)
    expect(feedbackRes).toHaveProperty('_id')
  })

  test('Fail to leave feedback for non-existent event', async () => {
    const feedback = { rating: 2, comment: 'waffle waffle', event: 'zzzz', topic: 1 }

    const res = await request(app).post('/api/feedback').send(feedback)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('error')
  })

  test('Fail to leave feedback with negative rating', async () => {
    const feedback = { rating: -5, comment: 'whoooo', event: 'fake3', topic: 1 }

    const res = await request(app).post('/api/feedback').send(feedback)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('error')
  })

  test('Fail to leave feedback with rating more than 5', async () => {
    const feedback = { rating: 99, comment: 'whoooo', event: 'fake3', topic: 1 }

    const res = await request(app).post('/api/feedback').send(feedback)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('error')
  })

  test('Fail to leave feedback with non-number rating', async () => {
    const feedback = { rating: 'hello', comment: 'whoooo', event: 'fake3', topic: 1 }

    const res = await request(app).post('/api/feedback').send(feedback)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('error')
  })

  test('Fail to leave feedback with no topic', async () => {
    const feedback = { rating: 'hello', comment: 'whoooo', event: 'fake3' }

    const res = await request(app).post('/api/feedback').send(feedback)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('error')
  })

  test('Fail to leave feedback with invalid topic number', async () => {
    const feedback = { rating: 'hello', comment: 'whoooo', event: 'fake3', topic: 99 }

    const res = await request(app).post('/api/feedback').send(feedback)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('error')
  })

  test('Fail to leave feedback with invalid topic', async () => {
    const feedback = { rating: 'hello', comment: 'whoooo', event: 'fake3', topic: 'hats' }

    const res = await request(app).post('/api/feedback').send(feedback)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('error')
  })

  test('Get feedback by event & topic id', async () => {
    const res = await request(app).get('/api/feedback/fake1/1')
    const feedback = res.body
    expect(res.statusCode).toBe(200)
    expect(feedback).toHaveProperty('rating')
  })

  test('Fail to get non-existent feedback event', async () => {
    const res = await request(app).get('/api/feedback/fooooooo/1')
    const error = res.body
    expect(res.statusCode).toBe(404)
    expect(error).toHaveProperty('error')
  })

  test('Fail to get non-existent feedback topic', async () => {
    const res = await request(app).get('/api/feedback/fake1/999')
    const error = res.body
    expect(res.statusCode).toBe(404)
    expect(error).toHaveProperty('error')
  })
})