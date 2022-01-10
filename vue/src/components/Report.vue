<template>
  <div>
    <h1>Feedback Report</h1>

    <spinner v-if="!events" />

    <b-form v-if="events" label="Select event to report on" inline>
      <b-form-select v-model="selectedIndex" size="lg">
        <option :value="null" disabled>
          -- Please select an event --
        </option>
        <option v-for="(event, index) in events" :key="event._id" :value="index">
          {{ event.title }}
        </option>
      </b-form-select> &nbsp;
      <b-button v-if="selectedEvent" variant="success" size="lg" @click="fetchComments">
        <fa icon="sync" /> REFRESH REPORT
      </b-button>
    </b-form>

    <br>

    <b-card v-if="selectedEvent" border-variant="primary" header-bg-variant="primary" header-text-variant="white">
      <h1 slot="header">
        {{ selectedEvent.title }}
      </h1>
      <b>Start:</b> {{ selectedEvent.start | moment("dddd, MMMM Do YYYY") }} <br>
      <b>End:</b> {{ selectedEvent.end | moment("dddd, MMMM Do YYYY") }} <br>
      <b>Type:</b> <span class="text-capitalize"> {{ selectedEvent.type }} <fa :icon="utilsFaIcon(selectedEvent.type)" /> </span> <br>
      <b>Total Responses:</b> {{ feedback.length }} <br>

      <hr>

      <div v-for="topic in selectedEvent.topics" :key="topic.id" class="topicbox">
        <h2 class="topichead">
          {{ topic.desc }}
        </h2>
        &nbsp; &bull; Responses: {{ topic.feedback.length }} <br>
        <span v-if="topic.feedback.length > 0">&nbsp; &bull; Average Rating: {{ topicAvgRating(topic) }} <img :src="utilsFaceSVG(Math.round(topicAvgRating(topic)))"> </span>
        <b-table v-if="topic.feedback.length > 0" sort-by="rating" sort-desc hover :items="topic.feedback" :fields="feedBackTableFields">
          <template #cell(rating)="data">
            <img :src="utilsFaceSVG(data.item.rating)"> {{ data.item.rating }}
          </template>
          <template #cell(sentiment)="data">
            {{ data.item.sentiment ? Math.round(data.item.sentiment * 100) + "%" : '-' }}
          </template>
        </b-table>
      </div>
    </b-card>
  </div>
</template>

<script>
import api from '../services/api'
import utils from '../mixins/utils'
import Spinner from './Spinner'

export default {
  name: 'Report',

  components: {
    Spinner
  },

  mixins: [ utils ],

  data: function () {
    return {
      events: null,
      selectedIndex: null,
      selectedEvent: null,
      totalRespCount: 0,
      feedback: [],
      feedBackTableFields: [
        { key: 'rating', sortable: true },
        { key: 'comment', sortable: true },
        { key: 'sentiment', label: 'Sentiment Score', sortable: true }
      ]
    }
  },

  watch: {
    selectedIndex: function() {
      this.selectedEvent = this.events[this.selectedIndex]
      this.fetchComments()
    },

    feedback: function() {
      // Run when feedback is populated with API call
      // ALSO copy feeback data into nested topics objects inside selected event
      for (let fb of this.feedback) {
        // Find relevant topic object
        let topic = this.selectedEvent.topics.find((t) => t.id == fb.topic)
        // Push feedback into topic feedback
        topic.feedback.push(fb)
      }
      // Nothing works without this, Vue can't seem to detect the updates
      this.$forceUpdate()
    }
  },

  created: function() {
    api.getAllEvents()
      .then((resp) => {
        if (resp) { this.events = resp.data }
      })
  },

  methods: {
    fetchComments: function() {
      // Mutate event object, insert empty feedback array into each topic
      for (let topic of this.selectedEvent.topics) {
        topic.feedback = []
      }
      // Wipe feedback
      this.feedback = []
      this.feedback = api.getFeedbackForEvent(this.selectedEvent)
    },

    topicAvgRating: function(topic) {
      let rating = 0.0

      for (let fb of topic.feedback) {
        rating += parseInt(fb.rating)
      }

      return Number(rating / topic.feedback.length).toFixed(2)
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
