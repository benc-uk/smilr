<template>

  <div>
    <transition-group name="fade" tag="p">
      <div v-for="event in events" :key="event.id">
        <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">

          <h1 slot="header"><fa :icon="faIcon(event.type)"/> &nbsp; {{ event.title }}</h1>
          {{ event.start | moment("dddd, MMMM Do YYYY")  }}
          
          <hr>

          <ul>
            <li v-for="topic in event.topics" :key="topic.id">
              <router-link v-if="filter == 'active'" :to="{ name: 'feedback', params: { eventId: event.id, topicId: topic.id }}">{{ topic.desc }}</router-link>
              <span v-else>{{ topic.desc }}</span>
            </li>
          </ul>

        </b-card>
        <br/>
      </div>
    </transition-group>
    
    <b-alert v-if="events && events.length <= 0" show variant="info">
      <h2>No {{ filter }} events found</h2>
    </b-alert>

    <spinner v-if="!events"></spinner>
  </div>

</template>

<script>

import api from "../mixins/api";
import Spinner from './Spinner'

export default {
  name: "EventList",

  data: function() {
    return {
      events: null
    }
  },

  mixins: [ api ],

  components: {
    Spinner
  },

  props: {
    filter: {
      type: String,
      required: true
    }
  },

  watch: {
    filter: function() {
      this.events = null;
      this.refresh()
    }
  },

  methods: {
    refresh: function() {
      this.apiGetEventsFiltered(this.filter)
      .then(resp => {
        if(resp) this.events = resp.data;
      })
    },

    faIcon: function(type) {
      switch(type) {
        case "event": return "calendar-alt"
        case "lab": return "flask"
        case "hack": return "laptop-code"
        case "workshop": return "chalkboard-teacher"
        default: return "calendar-alt" 
      }
    }    
  },

  created: function() {
    this.refresh()
  }
}
</script>

<style>
.card-body {
  font-size: 1.4rem;
}

.icon {
  height: 40px;
}

.fade-enter-active {
  animation: fadeAnim 1s;
}
@keyframes fadeAnim {
  0% {
    opacity: 0;
    transform: translate(0, 2rem)
  }
  100% {
    opacity: 1;
  }
}

.spinner {
   font-size: 6rem;
   width: 9rem;
}
</style>

