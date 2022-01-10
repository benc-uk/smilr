<template>
  <div class="facebox">
    <img
      :ref="`face${number}`" class="face animate__animated"
      :src="utilsFaceSVG(number)"
      :class="{
        'animate__slower': selected,
        'animate__infinite': selected,
        'animate__tada': selected,
        'animate__rotateIn': appear,
        'unselected': unselected }"
      @click="clicked">
  </div>
</template>

<script>
import '../assets/css/animate.css'
import utils from '../mixins/utils'

export default {
  name: 'Face',

  mixins: [ utils ],

  props: {
    number: {
      type: Number,
      required: true
    },
    unselected: {
      type: Boolean,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    appear: function() {
      return (!this.selected && !this.unselected)
    }
  },

  mounted() {
    for (let faceRef in this.$refs) {
      this.$refs[faceRef].style.animationDelay = (Math.random() * 300 + 'ms')
    }
  },

  methods: {
    clicked: function() {
      this.$emit('clicked', this.number)
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
  filter: drop-shadow(0px 0.8em 0.6em rgba(0, 0, 0, 0.75));
  transform: translate(0px, -16px) scale(1.1, 1.1) !important;
  transition: 0.3s ease-in-out !important;
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