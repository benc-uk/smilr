<template>
  <b-jumbotron header="Error 😢" lead="Something bad has happened" >
    <p class="error-message">{{ message }}</p>
    <br/>
    <b-button :href="rootUrl" variant="danger">Try to Reload App</b-button>
  </b-jumbotron>
</template>

<script>

export default {
  name: 'Error',

  props: ['message'],

  data: function() {
    return {
      rootUrl: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port
    }
  },

  created: function() {
    // If message is empty means page has been loaded/refreshed by user directly
    // - Redirect them to home. Stops user being stuck on error page and hitting F5 
    if(!this.message) {
      this.$router.push({name:'home'})
    }
  }
}
</script>

<style>
.error-message {
  font-size: 1.7rem
}
</style>
