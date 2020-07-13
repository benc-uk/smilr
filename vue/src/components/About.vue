<template>
  <div>
    <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
      <h1 slot="header">
        <fa icon="info-circle" /> &nbsp; About Smilr
      </h1>
      <h2>A microservices &amp; SPA reference / demonstration app</h2>
      <img :src="utilsFaceSVG(faceRating)" class="aboutface animated rubberBand infinite slow" @click="easter">
      <h5>{{ egg }}</h5>

      <hr>

      <b>Version: {{ ver }} (Vue.js)</b><br>
      &copy; Ben Coleman, 2017 - 2019<br>
      Provided under the <a target="_blank" href="https://opensource.org/licenses/MIT">MIT License</a><br><br>
      <b-button size="lg" variant="primary" href="https://smilr.benco.io" target="_blank">
        Project details &amp; source code (GitHub)
      </b-button>

      <hr>

      <pre>
<b>API Endpoint:</b> {{ apiEndpoint }}
<b>Mode:</b> {{ mode }}
<b>Build Info:</b> {{ buildInfo }}

<b>More Details:</b> <a :href="infoUrl" target="_blank">{{ apiEndpoint }}/info</a></pre>
    </b-card>
  </div>
</template>

<script>
import '../assets/css/animate.css'
import utils from '../mixins/utils'

export default {
  name: 'About',

  mixins: [ utils ],

  data: function() {
    return {
      apiEndpoint: this.$config.API_ENDPOINT,
      infoUrl: `${this.$config.API_ENDPOINT}/info`,
      mode: process.env.NODE_ENV,
      buildInfo: process.env.VUE_APP_BUILD_INFO || 'No build info',
      egg: '',
      faceRating: 5,
      ver: require('../../package.json').version
    }
  },

  methods: {
    easter: function() {
      this.egg = 'This is probably where I could put a clever hidden easter egg. But I haven\'t bothered. Bye!'
      this.faceRating--
      if (this.faceRating <= 0) { this.faceRating = 5 }
    }
  }
}
</script>

<style scoped>
.aboutface {
  width: 100px;
}
pre {
  background-color: rgb(228, 228, 228);
  padding: 1rem;
  font-size: 70%;
}
</style>
