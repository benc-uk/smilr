//
// Abstract base controller class, all HTTP interaction is here
// Actual concrete services should extend this
//
class Controller {

  // Controller needs a service
  constructor(service) {
    this.service = service;

    // We must use bind here, as `this` will be not what we expect when the route handler is invoked
    // Don't ask, just live with it
    this.create = this.create.bind(this);
    this.get = this.get.bind(this);
    this.query = this.query.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  // POST request for creates
  async create(req, res) {
    try {      
      let resp = await this.service.insert(req.body);
      if(resp instanceof Error) throw resp;

      this._sendData(res, resp);
    } catch(err) {
      this._sendError(res, err);
    }
  }

  // GET single item by id
  async get(req, res) {
    try {
      let resp = await this.service.fetchOne(req.params.id);
      if(resp instanceof Error) throw resp;

      this._sendData(res, resp);
    } catch(err) {
      this._sendError(res, err);
    }
  }

  // GET search/find multiple items
  async query(req, res) {
    try {    
      let resp = await this.service.query(req.query);
      if(resp instanceof Error) throw resp;

      this._sendData(res, resp);
    } catch(err) {
      this._sendError(res, err);
    }
  }

  // PUT to handle updates
  async update(req, res) {
    try {
      let doc = req.body
      doc._id = req.params.id;
      let resp = await this.service.update(doc);
      if(resp instanceof Error) throw resp;

      this._sendData(res, resp);
    } catch(err) {
      this._sendError(res, err);
    }
  }

  // DELETE to handle removal
  async delete(req, res) {
    try {
      let resp = await this.service.delete(req.params.id);
      if(resp instanceof Error) throw resp;

      this._sendData(res, resp);
    } catch(err) {
      this._sendError(res, err);
    }
  }

  //
  // Private util function that all good HTTP responses pass through
  //
  _sendData(res, data, code = 200) {
    res.type('application/json');

    // Add telemetry / logging here

    res.status(code).send(data);
  }

  //
  // Private util function that all error HTTP responses pass through
  //
  _sendError(res, err, title = 'error', code = 500) {    
    console.log(`### Error with API ${err.toString()}`); 

    // Some attempt to get calling function in error   
    let source = ((new Error().stack).split("at ")[2]).split(" ")[0]

    // Default status
    let statusCode = code;

    // Logic to set HTTP status codes, it's not perfect 
    if(err.toString().toLowerCase().includes("no matching docs")) {
      statusCode = 404;
    }
    if(err.toString().toLowerCase().includes("validationerror")) {
      statusCode = 400;
      title = 'validation-error'
    }

    // Problem Details object as per standard https://tools.ietf.org/html/rfc7807
    let problemDetails = {
      error: true,
      title: title,
      details: err.toString(),
      status: statusCode,
      source: source
    };

    // Add telemetry / logging here

    res.status(statusCode).send(problemDetails);
  }    
}



module.exports = Controller;