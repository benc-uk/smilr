<template>
  <div>
    <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
      <h1 slot="header"><fa icon="info-circle"/> &nbsp; About Smilr</h1>
      <h2>A microservices reference app</h2> 
     
      <hr/>
      Version: 1.0.0 <br/>
      &copy; Ben Coleman, 2017/2018 - <a target="_blank" href="https://opensource.org/licenses/MIT">MIT License</a><br/>
      Project &amp; source: <a target="_blank" href="https://smilr.benco.io">smilr.benco.io</a> <br>
      
      <hr/>
      API Endpoint: <a :href="apiEndpoint">{{ apiEndpoint }}</a> <br/>
      Mode: {{ mode }}
    </b-card>
  </div>
</template>

<script>
import config from '../main'

export default {
  name: 'About',

  data: function() {
    return {
      apiEndpoint: config.API_ENDPOINT,
      mode: process.env.NODE_ENV
    }
  }
}
</script>