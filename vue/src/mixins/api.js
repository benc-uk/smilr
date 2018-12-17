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

    apiGetFeedbackForEventSync: function(event) { 
      let calls = []
      let apifeedback = []

      for(let topic of event.topics) {
        calls.push(axios.get(`${config.API_ENDPOINT}/feedback/${event.id}/${topic.id}`))
      }

      axios.all(calls)
      .then(axios.spread((...allResponses) => {
        for(let resp of allResponses) {
          for(let data of resp.data) {
            //console.log("=====", data)
            apifeedback.push(data)
          }
        }
      }))

      return apifeedback;
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