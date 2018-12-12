<template>
  <div>
    <div v-for="event in events" :key="event.id" >
      <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
        <h1 slot="header"><img :src="'imgs/events/'+event.type+'-w.svg'" class="icon"/> &nbsp; {{ event.title }}</h1>
        {{ event.start | moment("dddd, MMMM Do YYYY")  }}
        <hr>
        <ul>
          <li v-for="topic in event.topics" :key="topic.id"><router-link :to="{ name: 'feedback', params: { eventId: event.id, topicId: topic.id }}">{{ topic.desc }}</router-link></li>
        </ul>
      </b-card>
      <br/>
    </div>
  </div>
</template>

<script>
import api from "../mixins/api";

export default {
  name: "EventList",

  data: function() {
    return {
      events: null
    }
  },

  mixins: [ api ],

  props: {
    filter: {
      type: String,
      required: true
    }
  },

  created: function() {
    this.apiGetEventsFiltered(this.filter)
    .then(data => {
      this.events = data;
    })
  }
}
</script>

<style>

.card-body {
  font-size: 1.6rem;
}
.icon {
  height: 40px;
}
</style>

