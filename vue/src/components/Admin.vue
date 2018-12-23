<template>
  <div>
    <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
      <h1 slot="header"><fa icon="tools"/> &nbsp; Event Admin</h1>
      <b-button size="lg" class="bigger" variant="success" @click="newEvent"><fa icon="calendar-alt"/> ADD EVENT</b-button>

      <br/><br/>

      <spinner v-if="!events"></spinner>
      
      <b-table hover :items="events" :fields="eventTableFields" v-if="events">
        <template slot="actions" slot-scope="row">
          <div class="text-center">
          <b-button size="lg" variant="success" @click="editEvent(row)"> &nbsp; <fa icon="edit"/> &nbsp; </b-button> &nbsp;
          <b-button size="lg" variant="danger" @click="preDeleteEvent(row)"> &nbsp; <fa icon="trash-alt"/> &nbsp; </b-button>
          </div>
        </template>
      </b-table>
      
    </b-card>

    <b-modal ref="deleteModal" centered hide-header-close header-bg-variant="warning" header-text-variant="light" @ok="deleteEvent" title="Delete Event">
      <div class="d-block text-center">
        <h3>Are you sure you want to delete this event?</h3>
      </div>
    </b-modal>  

  </div>
</template>

<script>
import api from "../mixins/api"
import Spinner from './Spinner'

export default {
  name: 'Admin',

  mixins: [ api ],

  components: {
    Spinner
  },

  data: function() {
    return {
      eventTableFields: {
        title: {},
        type: { formatter: (value) => { return value.charAt(0).toUpperCase() + value.substr(1) } },
        start: { sortable: true, formatter: (value) => { return this.$options.filters.moment(value, 'MMM Do YYYY') } },
        actions: { label: 'Actions' }
      },
      events: null,
      eventToDelete: null
    }
  },

  methods: {
    editEvent: function(row) {
      let event = row.item
      this.$router.push({name: 'admin-event', params: { action: ""+event.id, editEvent: event }})
    },

    newEvent: function() {
      this.$router.push({name: 'admin-event', params: { action: 'new', editEvent: null}})
    },

    preDeleteEvent: function(row) {
      this.eventToDelete = row.item
      this.$refs.deleteModal.show()
    },
    
    deleteEvent: function() {
      this.apiDeleteEvent(this.eventToDelete)
      .then(() => {
        for(let eindex in this.events) {
          if(this.events[eindex].id == this.eventToDelete.id) this.events.splice(eindex, 1)
        }
      })
    }
  },

  created: function() {
    this.apiGetAllEvents()
    .then(resp => {
      if(resp) this.events = resp.data;
    })
  }
}
</script>