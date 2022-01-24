<template>
  <div>
    <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
      <h1 slot="header">
        <fa icon="tools" />
        &nbsp; Event Admin
      </h1>
      <b-button size="lg" class="bigger" variant="success" @click="newEvent">
        <fa icon="calendar-alt" />
        ADD EVENT
      </b-button>

      <spinner v-if="!events" />

      <b-table v-if="events" hover :items="events" :fields="eventTableFields" class="mt-5">
        <template #cell(actions)="data">
          <b-button size="lg" variant="success" @click="editEvent(data.item)">
            &nbsp;
            <fa icon="edit" />
            &nbsp;
          </b-button>
          &nbsp;
          <b-button size="lg" variant="danger" @click="preDeleteEvent(data.item)">
            &nbsp;
            <fa icon="trash-alt" />
            &nbsp;
          </b-button>
        </template>
      </b-table>
    </b-card>

    <b-modal ref="deleteModal" centered hide-header-close header-bg-variant="warning" header-text-variant="light" title="Delete Event" @ok="deleteEvent">
      <div class="d-block text-center">
        <h3>Are you sure you want to delete this event?</h3>
      </div>
    </b-modal>
  </div>
</template>

<script>
import api from '../services/api'
import Spinner from './Spinner'

export default {
  name: 'Admin',

  components: {
    Spinner,
  },

  data: function () {
    return {
      eventTableFields: [
        { key: 'title', sortable: true },
        {
          key: 'type',
          sortable: true,
          formatter: (value) => {
            return value.charAt(0).toUpperCase() + value.substr(1)
          },
        },
        {
          key: 'start',
          sortable: true,
          formatter: (value) => {
            return new Date(value).toUTCString().substr(0, 16)
          },
        },
        { key: 'actions', sortable: false },
      ],
      events: null,
      eventToDelete: null,
    }
  },

  created: function () {
    api.getAllEvents().then((resp) => {
      if (resp) {
        this.events = resp.data
      }
    })
  },

  methods: {
    editEvent: function (event) {
      this.$router.push({ name: 'admin-event', params: { action: '' + event._id, editEvent: event } })
    },

    newEvent: function () {
      this.$router.push({ name: 'admin-event', params: { action: 'new', editEvent: {} } })
    },

    preDeleteEvent: function (event) {
      this.eventToDelete = event
      this.$refs.deleteModal.show()
    },

    deleteEvent: function () {
      api.deleteEvent(this.eventToDelete).then((resp) => {
        if (resp) {
          for (let eindex in this.events) {
            if (this.events[eindex]._id == this.eventToDelete._id) {
              this.events.splice(eindex, 1)
            }
          }
        }
      })
    },
  },
}
</script>
