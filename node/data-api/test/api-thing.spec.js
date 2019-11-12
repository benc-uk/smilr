const request = require('supertest')
const chai = require("chai");
const expect = chai.expect;

const app = require('../server').app;

//
// Tests against the thing API routes & model
// 

describe('Thing API', () => {
  var thing1Id;

  it('create new thing', (done) => {
    request(app)
      .post('/api/things')
      .send({name: 'thing-1', count: 4})
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('_id')
        expect(res.body).to.have.property('name').equals('thing-1')
        expect(res.body).to.have.property('count').equals(4)
        thing1Id = res.body._id
      })
      .expect(200, done);
  });

  it('create a second thing', (done) => {
    request(app)
      .post('/api/things')
      .send({name: 'thing-2', count: 8})
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('name').equals('thing-2')
        expect(res.body).to.have.property('count').equals(8)
      })
      .expect(200, done);
  });

  it('validates creating invalid things', (done) => {
    request(app)
      .post('/api/things')
      .send({blah: 'yes'})
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
      })
      .expect(400, done);
  });

  it('returns all things', (done) => {
    request(app)
      .get('/api/things')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array')
        expect(res.body).to.have.lengthOf(2)
      })
      .expect(200, done);
  });

  it('returns some things, where count > 5', (done) => {
    request(app)
      .get('/api/things?filter=count=>5')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('array').an
        expect(res.body).to.have.lengthOf(1)
        expect(res.body[0]).to.have.property('name').equals('thing-2')
      })
      .expect(200, done);
  });  

  it('update a thing', (done) => {
    request(app)
      .put(`/api/things/${thing1Id}`)
      .send({count: 200})
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
      })
      .expect(200, done);
  });    

  it('try to fetch a non-existent thing', (done) => {
    request(app)
      .get(`/api/things/5dc82f093ab8a2ac4e727cf9`)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('error').equals(true)
      })
      .expect(404, done);
  });

  it('fetch a thing by id', (done) => {
    request(app)
      .get(`/api/things/${thing1Id}`)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('count').equals(200)
      })
      .expect(200, done);
  });    

  it('delete a thing by id', (done) => {
    request(app)
      .delete(`/api/things/${thing1Id}`)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('message')
      })
      .expect(200, done);
  });      
})
