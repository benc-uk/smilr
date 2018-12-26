<template>
  <div v-if="event">
    <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
      <h1 slot="header" v-if="editEvent"><fa icon="edit"/> Edit: {{ event.title }}</h1>
      <h1 slot="header" v-else><fa icon="calendar-plus"/> Create New Event</h1>

      <b-form >
        <b-form-group label="Event Title" label-for="titleInput">
          <b-form-input v-focus id="titleInput" :state="!errors.first('title')" v-validate="'required|min:5'" v-model="event.title" type="text" name="title" placeholder="Please provide a title"></b-form-input>
          <p class="formError">{{ errors.first('title') }}</p>
        </b-form-group>

        <b-form-group label="Event Type" label-for="typeInput">
          <b-select id="typeInput" v-model="event.type" name="type" placeholder="Please provide a title" class="eventSelect">
            <option v-for="(type, index) in getEventTypes()" v-bind:value="type" :key="index" class="typeOption">
              {{ type }}
            </option> 
          </b-select><fa :icon="utilsFaIcon(event.type)" class="eventTypeIcon float-right"/>
        </b-form-group>

        <b-container class="nopadding">
          <b-row>
            <b-col sm="6">
              <b-form-group label="Event Start Date" label-for="startInput">
                <b-form-input inline  id="startInput" :state="!errors.first('start')" v-validate="'required'" v-model="event.start" type="date" name="start"></b-form-input>
                <p class="formError">{{ errors.first('start') }}</p>
              </b-form-group>          
            </b-col>
            <b-col sm="6">
              <b-form-group label="Event End Date" label-for="endInput">
                <b-form-input inline id="endInput" :state="!errors.first('end')" v-validate="'required'" v-model="event.end" type="date" name="end"></b-form-input>
                <p class="formError">{{ errors.first('end') }}</p>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <div class="topicBox">
          <div class="clearfix">
            <h2 class="float-left">Topics</h2>
            <b-button @click="addTopic()" size="lg" variant="primary" class="float-right"><fa icon="plus-square"/> ADD TOPIC</b-button>

          </div>

          <b-table hover thead-class="hiddenHeader" :items="event.topics" :fields="topicTableFields">
            <template slot="actions" slot-scope="row">
              <b-button variant="danger" @click="deleteTopic(row)"><fa icon="trash-alt"/></b-button>
            </template>
            <template slot="desc" slot-scope="row">
              <b-input v-focus :value="row.item.desc" v-model="row.item.desc"/>
            </template>            
          </b-table>
          <p class="formError" v-if="!topicsOK">Events must have at least one topic, and all must have a description</p>
        </div>

        <b-button @click="saveChanges" size="lg" variant="success" v-if="editEvent" :disabled="errors.all().length > 0 || !topicsOK"> SAVE CHANGES </b-button>
        <b-button @click="createEvent" size="lg" variant="success" v-else :disabled="errors.all().length > 0 || !topicsOK"> CREATE NEW EVENT </b-button>
        &nbsp;
        <b-button @click="cancel" size="lg" variant="default"> CANCEL </b-button>
      </b-form>

    </b-card>
  </div>
</template>

<script>
import utils from "../mixins/utils"
import api from "../mixins/api"

export default {
  name: 'AdminEvent',

  mixins: [ utils, api ],
  
  props: [ 'editEvent', 'action' ],

  computed: {
    topicsOK: function() {
      if(!this.event || !this.event.topics) return false
      if(this.event.topics.length <= 0) return false
      for(let t of this.event.topics) {
        if(t.desc.trim() == '')  return false 
      }
      return true
    }
  },

  data: function() {
    return {
      event: null,
      topicTableFields: {
        desc: { label: 'Description' },
        actions: { label: 'Actions' }
      },      
    }
  },

  created() {
    if(this.action == 'new') {
      this.event  = {
        title:  "",
        type:   "event",
        start:  "", //new Date().toISOString().substring(0, 10),
        end:    "", //new Date().toISOString().substring(0, 10),
        topics: []
      }
    } else {
      // Normally we are passed the event to edit in editEvent as a prop from the Admin component
      // However to support users reloading the browser we can fetch from the API if we have to
      if(this.editEvent) {
        this.event = this.editEvent
      } else {
        this.apiGetEvent(this.action)
        .then(resp => {
          this.event = resp.data
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
      if(this.errors.all().length > 0) return

      this.apiUpdateEvent(this.event)
      .then(() => {
        this.$router.push({name: 'admin'})
      })
    },

    createEvent: function() {
      this.$validator.validateAll()
      if(this.errors.all().length > 0) return

      this.apiCreateEvent(this.event)
      .then(() => {
        this.$router.push({name: 'admin'})
      })      
    },

    cancel: function() {
      this.$router.push({name: 'admin'})
    },

    addTopic: function() {
      let maxid = 0
      this.event.topics.map(t => { if(t.id > maxid) maxid = t.id})
      this.event.topics.push({ id: maxid + 1, desc: 'New Topic'}) 
    },

    deleteTopic: function(row) {
      this.event.topics.splice(row.index, 1);
    }
  },

  directives: {
    focus: {
      inserted: function (el) {
        if(el.value == 'New Topic') { el.focus(); el.select() }
        if(el.name == 'title') { el.focus() }
      }
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
