<template>
  <div>
    <h1>Feedback Report</h1>
    
    <spinner v-if="!events"></spinner>

    <b-form label="Select event to report on" inline v-if="events">
      <b-form-select v-model="selectedIndex" size="lg" style="width: 50%">
        <option :value="null" disabled>-- Please select an event --</option>
        <option v-for="(event, index) in events" v-bind:value="index" :key="event.id">
          {{ event.title }}
        </option>           
      </b-form-select> &nbsp;
      <b-button @click="fetchComments" v-if="selectedEvent" variant="success"><fa icon="sync"/> Refresh Report</b-button>
    </b-form>

    <br/>

    <b-card v-if="selectedEvent" border-variant="primary" header-bg-variant="primary" header-text-variant="white">
      <h1 slot="header">{{ selectedEvent.title }}</h1>
      <b>Start:</b> {{ selectedEvent.start | moment("dddd, MMMM Do YYYY") }} <br/>
      <b>End:</b> {{ selectedEvent.end | moment("dddd, MMMM Do YYYY") }} <br/>
      <b>Type:</b> <span class="text-capitalize"> {{ selectedEvent.type }} <fa :icon="faIcon(selectedEvent.type)"/> </span> <br/>
      <b>Total Responses:</b> {{ this.feedback.length }} <br/>
      
      <hr/>

      <div v-for="topic in selectedEvent.topics" :key="topic.id" class="topicbox">
        <h2 class="topichead">{{ topic.desc }}</h2>
        Responses: {{ topic.feedback.length }} <br/>
        <span v-if="topic.feedback.length > 0">&nbsp;Average Rating: {{ topicAvgRating(topic) }} <img :src="faceSVG(Math.round(topicAvgRating(topic)))"/> </span>
        
        <b-table variant="success" sort-by="rating" sort-desc v-if="topic.feedback.length > 0" ref="fbTable" hover :items="topic.feedback" :fields="feedBackTableFields">
          <template slot="rating" slot-scope="data">
            <img :src="faceSVG(data.item.rating)"/> {{ data.item.rating }} 
          </template>
        </b-table>
      </div>
    </b-card>
  </div>
</template>

<script>
import api from "../mixins/api";
import Spinner from './Spinner'

/* eslint-disable */

export default {
  name: 'Report',

  mixins: [ api ],

  components: {
    Spinner
  },

  data: function () {
    return {
      events: null,
      selectedIndex: null,
      selectedEvent: null,
      totalRespCount: 0,
      feedback: [],
      feedBackTableFields: {
        rating: { sortable: true },
        comment: { sortable: true },
        sentiment: { label: "Sentiment Score", sortable: true}
      }
    }
  },

  watch: {
    selectedIndex: function() {
      this.selectedEvent = this.events[this.selectedIndex]
      this.fetchComments()
    },

    feedback: function() {
      // Run when feedback is populated with API call
      // Copy feeback into topics
      for(let fb of this.feedback) {
        // Find relvant topic
        let topic = this.selectedEvent.topics.find(t => t.id == fb.topic)
        // Push feedback into topic feedback 
        topic.feedback.push(fb)
      }
      // Nothing works without this
      this.$forceUpdate()
    }
  },

  created: function() {
    this.apiGetAllEvents()
    .then(resp => {
      if(resp) this.events = resp.data;
    })
  },

  methods: {
    fetchComments: function() {
      // Mutate event object, insert empty feedback array into each topic
      for(let topic of this.selectedEvent.topics) {
        topic.feedback = []
      }
      // Wipe feedback
      this.feedback = []
      this.feedback = this.apiGetFeedbackForEventSync(this.selectedEvent)
    },

    topicAvgRating: function(topic) {
      let rating = 0.0;
      //let topicFeedback = this.topicFeedback(topic)
      for(let fb of topic.feedback) {
        rating += parseInt(fb.rating)
      }

      return Number(rating / topic.feedback.length).toFixed(2);
    },    
    
    faIcon: function(type) {
      switch(type) {
        case "event": return "calendar-alt"
        case "lab": return "flask"
        case "hack": return "laptop-code"
        case "workshop": return "chalkboard-teacher"
        default: return "calendar-alt" 
      }
    },

    faceSVG: function(rating) {
      return require(`../assets/img/face-${rating}.svg`);
    }
  }
}
</script>

<style>
.topichead {
  background-color: #ddd;
  padding: 0.5rem;
}
.topicbox {
  margin-bottom: 3rem;
  border: 2px solid #ddd;
}
.rating-colour-0 {
   background-color: red;
}
.rating-colour-1 {
   background-color: #FF4C3F;
}
.rating-colour-2 {
   background-color: #FFA423;
}
.rating-colour-3 {
   background-color: #FFEB23;
}
.rating-colour-4 {
   background-color: #A5E200;
}
.rating-colour-5 {
   background-color: #38E815;
}
</style>
