import config from '../main'
import axios from 'axios'
import router from '../router'

/* eslint-disable */

export default {
  methods: {
    apiGetAllEvents: function() { 
      return this._apiRawCall(`events`)
    },

    apiGetEvent: function(id) { 
      return this._apiRawCall(`events/${id}`)
    },  

    apiGetEventsFiltered: function(time) { 
      return this._apiRawCall(`events/filter/${time}`)
    },    

    apiPostFeedback: function(feedbackData) { 
      return this._apiRawCall(`feedback`, 'post', feedbackData)
    },  

    _apiRawCall: function(apiPath, method = 'get', data = null) {
      var apiUrl = `${config.API_ENDPOINT}/${apiPath}`
      //console.log("### API CALL "+ apiUrl);
      
      return axios({
        method: method,
        url: apiUrl,
        data: data
      })
      .catch(err => {
        // Handle errors here, rather than up at caller level
        router.push({
          name: 'error', 
          replace: true, 
          params: { message: `API_ERROR:\n${apiUrl}\n${err.toString()}` }
        })
      })          
    }
  }
}