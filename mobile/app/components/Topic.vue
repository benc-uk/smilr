<template>
  <Page>
    <ActionBar :title="title" android:flat="true">
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>
    <GridLayout columns="auto" rows="100, 150, auto">
      <FlexboxLayout flexDirection="row" justifyContent="center" row="0" col="0">
        <Image src="~/assets/faces/face-1.png" class="face" @tap="face(1)" :class="states[0]"/>
        <Image src="~/assets/faces/face-2.png" class="face" @tap="face(2)" :class="states[1]"/>
        <Image src="~/assets/faces/face-3.png" class="face" @tap="face(3)" :class="states[2]"/>
        <Image src="~/assets/faces/face-4.png" class="face" @tap="face(4)" :class="states[3]"/>
        <Image src="~/assets/faces/face-5.png" class="face" @tap="face(5)" :class="states[4]"/>
      </FlexboxLayout>

      <TextView textWrap="true" hint="Optional comments" v-model="commentText" width="100%" class="input input-border" row="1" col="0">
      </TextView>

      <FlexboxLayout flexDirection="row" justifyContent="center" row="2" col="0">
        <Button text=" Submit " @tap="send" :isEnabled="rating > 0" class="btn btn-primary" style="font-size: 30px"/>
      </FlexboxLayout>
    </GridLayout>
  </Page>
</template>


<script>
import apiMixin from "../mixins/apiMixin.js";
import storage from "nativescript-localstorage";

export default {
  mixins: [ apiMixin ],

  methods: {
    send(evt) {
      console.log("### Sending feedback! comment:["+this.commentText+"] rating:"+this.rating)
      this.apiSendFeedback(this.eventId, this.topicIndex, this.commentText, this.rating)
      .then(r => {
        let fb = storage.getItem('feedback');
        
        if(fb && fb[this.eventId]) {
          let topics = fb[this.eventId];
          topics.push(this.topicIndex);
          storage.setItemObject('feedback', fb);
        } else {
          if(fb) {
            fb[this.eventId] = [this.topicIndex]
            storage.setItemObject('feedback', fb);
          } else {
            let newFb = {};
            newFb[this.eventId] = [this.topicIndex];
            storage.setItemObject('feedback', newFb);
          }
        }

        alert({
          title: "Thanks!",
          message: "Your feedback has been submitted",
          okButtonText: "No problem!"
        })
        .then(() => {
          this.$navigateBack()
        });
      })
      .catch(err => {
        console.log(`### API Error! ${err}`);
        alert({
          title: "ERROR!",
          message: "There was an error submitting the feedback",
          okButtonText: "Whoops!"
        })
        .then(() => {
          this.$navigateBack()
        });        
      })
    },

    face(pressedRating) {
      this.rating = pressedRating;
      for(var o = 0; o <= 5; o++) this.states[o] = "face"
      this.states[pressedRating - 1] = "face-selected"
    }
  },

  data() {
    return {
      commentText: "",
      rating: 0,
      states: ["face", "face", "face", "face", "face"]
    }
  },

  props: {
    title: {
      type: String
    },
    eventId: {
      type: String
    },
    topicIndex: {
      type: Number
    }
  }
}
</script>

<style>
.face {
  width: 70;
  margin: 5;
  opacity: 0.3;
}

.face-selected {
  width: 90;
  margin: 0;
  opacity: 1.0;
}

.large {
  font-size: 100px !important;
}
</style>

