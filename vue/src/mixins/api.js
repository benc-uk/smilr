import config from '../main'

export default {
  methods: {
    apiGetAllEvents: function() { 
      return this._apiRawGet(`events`)
    },

    apiGetEvent: function(id) { 
      return this._apiRawGet(`events/${id}`)
    },  

    apiGetEventsFiltered: function(time) { 
      return this._apiRawGet(`events/filter/${time}`)
    },    

    _apiRawGet: function(apiPath) {
      return fetch(`${config.API_ENDPOINT}/${apiPath}`)
        .then(resp => {
          return resp.json();
        })
        .catch(err => {
          // eslint-disable-next-line
          console.log(`### API Error! ${err}`);
        })
    }
  }
}