<template>
  <div>
    <h1>Currently Active Events</h1>
    <event-list filter="active"></event-list>
    
    <br/><br/>

    <h1>Upcoming Future Events</h1>
    <event-list filter="future"></event-list>
  </div>
</template>

<script>
import EventList from './EventList'

export default {
  name: 'Home',
  
  components: {
    'event-list': EventList
  },
}
</script>
