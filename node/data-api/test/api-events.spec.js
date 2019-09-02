const app = require('../server')
const request = require('supertest')

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

const dataAccess = require('../lib/data-access')
const utils = require('../lib/utils');

//
// Stub out data access so no MongoDB connect is required or used
//
var queryEventsStub = sinon.stub(dataAccess, 'queryEvents').callsFake((q) => {
  return [
    {_id: "fake01", title: "Unit test event 1", type: "workshop", start:"2019-01-01", end:"2019-01-02"},
    {_id: "fake02", title: "Unit test event 2", type: "lab", start:"2019-02-01", end:"2019-02-02"}
  ]
});

var getEventStub = sinon.stub(dataAccess, 'getEvent').callsFake((id) => {
  if(id === "fake01")
    return {_id: "fake01", title: "Unit test event", type: "workshop", start:"2019-01-01", end:"2019-01-02", topics: [{title: "topic-1", id: 1}]}
  return null;
});

var createOrUpdateEventStub = sinon.stub(dataAccess, 'createOrUpdateEvent').callsFake((event, doupsert) => {
  if (!event._id) 
    event._id = utils.makeId(5)
  return {ops:[event], result:{n: 1}};
});

var deleteEventStub = sinon.stub(dataAccess, 'deleteEvent').callsFake((id, type) => {
  return []
});
app.set('data', dataAccess);   

//
// Tests for events API
//
describe('Smilr events API', () => {
  // GET /api/events
  it('returns all events', (done) => {
    request(app)
      .get('/api/events')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
        expect(res.body).to.have.lengthOf(2)
        expect(res.body[0]).to.have.property('title').includes('test')
        expect(queryEventsStub).to.have.been.calledWith({});
      })
      .expect(200, done);
  });

  // GET /api/events/fake01
  it('returns a single event by id', (done) => {
    let id = 'fake01';
    request(app)
      .get(`/api/events/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id').equals(id)
        expect(res.body).to.have.property('title').includes('test')
        expect(getEventStub).to.have.been.calledWith(id);
      })
      .expect(200, done)
  });

  // GET /api/events/fake01
  it('fails on non-existent event', (done) => {
    request(app)
      .get('/api/events/bad')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('event-get')
        expect(getEventStub).to.have.been.calledWith('bad');
      })
      .expect(404, done)
  });


  // GET /api/events/filter/past
  it('returns time filtered events', (done) => {
    let today = new Date().toISOString().substring(0, 10);

    request(app)
      .get('/api/events/filter/past')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
        expect(res.body).to.have.lengthOf(2)
        expect(res.body[0]).to.have.property('title').includes('test')
        expect(queryEventsStub).to.have.been.calledWith({ end: {$lt: today} });
      })
      .expect(200, done)
  });

  // GET /api/events/filter/blah
  it('fails if time filter is invalid', (done) => {
    queryEventsStub.resetHistory()
    request(app)
      .get('/api/events/filter/blah')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('event-get')
        expect(queryEventsStub).to.not.have.been.calledOnce;
      })
      .expect(400, done)
  });

  // POST /api/events
  it('stores a new event', (done) => {
    let event = {title:"new event", type:"event", start:"2019-01-01", end:"2019-01-02"};
    request(app)
      .post('/api/events')
      .send(event)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id').to.have.lengthOf(5)
        expect(res.body).to.have.property('title').includes('new')
        expect(createOrUpdateEventStub).to.have.been.calledWithMatch(event);
      })
      .expect(200, done)
  });

  // POST /api/events
  it('rejects new events with id field', (done) => {
    createOrUpdateEventStub.resetHistory()
    request(app)
      .post('/api/events')
      .send({title:"new bad event", type:"event", start:"2019-01-01", end:"2019-01-02", "_id": "fake03"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('event-create')
        expect(createOrUpdateEventStub).to.not.have.been.calledOnce;
      })
      .expect(400, done)
  });

  // POST /api/events
  it('rejects events with invalid dates', (done) => {
    createOrUpdateEventStub.resetHistory()
    request(app)
      .post('/api/events')
      .send({title:"new bad event", type:"event", start:"2019-05-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('event-create')
        expect(createOrUpdateEventStub).to.not.have.been.calledOnce;
      })
      .expect(400, done)
  });

  // PUT /api/events
  it('PUT valid event', (done) => {
    createOrUpdateEventStub.resetHistory()
    let event = {_id:"fake01", title:"updated event", type:"workshop", start:"2019-01-01", end:"2019-01-02"}
    request(app)
      .put('/api/events/fake01')
      .send(event)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id')
        expect(res.body).to.have.property('title').includes('updated')
        expect(createOrUpdateEventStub).to.have.been.calledWith(event, false);
      })
      .expect(200, done)
  });

  // PUT /api/events
  it('PUT invalid event type', (done) => {
    createOrUpdateEventStub.resetHistory()
    request(app)
      .put('/api/events/fake01')
      .send({title:"updated event", type:"event", start:"2019-01-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('event-update')
        expect(createOrUpdateEventStub).to.not.have.been.calledOnce;
      })
      .expect(400, done)
  });
  
  // PUT /api/events
  it('PUT invalid event does not exist', (done) => {
    createOrUpdateEventStub.resetHistory()
    request(app)
      .put('/api/events/fake05')
      .send({title:"updated event", type:"workshop", start:"2019-01-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('event-update')
        expect(createOrUpdateEventStub).to.not.have.been.calledOnce;
      })
      .expect(404, done)
  });

  // DELETE /api/events
  it('DELETE event', (done) => {
    let id = 'fake01'
    request(app)
      .delete(`/api/events/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('message').includes('Deleted')
        expect(deleteEventStub).to.have.been.calledWith(id);
      })
      .expect(200, done)
  });    

  // DELETE /api/events
  it('DELETE non existent event', (done) => {
    deleteEventStub.resetHistory();
    request(app)
      .delete('/api/events/fake77')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('event-delete')
        expect(deleteEventStub).to.not.have.been.calledOnce;
      })
      .expect(404, done)
  });    
})
