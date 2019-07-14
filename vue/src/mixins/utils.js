/* eslint-disable */

export default {
  methods: {
    utilsFaIcon: function(type) {
      switch(type) {
        case "event": return "calendar-alt"
        case "lab": return "flask"
        case "hack": return "laptop-code"
        case "workshop": return "chalkboard-teacher"
        default: return "calendar-alt" 
      }
    },

    getEventTypes: function() {
      return ['event', 'lab', 'hack', 'workshop']
    },

    utilsFaceSVG: function(rating) {
      return require(`@/assets/img/face-${rating}.svg`);
    }    
  }
}