const { expect } = require('chai')
const app = require('../server')
const request = require('supertest')
const utils = require('../lib/utils')

//
// Stub out data access so no MongoDB connect is required or used
//
app.set('data', {
  queryEvents: function(query) {
    return [
      {_id: "fake01", title: "Unit test event 1", type: "workshop", start:"2019-01-01", end:"2019-01-02"},
      {_id: "fake02", title: "Unit test event 2", type: "lab", start:"2019-02-01", end:"2019-02-02"}
    ]
  },
  getEvent: function(id) {
    if(id === "fake01")
      return {_id: "fake01", title: "Unit test event", type: "workshop", start:"2019-01-01", end:"2019-01-02", topics: [{title: "topic-1", id: 1}]}
    return null;
  },
  createOrUpdateEvent: function(event, doupsert) {
    event._id = utils.makeId(5)
    return {ops:[event], result:{n: 1}};
  },
  createFeedback: function(feedback) {
    return {ops:[feedback]};
  },
  listFeedbackForEventTopic: function(e, t) {
    return [{comment: "test feedback", rating: 5, event: "fake01", topic: 1}]
  },
  deleteEvent: function(id, type) {
    return []
  }    
});

//
// Tests for events API
//
describe('Smilr API: events', function() {
  // GET /api/events
  it('GET all events', function(done) {
    request(app)
      .get('/api/events')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
        expect(res.body).to.have.lengthOf(2)
        expect(res.body[0]).to.have.property('title').includes('test')
      })
      .expect(200, done)
  });

  // GET /api/events/fake01
  it('GET existing event by id', function(done) {
    request(app)
      .get('/api/events/fake01')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id').equals('fake01')
        expect(res.body).to.have.property('title').includes('test')
      })
      .expect(200, done)
  });

  // GET /api/events/fake01
  it('GET non-existing event by id', function(done) {
    request(app)
      .get('/api/events/foo')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('details').includes('not found')
      })
      .expect(404, done)
  });

  // GET /api/events/filter/past
  it('GET filtered events in past', function(done) {
    request(app)
      .get('/api/events/filter/past')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
        expect(res.body).to.have.lengthOf(2)
        expect(res.body[0]).to.have.property('title').includes('test')
      })
      .expect(200, done)
  });

  // GET /api/events/filter/blah
  it('GET filtered events with invalid filter', function(done) {
    request(app)
      .get('/api/events/filter/blah')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('details').includes('not valid')
      })
      .expect(400, done)
  });

  // POST /api/events
  it('POST new valid event', function(done) {
    request(app)
      .post('/api/events')
      .send({title:"new event", type:"event", start:"2019-01-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id').to.have.lengthOf(5)
        expect(res.body).to.have.property('title').includes('new')
      })
      .expect(200, done)
  });

  // POST /api/events
  it('POST invalid event with id', function(done) {
    request(app)
      .post('/api/events')
      .send({title:"new bad event", type:"event", start:"2019-01-01", end:"2019-01-02", "_id": "fake03"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('details').includes('Should not POST')
      })
      .expect(400, done)
  });

  // POST /api/events
  it('POST invalid event with bad dates', function(done) {
    request(app)
      .post('/api/events')
      .send({title:"new bad event", type:"event", start:"2019-05-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('details').includes('Event start date')
      })
      .expect(400, done)
  });

  // PUT /api/events
  it('PUT valid event', function(done) {
    request(app)
      .put('/api/events/fake01')
      .send({title:"updated event", type:"workshop", start:"2019-01-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id')
        expect(res.body).to.have.property('title').includes('updated')
      })
      .expect(200, done)
  });

  // PUT /api/events
  it('PUT invalid event type', function(done) {
    request(app)
      .put('/api/events/fake01')
      .send({title:"updated event", type:"event", start:"2019-01-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('details').includes('type can not be changed')
      })
      .expect(400, done)
  });
  
  // PUT /api/events
  it('PUT invalid event does not exist', function(done) {
    request(app)
      .put('/api/events/fake05')
      .send({title:"updated event", type:"workshop", start:"2019-01-01", end:"2019-01-02"})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('details').includes('does not exist')
      })
      .expect(404, done)
  });

  // DELETE /api/events
  it('DELETE event', function(done) {
    request(app)
      .delete('/api/events/fake01')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('message').includes('Deleted')
      })
      .expect(200, done)
  });    

  // DELETE /api/events
  it('DELETE non existent event', function(done) {
    request(app)
      .delete('/api/events/fake77')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {       
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('details').includes('No event with id')
      })
      .expect(404, done)
  });      
}),

//
// Tests for feedback API
//
describe('Smilr API: feedback', function() {
  // GET /api/feedback/fake01/1
  it('GET feedback for event', function(done) {
    request(app)
      .get('/api/feedback/fake01/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
      })
      .expect(200, done)
  });

  // POST /api/feedback
  it('POST valid feedback', function(done) {
    request(app)
      .post('/api/feedback')
      .send({rating: 5, comment: "blah blah", event: 'fake01', topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
      })
      .expect(200, done)
  });

  // POST /api/feedback
  it('POST invalid feedback, no rating', function(done) {
    request(app)
      .post('/api/feedback')
      .send({comment: "blah blah", event: 'fake01', topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('feedback-post')
      })
      .expect(400, done)
  });  

  // POST /api/feedback
  it('POST invalid feedback non-existent event', function(done) {
    request(app)
      .post('/api/feedback')
      .send({rating: 1, comment: "blah blah", event: 'fake02', topic: 1})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
        expect(res.body).to.have.property('title').includes('feedback-post')
      })
      .expect(404, done)
  });    
})

//
// Tests for other API
//
describe('Smilr API: other', function() {
  // GET /api/info
  it('GET system info', function(done) {
    request(app)
      .get('/api/info')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('hostname')
        expect(res.body).to.have.property('appVersion').equals(require('../package.json').version)
      })
      .expect(200, done)
  });

  // POST /api/bulk
  it('POST bulk load', function(done) {
    request(app)
      .post('/api/bulk')
      .send({events:[], feedback:[]})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
      })
      .expect(200, done)
  });
})