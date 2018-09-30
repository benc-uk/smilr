<template>
  <Page>
    <ActionBar :title="event.title" android:flat="true">
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>
    <GridLayout columns="*" rows="50, *">
      <Label text="Select the topic you want to give feedback for" row="0" col="0" class="prompt-text" textWrap="true"/>

      <ListView class="list-group" for="topic in event.topics" @itemTap="topicTap" row="1" col="0" >
        <v-template>
          <Label :text="topic.desc" :class="{'list-group-item': true, disabled: hasFeedbackBeenSent(event.id, topic.id) }"/>

        </v-template>
      </ListView>
    </GridLayout>
    </Page>
</template>


<script>
import apiMixin from "../mixins/apiMixin.js";
import Topic from "./Topic.vue"
import storage from "nativescript-localstorage";

export default {
  props: {
    event: {
      type: Object
    }
  },

  methods: {
    topicTap(topic) {
      if(this.hasFeedbackBeenSent(this.event.id, topic.item.id)) return;

      this.$navigateTo(this.topicPage, {
        props: {
          eventId: this.event.id,
          topicIndex: topic.item.id,
          title: topic.item.desc + ': ' + this.event.title
        }
      })
    },

    hasFeedbackBeenSent(eventId, topicIndex) {
      let fb = storage.getItem('feedback');
      if(fb && fb[eventId]) {
        if(fb[eventId].includes(topicIndex)) return true;
      }
      return false
    }
  },

  data() {
    return {
      topicPage: Topic
    };
  }
}
</script>

<style scoped>

.prompt-text {
  font-size: 18;
  padding-top: 10;
  text-align: center;
  border-bottom-width: 2;
  border-bottom-color: #ababab;
}
.disabled {
  text-decoration: line-through;
  opacity: 0.2;
}
</style>
