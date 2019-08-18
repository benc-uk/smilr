
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

const ApiError = require('../lib/api-error');
const utils = require('../lib/utils');

mockResponse = function() {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.send = sinon.stub().returns(res);
  res.type = sinon.stub().returns(res);
  return res;
};

describe('Utils library', function() {
  it('makeId creates valid id', function() {
    expect(utils.makeId).to.be.an('function');
    id = utils.makeId(5);
    expect(id).to.be.an('string');
    expect(id).to.have.lengthOf(5);
  });

  it('sendError defaults validation', function() {
    expect(utils.sendError).to.be.an('function');

    var res = mockResponse()
    err = new ApiError(`Bad thing`);
    id = utils.sendError(res, err)

    expect(res.send).to.have.been.calledWithMatch({error: true})
    expect(res.send).to.have.been.calledWithMatch({title: "smilr-api-error"})
    expect(res.send).to.have.been.calledWithMatch({status: 500})
    expect(res.send).to.have.been.calledWithMatch({details:"Error: Bad thing"})
    expect(res.status).to.have.been.calledWith(500)
  });  

  it('sendError custom validation', function() {
    expect(utils.sendError).to.be.an('function');

    var res = mockResponse()
    err = new ApiError(`Very bad thing`, 404);
    id = utils.sendError(res, err, 'test-error')

    expect(res.send).to.have.been.calledWithMatch({error: true})
    expect(res.send).to.have.been.calledWithMatch({title: "test-error"})
    expect(res.send).to.have.been.calledWithMatch({status: 404})
    expect(res.send).to.have.been.calledWithMatch({details:"Error: Very bad thing"})
    expect(res.status).to.have.been.calledWith(404)
  });   

  it('sendData validation', function() {
    expect(utils.sendData).to.be.an('function');

    var res = mockResponse()
    let data = {foo: "bar"}
    id = utils.sendData(res, data)

    expect(res.type).to.have.been.calledWithMatch("application/json")
    expect(res.send).to.have.been.calledWithMatch(data)
    expect(res.status).to.have.been.calledWith(200)
  });   
})
