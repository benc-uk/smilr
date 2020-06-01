<template>
  <div>
    <h1>Browse Events</h1>
    <b-form-group label="Find events by time range" description="Select a time range filter">
      <b-form-select v-model="time" class="mb-3" size="lg">
        <option value="null" disabled>
          -- Please select an option --
        </option>
        <option value="past">
          Past
        </option>
        <option value="active">
          Active
        </option>
        <option value="future">
          Future
        </option>
      </b-form-select>
    </b-form-group>

    <event-list v-if="time" :filter="time" />
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
      time: 'active'
    }
  }

}
</script>