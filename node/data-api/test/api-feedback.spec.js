const request = require('supertest')
const chai = require("chai");
const expect = chai.expect;

const app = require('../server').app;

describe('Feedback API', () => {
    let newEventId
    let event = {title:"fake event", type:"event", start:"2019-01-01", end:"2019-01-02", topics:[{desc:"blah", id:1}] };
    it('create event for feedback', (done) => {
      request(app)
      .post('/api/events')
      .send(event)
      .expect(function(res) {
        newEventId = res.body._id
      })
      .expect(200, done);
    });

  it('submit valid feedback', (done) => {
    request(app)
      .post('/api/feedback')
      .send({rating: 5, comment: "blah blah", event: newEventId, topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
      })
      .expect(200, done)
  });

  it('reject feedback with no rating', (done) => {
    request(app)
      .post('/api/feedback')
      .send({comment: "blah blah", event: newEventId, topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('validation-error')
      })
      .expect(400, done)
  });  

  it('reject feedback if the event does not exist', (done) => {
    request(app)
      .post('/api/feedback')
      .send({rating: 1, comment: "blah blah", event: 'fake02', topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('validation-error')
      })
      .expect(400, done)
  });  
})