<template>
  <b-jumbotron header="Error 😢" lead="Something bad has happened" >
    <pre class="error-message">{{ message }}</pre>
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
  }
}
</script>

<style>
.error-message {
  font-size: 20px
}
</style>
