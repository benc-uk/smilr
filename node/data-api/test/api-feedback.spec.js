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
var createFeedbackStub = sinon.stub(dataAccess, 'createFeedback').callsFake((feedback) => {
  return {ops:[feedback], result:{n: 1}};
});
var listFeedbackForEventTopicStub = sinon.stub(dataAccess, 'listFeedbackForEventTopic').callsFake((event, topic) => {
  return [{comment: "test feedback", rating: 5, event: "fake01", topic: 1}]
});
app.set('data', dataAccess);   

//
// Tests for feedback API
//
describe('Smilr feedback API', function() {
  // GET /api/feedback/fake01/1
  it('returns feedback for event', function(done) {
    request(app)
      .get('/api/feedback/fake01/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
        expect(listFeedbackForEventTopicStub).to.have.been.calledOnceWith('fake01', 1)
      })
      .expect(200, done)
  });

  // POST /api/feedback
  it('stores valid feedback', function(done) {
    let feedback = {rating: 5, comment: "blah blah", event: 'fake01', topic: 1}
    request(app)
      .post('/api/feedback')
      .send({rating: 5, comment: "blah blah", event: 'fake01', topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(createFeedbackStub).to.have.been.calledOnceWith(feedback)
      })
      .expect(200, done)
  });

  // POST /api/feedback
  it('rejects feedback with no rating', function(done) {
    createFeedbackStub.resetHistory();
    request(app)
      .post('/api/feedback')
      .send({comment: "blah blah", event: 'fake01', topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('feedback-post')
        expect(createFeedbackStub).to.not.have.been.calledOnce;
      })
      .expect(400, done)
  });  

  // POST /api/feedback
  it('rejects feedback if the event does not exist', function(done) {
    createFeedbackStub.resetHistory();
    request(app)
      .post('/api/feedback')
      .send({rating: 1, comment: "blah blah", event: 'fake02', topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('feedback-post')
        expect(createFeedbackStub).to.not.have.been.calledOnce;
      })
      .expect(404, done)
  });    
})
