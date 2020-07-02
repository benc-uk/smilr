// ----------------------------------------------------------------------------
// Copyright (c) Ben Coleman, 2020
// Licensed under the MIT License.
//
// Mock API client injected for unit testing
// ----------------------------------------------------------------------------

const fs = require('fs')

// Load mock data, which we put beside the tests
let mockDataDir = __dirname+'/../../../../testing/mock-data'
let mockJson = fs.readFileSync(`${mockDataDir}/events.json`)
let mockEvents = JSON.parse(mockJson)
mockJson = fs.readFileSync(`${mockDataDir}/feedback.json`)
let mockFeedback = JSON.parse(mockJson)

export default {
  methods: {
    // ===== Events =====
    apiGetAllEvents: function() {
      return new Promise((resolve) => {
        resolve({ data: mockEvents } )
      })
    },

    apiGetEvent: function(id) {
      return new Promise((resolve) => {
        resolve({ data: mockEvents.find((e) => e._id == id) } )
      })
    },

    apiGetEventsFiltered: function(time) {
      let today = new Date().toISOString().substr(0, 10)

      let filterF = function() { return false }

      if (time === 'future') {
        filterF = function(e) { return e.start > today }
      }
      if (time === 'past') {
        filterF = function(e) { return e.end < today }
      }
      if (time === 'active') {
        filterF = function(e) { return e.start <= today && e.end >= today }
      }

      return new Promise((resolve) => {
        resolve({ data: mockEvents.filter(filterF) } )
      })
    },

    apiGetFeedbackForEvent: function(event) {
      // This one doesn't return a promise, go figure
      return mockFeedback
    },
  }
}