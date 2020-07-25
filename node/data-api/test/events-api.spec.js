const request = require('supertest')
const App = require('../core/app')

// Create the app with mock services
const MockFeedbackService = require('./mocks/feedback-service')
const MockEventService = require('./mocks/event-service')
const app = App.create(new MockEventService(), new MockFeedbackService())

describe('Events API', () => {
  test('Return all events', async () => {
    const res = await request(app).get('/api/events')
    const events = res.body
    expect(res.statusCode).toBe(200)
    expect(events.length).toBe(3)
    expect(events.some(({ _id }) => _id === 'fake1')).toBe(true)
    expect(events.some(({ _id }) => _id === 'fake2')).toBe(true)
    expect(events.some(({ _id }) => _id === 'fake3')).toBe(true)
  })

  test('Create new event', async () => {
    const event = { title:'new event', type:'event', start:'2019-01-01', end:'2019-01-02', topics:[{ desc:'blah', id:1 }] }

    const res = await request(app).post('/api/events').send(event)
    const eventRes = res.body
    expect(res.statusCode).toBe(200)
    expect(eventRes).toHaveProperty('_id')
  })

  test('Return single event', async () => {
    const res = await request(app).get('/api/events/fake1')
    const eventRes = res.body
    expect(res.statusCode).toBe(200)
    expect(eventRes).toHaveProperty('_id', 'fake1')
  })

  test('Fails to return nonexistent event', async () => {
    const res = await request(app).get('/api/events/foobar')
    const error = res.body
    expect(res.statusCode).toBe(404)
    expect(error).toHaveProperty('title', 'error')
  })

  test('Returns events filtered by time', async () => {
    const res = await request(app).get('/api/events/filter/future')
    const eventRes = res.body
    expect(res.statusCode).toBe(200)
    expect(eventRes.length).toBeGreaterThan(0)
  })

  test('Rejects invalid events', async () => {
    const event = { title: 'fooo', type:'blahblah', start:'2019-01-01', end:'2019-01-02', topics:[{ desc:'blah', id:1 }] }

    const res = await request(app).post('/api/events').send(event)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('title', 'validation-error')
  })

  test('Rejects invalid event dates', async () => {
    const event = { title: 'bad dates', type:'event', start:'2019-08-01', end:'2019-05-01', topics:[{ desc:'blah', id:1 }] }

    const res = await request(app).post('/api/events').send(event)
    const error = res.body
    expect(res.statusCode).toBe(400)
    expect(error).toHaveProperty('title', 'validation-error')
  })

  test('Update an existing event', async () => {
    const event = { title:'updated fake1', type:'event', start:'2019-01-01', end:'2019-01-02', topics:[{ desc:'blah', id:1 }] }

    const res = await request(app).put('/api/events/fake1').send(event)
    const eventRes = res.body
    expect(res.statusCode).toBe(200)
    expect(eventRes).toHaveProperty('title', 'updated fake1')
  })

  test('Update an non-existing event', async () => {
    const event = { title:'updated', type:'event', start:'2019-01-01', end:'2019-01-02', topics:[{ desc:'blah', id:1 }] }

    const res = await request(app).put('/api/events/cheese').send(event)
    expect(res.statusCode).toBe(404)
  })

  test('Delete an event', async () => {
    const res = await request(app).delete('/api/events/fake2')
    expect(res.statusCode).toBe(200)
  })

  test('Delete an non-existing event', async () => {
    const res = await request(app).delete('/api/events/toast')
    expect(res.statusCode).toBe(404)
  })
})