import config from '../main'
import axios from 'axios'
import router from '../router'

/* eslint-disable */

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
      var apiUrl = `${config.API_ENDPOINT}/${apiPath}`
      //console.log("### API CALL "+ apiUrl);
      
      return axios.get(apiUrl)
      .catch( err => {
        // Handle errors here
        router.push({
          name: 'error', 
          replace: true, 
          params: { message: `API_ERROR:\n${apiUrl}\n${err.toString()}` }
        })
      })
    }
  }
}