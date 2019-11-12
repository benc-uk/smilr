class Controller {

  constructor(service) {
    this.service = service;
    console.log(service);
    console.log(this);
    
    //this.getAll = this.getAll.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll (req, res) {   
    if(req.params.id)
    req.query = {_id: req.params.id}
    console.log("IN GET ALL", this);
    // console.log("IN GET ALL", this.service);
    //res.status(200).send();
    
    res.status(200).send(await this.service.getAll(req.query));
  }

  async insert(req, res) {
    let response = await this.service.insert(req.body);
    
    if (response.error) return res.status(response.code).send(response);
    return res.status(200).send(response.item);
  }

  async update(req, res) {
    const { id } = req.params;

    let response = await this.service.update(id, req.body);

    return res.status(response.statusCode).send(response);
  }

  async delete(req, res) {
    const { id } = req.params;

    let response = await this.service.delete(id);

    return res.status(response.statusCode).send(response);
  }

}

module.exports = Controller;