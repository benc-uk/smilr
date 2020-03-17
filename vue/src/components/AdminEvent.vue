<template>
  <div v-if="event">
    <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
      <h1 v-if="editEvent" slot="header">
        <fa icon="edit" /> Edit: {{ event.title }}
      </h1>
      <h1 v-else slot="header">
        <fa icon="calendar-plus" /> Create New Event
      </h1>

      <b-form>
        <b-form-group label="Event Title" label-for="titleInput">
          <b-form-input id="titleInput" v-model="event.title" v-focus v-validate="'required|min:5'" :state="!errors.first('title')" type="text" name="title" placeholder="Please provide a title" />
          <p class="formError">
            {{ errors.first('title') }}
          </p>
        </b-form-group>

        <b-form-group label="Event Type" label-for="typeInput">
          <b-select id="typeInput" v-model="event.type" name="type" placeholder="Please provide a title" class="eventSelect" :disabled="action!='new'">
            <option v-for="(type, index) in getEventTypes()" :key="index" :value="type" class="typeOption">
              {{ type }}
            </option>
          </b-select><fa :icon="utilsFaIcon(event.type)" class="eventTypeIcon float-right" />
        </b-form-group>

        <b-container class="nopadding">
          <b-row>
            <b-col sm="6">
              <b-form-group label="Event Start Date" label-for="startInput">
                <b-form-input id="startInput" v-model="event.start" v-validate="'required'" inline :state="!errors.first('start') && datesOK" type="date" name="start" />
                <p class="formError">
                  {{ errors.first('start') }}
                </p>
                <p v-if="!datesOK" class="formError">
                  Start date must be on or before end date
                </p>
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group label="Event End Date" label-for="endInput">
                <b-form-input id="endInput" ref="endRef" v-model="event.end" v-validate="'required'" inline :state="!errors.first('end') && datesOK" type="date" name="end" />
                <p class="formError">
                  {{ errors.first('end') }}
                </p>
                <p v-if="!datesOK" class="formError">
                  End date must be on or after start date
                </p>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <div class="topicBox">
          <div class="clearfix">
            <h2 class="float-left">
              Topics
            </h2>
            <b-button size="lg" variant="primary" class="float-right" @click="addTopic()">
              <fa icon="plus-square" /> ADD TOPIC
            </b-button>
          </div>

          <b-table hover thead-class="hiddenHeader" :items="event.topics" :fields="topicTableFields">
            <template v-slot:cell(actions)="data">
              <b-button variant="danger" @click="deleteTopic(data.item.id)">
                <fa icon="trash-alt" :title="'id:'+data.item.id" />
              </b-button>
            </template>
            <template v-slot:cell(desc)="data">
              <b-input v-model="data.item.desc" v-focus :value="data.item.desc" />
            </template>
          </b-table>
          <p v-if="!topicsOK" class="formError">
            Events must have at least one topic, and all must have a description
          </p>
        </div>

        <b-button v-if="editEvent" size="lg" variant="success" :disabled="errors.all().length > 0 || !topicsOK" @click="saveChanges">
          SAVE CHANGES
        </b-button>
        <b-button v-else size="lg" variant="success" :disabled="errors.all().length > 0 || !topicsOK" @click="createEvent">
          CREATE NEW EVENT
        </b-button>
        &nbsp;
        <b-button size="lg" variant="secondary" @click="cancel">
          CANCEL
        </b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import utils from '../mixins/utils'
import api from '../mixins/api'

export default {
  name: 'AdminEvent',

  directives: {
    focus: {
      // Minor UX, new topics get focus automatically,
      inserted: function (el) {
        el.focus()
      }
    }
  },

  mixins: [ utils, api ],

  props: [ 'editEvent', 'action' ],

  data: function() {
    return {
      event: null,
      topicTableFields: [
        { key: 'desc', label: 'Description' },
        { key: 'actions', label: 'Actions' }
      ]
    }
  },

  computed: {
    topicsOK: function() {
      if (!this.event || !this.event.topics) { return false }
      if (this.event.topics.length <= 0) { return false }

      for (let t of this.event.topics) {
        if (t.desc.trim() == '')  { return false }
      }
      return true
    },

    datesOK: function() {
      return this.event.start <= this.event.end
    }
  },

  created() {
    if (this.action == 'new') {
      this.event  = {
        title:  '',
        type:   'event',
        start:  '', //new Date().toISOString().substring(0, 10),
        end:    '', //new Date().toISOString().substring(0, 10),
        topics: []
      }
    } else {
      // Normally we are passed the event to edit in editEvent as a prop from the Admin component
      // However to support users reloading the browser we can fetch from the API if we have to
      if (this.editEvent) {
        this.event = this.editEvent
        this.event.start = this.event.start.substring(0, 10)
        this.event.end = this.event.end.substring(0, 10)
      } else {
        this.apiGetEvent(this.action)
          .then((resp) => {
            this.event = resp.data
            this.event.start = this.event.start.substring(0, 10)
            this.event.end = this.event.end.substring(0, 10)
          })
      }
    }
  },

  mounted() {
    this.$validator.validateAll()
  },

  methods: {
    saveChanges: function() {
      this.$validator.validateAll()
      if (this.errors.all().length > 0) { return }

      this.apiUpdateEvent(this.event)
        .then((resp) => {
          if (resp) { this.$router.push({ name: 'admin' }) }
        })
    },

    createEvent: function() {
      this.$validator.validateAll()
      if (this.errors.all().length > 0) { return }

      this.apiCreateEvent(this.event)
        .then((resp) => {
          if (resp) { this.$router.push({ name: 'admin' }) }
        })
    },

    cancel: function() {
      this.$router.push({ name: 'admin' })
    },

    addTopic: function() {
      let maxid = 0
      this.event.topics.map((t) => { if (t.id > maxid) { maxid = t.id } })
      this.event.topics.push({ id: maxid + 1, desc: 'New Topic' })
    },

    deleteTopic: function(id) {
      this.event.topics = this.event.topics.filter((t) => { return t.id != id })
    }
  }
}
</script>

<style>
.formError {
  color: #FF0039;
  font-size: 60%;
}
.typeOption {
  text-transform: capitalize
}
.eventSelect {
  width: 85%  !important
}
.eventTypeIcon {
  font-size: 3rem;
}
.topicBox {
  padding: 0.2rem
}
.nopadding {
  padding: 0 !important;
}
.hiddenHeader {
  display: none !important;
}
</style>
