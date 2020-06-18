<template>
  <div>
    <transition-group name="fade" tag="p">
      <div v-for="event in events" :key="event._id">
        <b-card :border-variant="variant" :header-bg-variant="variant" header-text-variant="white">
          <h2 slot="header">
            <fa :icon="utilsFaIcon(event.type)" /> &nbsp; {{ event.title }}
          </h2>
          {{ event.start | moment("dddd, MMMM Do YYYY") }}
          <hr>
          <ul>
            <li v-for="topic in event.topics" :key="topic.id">
              <router-link v-if="filter == 'active'" :to="{ name: 'feedback', query: { e: event._id, t: topic.id }}">
                {{ topic.desc }}
              </router-link>
              <span v-else>{{ topic.desc }}</span>
            </li>
          </ul>
        </b-card>
        <br>
      </div>
    </transition-group>

    <b-alert v-if="events && events.length <= 0" show variant="info">
      <h2>No {{ filter }} events found</h2>
    </b-alert>

    <spinner v-if="!events" />
  </div>
</template>

<script>
import '../assets/css/animate.css'
import api from '../mixins/api'
import utils from '../mixins/utils'
import Spinner from './Spinner'

export default {
  name: 'EventList',

  components: {
    Spinner
  },

  mixins: [ api, utils ],

  props: {
    filter: {
      type: String,
      required: true,
    }
  },

  data: function() {
    return {
      events: null
    }
  },

  computed: {
    variant: function () {
      return this.filter == 'active' ? 'primary' : 'secondary'
    }
  },

  watch: {
    filter: function() {
      this.events = null
      this.refresh()
    }
  },

  created: function() {
    this.refresh()
  },

  methods: {
    refresh: function() {
      this.apiGetEventsFiltered(this.filter)
        .then((resp) => {
          if (resp && resp.data) { this.events = resp.data }
        })
        .catch((err) => {
          // Never should get here
          console.log(err)
        })
    }
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

