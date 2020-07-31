// const conf = require('../config.json')
import storage from "nativescript-localstorage";

export default {
  // data: function () {
  //   return {
  //     apiEndpoint: conf.API_ENDPOINT
  //   }
  // },
  
  methods: {
    apiFetchEvents(time) {  
      let apiEndpoint = storage.getItem('apiEndpoint');

      return fetch(`${apiEndpoint}/events/filter/${time}`)
        .then(resp => {
          if(!resp.ok) {
            throw new Error(`HTTP Status ${resp.status} ${resp.statusText}`);
          }
          return resp.json();
        })
    },

    apiSendFeedback(eventId, topic, comment, rating) {  
      let apiEndpoint = storage.getItem('apiEndpoint');

      let feedbackObj = {
        event: eventId,
        topic: topic,
        rating: rating,
        comment: comment
      };
      
      let request = {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(feedbackObj)
      };

      return fetch(`${apiEndpoint}/feedback`, request)
        .then(resp => {
          if(!resp.ok) {
            throw new Error(`HTTP Status ${resp.status} ${resp.statusText}`);
          }
          return resp.json();
        })
    },    
  }
}