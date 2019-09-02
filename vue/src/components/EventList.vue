<template>

  <div>
    <transition-group name="fade" tag="p">
      <div v-for="event in events" :key="event._id">
        <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">

          <h1 slot="header"><fa :icon="utilsFaIcon(event.type)"/> &nbsp; {{ event.title }}</h1>
          {{ event.start | moment("dddd, MMMM Do YYYY") }}
          
          <hr>

          <ul>
            <li v-for="topic in event.topics" :key="topic.id">
              <router-link v-if="filter == 'active'" :to="{ name: 'feedback', query: { e: event._id, t: topic.id }}">{{ topic.desc }}</router-link>
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
import '../assets/css/animate.css'
import api from "../mixins/api"
import utils from "../mixins/utils"
import Spinner from './Spinner'

export default {
  name: "EventList",

  data: function() {
    return {
      events: null
    }
  },

  mixins: [ api, utils ],

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
      .catch(err => {
        // Never should get here
        console.log(err);
        
      })
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
  animation: fadeInRight 0.8s;
}

.spinner {
   font-size: 6rem;
   width: 9rem;
}
</style>

