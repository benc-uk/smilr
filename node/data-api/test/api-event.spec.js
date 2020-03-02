const request = require('supertest')
const chai = require("chai");
const expect = chai.expect;

const app = require('../server').app;

describe('Events API', () => {
  var newEventId;

  it('create new event', (done) => {
    let event = {title:"new event", type:"event", start:"2019-01-01", end:"2019-01-02", topics:[{desc:"blah", id:1}] };
    request(app)
      .post('/api/events')
      .send(event)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id')
        expect(res.body).to.have.property('title').equals('new event')
        newEventId = res.body._id
      })
      .expect(200, done);
  });

  it('returns all events', (done) => {
    request(app)
      .get('/api/events')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
        expect(res.body).to.have.lengthOf(1)
        expect(res.body[0]).to.have.property('title').includes('new event')
      })
      .expect(200, done);
  });

  it('returns a single event by id', (done) => {
    request(app)
      .get(`/api/events/${newEventId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id').equals(newEventId)
        expect(res.body).to.have.property('title').includes('new event')
      })
      .expect(200, done)
  });

  it('fails on non-existent event', (done) => {
    request(app)
      .get('/api/events/bad')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('error')
      })
      .expect(404, done)
  });

  it('returns time filtered events', (done) => {
    request(app)
      .get('/api/events/filter/past')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
        expect(res.body).to.have.lengthOf(1)
        expect(res.body[0]).to.have.property('title').includes('new event')
      })
      .expect(200, done)
  });

  it('rejects invalid events', (done) => {
    request(app)
      .post('/api/events')
      .send({title:"new bad event", type:"fooooo", start:"2019-05-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('validation-error')
      })
      .expect(400, done)
  });

  it('rejects invalid event dates', (done) => {
    request(app)
      .post('/api/events')
      .send({title:"new bad event", type:"hack", start:"2019-02-16", end:"2019-01-16", topics:[{desc:"blah", id:1}] })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('validation-error')
      })
      .expect(400, done)
  });

  it('valid event update', (done) => {
    let event = {_id:newEventId, title:"updated event", type:"event", start:"2019-01-01", end:"2019-01-02", topics:[{desc:"blah", id:1}]}
    request(app)
      .put(`/api/events/${newEventId}`)
      .send(event)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id')
        expect(res.body).to.have.property('title').includes('updated')
      })
      .expect(200, done)
  });

  it('invalid event update', (done) => {
    let event = {_id:"dontexist", title:"updated event", type:"event", start:"2019-01-01", end:"2019-01-02", topics:[{desc:"blah", id:1}]}
    request(app)
      .put(`/api/events/dontexist`)
      .send(event)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('error')
      })
      .expect(404, done)
  });

  it('delete an event', (done) => {
    request(app)
      .delete(`/api/events/${newEventId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('message').includes('successfully deleted')
      })
      .expect(200, done)
  });   

  it("can't delete non-existent event", (done) => {
    request(app)
      .delete(`/api/events/${newEventId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('error')
      })
      .expect(404, done)
  });    
})
