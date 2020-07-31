<template>
  <Page>

    <ActionBar android.icon="res://icon" android.iconVisibility="always" title=" Smilr" android:flat="true">
      <ActionItem @tap="refresh" android.systemIcon="stat_notify_sync" android.position="actionBar"></ActionItem>
      <ActionItem @tap="settings" android.systemIcon="ic_settings" android.position="actionBar"></ActionItem>
    </ActionBar>

    <TabView>

      <TabViewItem title="Active Events">
        <ListView class="list-group" for="event in activeEvents" @itemTap="eventTap">
          <v-template>
            <FlexboxLayout flexDirection="row" class="list-group-item" alignItems="center">
              <Image :src="'~/assets/icons/' + event.type + '.png'" class="event-icon" />
              <Label :text="event.title" class="list-group-item-heading"/>
            </FlexboxLayout>
          </v-template>
        </ListView>
      </TabViewItem>

      <TabViewItem title="Future Events">
        <ListView class="list-group" for="event in futureEvents">
          <v-template>
            <FlexboxLayout flexDirection="row" class="list-group-item" alignItems="center">
              <Image :src="'~/assets/icons/' + event.type + '.png'" class="event-icon" />
              <Label :text="event.title" class="list-group-item-heading"/>
            </FlexboxLayout>
          </v-template>
        </ListView>
      </TabViewItem>

      <TabViewItem title="Past Events">
        <ListView class="list-group" for="event in pastEvents" @itemTap="eventTap">
          <v-template>
            <FlexboxLayout flexDirection="row" class="list-group-item" alignItems="center">
              <Image :src="'~/assets/icons/' + event.type + '.png'" class="event-icon" />
              <Label :text="event.title" class="list-group-item-heading"/>
            </FlexboxLayout>
          </v-template>
        </ListView>
      </TabViewItem>

    </TabView>
  </Page>
</template>


<script>
import apiMixin from "../mixins/apiMixin.js";
import Event from "./Event.vue"
import Settings from "./Settings.vue"
import storage from "nativescript-localstorage";
import * as Toast from 'nativescript-toast';
 
const DEFAULT_API_ENDPOINT = "https://smilr-api.azurewebsites.net/api"

export default {
  mixins: [ apiMixin ],

  created() {
    if(!storage.getItem('apiEndpoint')) storage.setItem('apiEndpoint', DEFAULT_API_ENDPOINT)
    this.refresh();
  },

  methods: {
    eventTap(event) {
      this.$navigateTo(this.eventPage, {
        props: {
          event: event.item
        }
      })
    },

    refresh() {
      this.apiFetchEvents('active')
      .then(result => this.activeEvents = result)
      .catch(err => {
        Toast.makeText(err.message, "long").show();
        this.activeEvents = [];
      })

      this.apiFetchEvents('future')
      .then(result => this.futureEvents = result)
      .catch(err => {
        Toast.makeText(err.message, "long").show();
        this.futureEvents = [];
      })
      
      this.apiFetchEvents('past')
      .then(result => this.pastEvents = result)
      .catch(err => {
        Toast.makeText(err.message, "long").show();
        this.pastEvents = [];
      })
    },

    settings() {
      this.$navigateTo(this.settingsPage);
    }
  },

  data() {
    return {
      eventPage: Event,
      settingsPage: Settings,
      activeEvents: [],
      pastEvents: [],
      futureEvents: []
    };
  }
};
</script>


<style>
.event-icon {
  width: 120px; 
  height: 120px;
  margin-right: 20px;
}
</style>
