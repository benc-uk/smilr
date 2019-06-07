<template>
  <div class="facebox" ref="facebox">
    <img class="face" @click="clicked" 
      :src="faceSVG(number)" 
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
import f1 from "../assets/img/face-1.svg"

export default {
  name: 'Face',

  props: ['number', 'unselected', 'selected'],

  computed: {
    fade: function() {
      return (!this.selected && !this.unselected)
    }
  },

  methods: {
    clicked: function() {
      this.$emit('clicked', this.number);
    },
    
    faceSVG: function(rating) {
      // I hate this but ...
      // It was the only way I could find to get this to work when publicPath wasn't set to '/'
      return "../../" + require(`@/assets/img/face-${rating}.svg`);
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