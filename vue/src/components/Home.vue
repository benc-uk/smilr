<template>
  <div>
    <event-list filter="active"></event-list>
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
