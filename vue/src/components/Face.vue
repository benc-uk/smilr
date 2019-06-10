<template>
  <div class="facebox">
    <img class="face" @click="clicked" 
      :src="utilsFaceSVG(number)" 
      :class="{ 
        'animated': true, 
        'slower': selected, 
        'infinite': selected, 
        'tada': selected, 
        'flipInX': appear, 
        'unselected': unselected }" :ref="`face${number}`">
  </div>
</template>
      
<script>
import '../assets/css/animate.css'
import utils from "../mixins/utils"

export default {
  name: 'Face',

  mixins: [ utils ],

  props: ['number', 'unselected', 'selected'],

  computed: {
    appear: function() {
      return (!this.selected && !this.unselected)
    }
  },

  mounted() {
    for(let faceRef in this.$refs) {
      this.$refs[faceRef].style.animationDelay = (Math.random() * 600 + "ms")
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