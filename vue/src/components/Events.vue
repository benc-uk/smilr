<template>
  <div>
    <h1>Browse Events</h1>
    <b-form>
      <b-form-group label="Find events by time range" label-for="timeSelect">
        <b-select id="timeSelect" v-model="time">
          <option value="null" disabled>-- Please select an option --</option>
          <option value="past">Past</option>
          <option value="active">Active</option>
          <option value="future">Future</option>
        </b-select>
      </b-form-group>
    </b-form>
    <hr />
    <event-list v-if="time" :filter="time" />
  </div>
</template>

<script>
import EventList from './EventList'

export default {
  name: 'Events',

  components: {
    'event-list': EventList,
  },

  data: function () {
    return {
      time: 'active',
    }
  },
}
</script>
