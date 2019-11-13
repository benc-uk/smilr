const request = require('supertest')
const chai = require("chai");
const expect = chai.expect;

const app = require('../server').app;

describe('Health API', () => {
  it('fetch health', (done) => {
    request(app)
      .get('/api/health')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.be.an.an('object')
        expect(res.body).to.have.property('status')
        expect(res.body.status).to.be.equal('pass')
        expect(res.body).to.have.property('debug')
        expect(res.body.debug.hostInfo).to.have.property('hostname')
      })
      .expect(200, done)
  });
})
