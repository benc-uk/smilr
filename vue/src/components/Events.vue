<template>
  <div>
    <b-form-group label="Find events by time range" description="Select a time range filter">
      <b-form-select v-model="time" class="mb-3" size="lg">
        <option value="null" disabled>Please select an option</option>
        <option value="past">&nbsp;&nbsp;&nbsp;Past</option>
        <option value="active">&nbsp;&nbsp;&nbsp;Active</option>
        <option value="future">&nbsp;&nbsp;&nbsp;Future</option>
      </b-form-select>
    </b-form-group>

    <event-list :filter="time" v-if="time"></event-list>    
  </div>

</template>

<script>
import EventList from './EventList'

export default {
  name: 'Events',

  components: {
    'event-list': EventList
  },

  data: function() {
    return {
      time: null
    }
  }

}
</script>

<style>
.custom-select {
  text-indent: 1rem !important;
} 
</style>
