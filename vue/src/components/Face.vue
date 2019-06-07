<template>
  <div class="facebox" ref="facebox">
    <img class="face" @click="clicked" :src="utilsFaceSVG(number)" 
      :class="{ 
        'animated': true, 
        'slower': selected, 
        'infinite': selected, 
        'tada': selected, 
        'zoomInDown': fade, 
        'unselected': unselected }">
  </div>
</template>

<script>
/* eslint-disable */

import '../assets/css/animate.css'
import utils from "../mixins/utils"

export default {
  name: 'Face',

  props: ['number', 'unselected', 'selected'],

  mixins: [ utils ],

  computed: {
    fade: function() {
      return (!this.selected && !this.unselected)
    }
  },

  methods: {
    clicked: function() {
      this.$emit('clicked', this.number);
    }
  }
}
</script>

<style>
.face {
  width: 18%;
  filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.75));
  transition: 0.3s ease-in-out;
}
.face:hover {
  filter: drop-shadow(0px 1em 0.6em rgba(0, 0, 0, 0.75));
  transform: translate(0px, -16px);
  transition: 0.3s ease-in-out;
}
.facebox {
  display:inline;
  margin: 1%;
}
.unselected {
   filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.75)) saturate(10%);
   opacity: 0.5;
}
</style>