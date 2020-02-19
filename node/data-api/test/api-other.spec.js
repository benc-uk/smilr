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
// Tests for other API
//
describe('Smilr API: other', () => {
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
