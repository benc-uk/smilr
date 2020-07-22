// ----------------------------------------------------------------------------
// Copyright (c) Ben Coleman, 2020
// Licensed under the MIT License.
//
// Axios based API client for all calls to data service API
// ----------------------------------------------------------------------------

/* eslint-disable no-console */
import axios from 'axios'
import router from '../router'
import auth from './auth'

let apiScope
let clientId
let apiEndpoint

export default {
  //
  // Must be called at startup
  //
  configure(appApiEndpoint, appClientId, scope) {
    clientId = appClientId
    apiEndpoint = appApiEndpoint
    apiScope = scope
  },

  endpoint() {
    return apiEndpoint
  },

  //
  // ===== Events =====
  //
  getAllEvents: function() {
    return apiCall('events')
  },

  getEvent: function(id) {
    return apiCall(`events/${id}`)
  },

  getEventsFiltered: function(time) {
    return apiCall(`events/filter/${time}`)
  },

  getFeedbackForEvent: function(event) {
    let calls = []
    let apifeedback = []

    for (let topic of event.topics) {
      calls.push(axios.get(`${apiEndpoint}/feedback/${event._id}/${topic.id}`))
    }

    // I only partially understand what this is doing
    // It should be waiting for all API calls to complete
    axios.all(calls)
      .then(axios.spread((...allResponses) => {
        for (let resp of allResponses) {
          for (let data of resp.data) {
            apifeedback.push(data)
          }
        }
      }))

    return apifeedback
  },

  deleteEvent: function(event) {
    return apiCall(`events/${event._id}`, 'delete')
  },

  updateEvent: function(event) {
    return apiCall(`events/${event._id}`, 'put', event)
  },

  createEvent: function(event) {
    return apiCall('events', 'post', event)
  },

  //
  // ===== Feedback =====
  //

  postFeedback: function(feedbackData) {
    return apiCall('feedback', 'post', feedbackData)
  },

  //
  // ===== Private methods =====
  //
}

async function apiCall(apiPath, method = 'get', data = null) {
  // !IMPORTANT! Special stub of all API calls when running unit tests
  if (process.env.NODE_ENV === 'test') { return new Promise((resolve) => { resolve([]) }) }

  let apiUrl = `${apiEndpoint}/${apiPath}`

  let headers = {}
  // Only get a token if logged in & using real auth (i.e AUTH_CLIENT_ID set)
  if (auth.user() && clientId) {
    const scopes = [ `api://${clientId}/${apiScope}` ]

    // Try to get an access token with our API scope
    // It should be safe to call this every time, as MSAL.js caches tokens locally for us
    const accessToken = await auth.acquireToken(scopes)

    // Send token as per the OAuth 2.0 bearer token scheme
    if (accessToken) {
      headers = {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  }
  // console.log('### API CALL '+ apiUrl)
  // console.log('### API HEADERS ', headers)

  return axios({
    method: method,
    url: apiUrl,
    data: data,
    headers: headers
  })
    .catch((err) => {
      let errorData = ''
      // Grab extra error message if content type is JSON
      if (err.response && err.response.data && err.response.headers['content-type'].includes('json')) {
        errorData = JSON.stringify(err.response.data, null, 2)
      }
      // Handle errors here, rather than up at caller level
      router.push({
        name: 'error',
        replace: true,
        params: { message: `API_ERROR: ${apiUrl}\n${err.toString()}\n${errorData}` }
      })
    })
}
