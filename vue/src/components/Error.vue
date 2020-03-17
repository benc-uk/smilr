<!--
  Component: Error
  Purpose:   Generic error view that can display any message
  Author:    Ben Coleman, Dec 2018
  Updated:   May 2019
-->

<template>
  <b-jumbotron header="Error 😢" lead="Something bad has happened">
    <pre class="error-message">{{ message }}</pre>
    <br>
    <b-button onclick="window.location.reload()" variant="danger">
      Try to Reload App
    </b-button>
  </b-jumbotron>
</template>

<!-- ========================================================================================== -->

<script>
export default {
  name: 'Error',

  props: [ 'message' ],

  data: function() {
    return {
      rootUrl: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port
    }
  },

  created: function() {
    // If message is empty means page has been loaded/refreshed by user directly
    // - Redirect them to home. Stops user being stuck on error page and hitting F5
    if (!this.message) {
      this.$router.push({ name: 'home' })
    }
  }
}
</script>

<!-- ========================================================================================== -->

<style>
.error-message {
  padding: 0.5rem;
  background-color: rgba(0,0,50,0.1);
  font-size: 1.2rem;
  white-space: pre-wrap;
  word-break: keep-all;
  word-wrap: break-word;
}
</style>
