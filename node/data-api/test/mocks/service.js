// Error messages
const MSG_NO_RESULT = 'No matching docs with given id'

//
// ******** MOCK *********
// CRUD service base
// ******** MOCK *********
//
class Service {
  constructor(model) {
    this.model = model
    this.mockData = []
    this.preSaveHook = null
  }

  async insert(data) {
    let model = new this.model(data)

    // Manually call validation, as we're not running with a DB
    let validationErrs = model.validateSync()
    if (validationErrs) { return validationErrs }

    // Manually call pre save hook(s), as we're not running with a DB
    await this.preSaveHook((nextResult) => {
      if (nextResult) { throw nextResult }
    }, model)

    this.mockData.push(model)
    return model
  }

  update(data) {
    let ix = 0
    let found = false
    for (let m of this.mockData) {
      if (m._id === data._id) { found = true; break }
      ix++
    }

    if (found) {
      this.mockData[ix] = data
      return data
    } else {
      return new Error(MSG_NO_RESULT)
    }
  }

  fetchOne(id) {
    const item = this.mockData.find((e) => e._id == id)
    if (item) { return item } else { return new Error(MSG_NO_RESULT) }
  }

  query(q) {
    // // Query with filter on time ranges
    // if (q.filter) {
    //   let filterF = function() { return false }
    //   let date = q.filter.match(/\d+-\d+-\d+/)[0]
    //   if (q.filter.includes('start') && q.filter.includes('end')) {
    //     filterF = function(e) { return e.start <= date && e.end >= date }
    //   } else if (q.filter.includes('end')) {
    //     filterF = function(e) { return e.end < date }
    //   } else if (q.filter.includes('start')) {
    //     filterF = function(e) { return e.start > date }
    //   }
    //   return this.mockData.filter(filterF)
    // }

    // Empty query -> return all events
    if (Object.keys(q).length === 0) {
      return this.mockData
    }
  }

  delete(id) {
    let ix = 0
    let found = false
    for (let m of this.mockData) {
      if (m._id === id) { found = true; break }
      ix++
    }

    if (found) {
      this.mockData.splice(ix, 1)
      return
    } else {
      return new Error(MSG_NO_RESULT)
    }
  }
}

module.exports = Service