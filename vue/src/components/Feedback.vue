<template>
  <div>
    <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white" v-if="event">
      <h2 slot="header" class="text-truncate">{{ topic.desc }} ({{ event.title }})</h2>  
      <div class="card-body">  
        <h3>Please provide your feedback</h3><br/>
        <div class="facegroup">
          <face number="1" :unselected="unselected[0]" :selected="selected[0]" @clicked="clickFace"></face> 
          <face number="2" :unselected="unselected[1]" :selected="selected[1]" @clicked="clickFace"></face> 
          <face number="3" :unselected="unselected[2]" :selected="selected[2]" @clicked="clickFace"></face> 
          <face number="4" :unselected="unselected[3]" :selected="selected[3]" @clicked="clickFace"></face> 
          <face number="5" :unselected="unselected[4]" :selected="selected[4]" @clicked="clickFace"></face> 
        </div>

        <b-form-textarea class="commentbox" v-model="comment" :rows="2" placeholder="Any comments (optional)" no-resize></b-form-textarea>
        <b-button @click="submitFeedback" id="submitbut" variant="success" size="lg" class="pullUp float-right" v-if="rating">SUBMIT</b-button>

      </div>    
      
      <b-modal ref="successModal" centered hide-header-close ok-only header-bg-variant="success" @ok="done" @hidden="done" ok-title="All Done" title="Feedback Received">
        <div class="d-block text-center">
          <h3>Thanks for submitting your feedback! 😊</h3>
        </div>
      </b-modal>
    </b-card>
    
    <b-modal ref="nopeModal" centered hide-header-close ok-only header-bg-variant="warning" header-text-variant="light" @ok="done" @hidden="done" ok-title="Oh yes, I forgot" title="Hey! You're keen...">
      <div class="d-block text-center">
        <h3>You've already given feedback for this topic, sorry!</h3>
      </div>
    </b-modal>     
  </div>
</template>

<script>
import api from "../mixins/api";
import cookies from "../mixins/cookies";
import Face from "./Face"

export default {
  name: 'Feedback',

  props: ['eventId', 'topicId'],

  mixins: [ api, cookies ],

  components: {
    'face': Face
  },

  data: function() {
    return  {
      event: null,
      topic: null,
      unselected: [false, false, false, false, false],
      selected: [false, false, false, false, false],
      rating: null,
      comment: ""
    }
  },

  methods: {
    clickFace: function(num) {
      for(let i in this.unselected) {
        this.$set(this.unselected, i, true)
        this.$set(this.selected, i, false)
      }
      this.$set(this.selected, num-1, true)
      this.$set(this.unselected, num-1, false)
      this.rating = num
    },

    submitFeedback: function() {
      this.apiPostFeedback({
        rating: parseInt(this.rating),
        topic: this.topicId,
        event: this.eventId,
        comment: this.comment
      })
      .then(() => {
        // Save a cookie to prevent users giving multiple feeedback
        this.cookieCreate(`feedback_${this.eventId}_${this.topicId}`, this.rating, 9999)
        this.$refs.successModal.show()
      })
    },

    done: function() {
      this.$router.push("/")
    }
  },

  mounted() {
    // Check feedback cookie
    let fbCookie = this.cookieRead(`feedback_${this.eventId}_${this.topicId}`)
    if(fbCookie) {
      this.$refs.nopeModal.show()
      return
    } 

    this.apiGetEvent(this.eventId)
    .then(resp => {
      if (resp.data) {
        this.event = resp.data
        this.topic = resp.data.topics.find(t => { if(t.id == this.topicId) return t })
        document.title = `Smilr: Feedback for: ${this.event.title} - ${this.topic.desc}` 
        
        // Check dates are valid, stop users doing direct to feedback page with URL
        let today = new Date().toISOString().substring(0, 10);    
        if(this.event.start.toString() > today || this.event.end.toString() < today) {
          this.$router.push("/")
          return;
        }         
      }
    })
  }
}
</script>

<style>
.facegroup {
  margin-bottom: 2rem;
}
.commentbox {
  font-size: calc(14px + 1vw) !important;
  width: 65% !important;
  display: inline !important;
  border: 1px solid #eee !important;
  padding: 0.5rem !important;
}
#submitbut {
  font-size: calc(14px + 1.5vw);
}
.card-body {
  padding: 1.5vw !important;
}
</style>
