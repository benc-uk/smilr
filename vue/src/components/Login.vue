<template>
  <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
    <h1 slot="header"><fa icon="user"/> &nbsp; Login Required</h1>
    To access this part of the application you must be logged in
    <br/><br/>
    <p class="text-center">
      <b-button @click="login" size="lg" variant="success"> 
      &nbsp;&nbsp; <fa icon="user"/> LOGIN WITH AZURE ACTIVE DIRECTORY &nbsp;&nbsp; </b-button>
    </p>
    
    <b-alert v-if="loginFailed" show> <b>Login failed!</b> <br>{{ loginError }}</b-alert>
  </b-card>
</template>

<script>
/* eslint-disable */
import { userProfile } from '../main'
import { config } from '../main'
import * as Msal from 'msal'
import axios from 'axios'

var msalApp = null;

export default {
  name: 'Login',

  props: ['redir'],

  data() {
    return {
      authService: null,
      loginFailed: false,
      loginError: null
    }
  },

  created() {
    let redirectUri = window.location.origin + '/login'

    const msalApplicationConfig = {
      auth: {
        clientId: config.AAD_CLIENT_ID,
        redirectUri: redirectUri
      }
    }

    // create UserAgentApplication instance
    msalApp = new Msal.UserAgentApplication(msalApplicationConfig);
  },

  methods: {
    login() {
      this.loginFailed = false;

      let loginRequest = {
        scopes: [ 'user.read', 'offline_access', 'profile', `api://${config.AAD_CLIENT_ID}/smilr.events`  ]
      }

      let accessTokenRequest = {
        scopes: [ 'offline_access', `api://${config.AAD_CLIENT_ID}/smilr.events`  ] 
      }

      msalApp.loginPopup(loginRequest).then(loginResponse => {   
        return msalApp.acquireTokenSilent(accessTokenRequest).then(tokenResp => {
          userProfile.token = tokenResp.accessToken;
          userProfile.user = msalApp.getAccount();  
          userProfile.isAdmin = true;
          //console.log(userProfile.token);

          // Check against list of admins
          // if(config.ADMIN_USER_LIST) {
          //   for(let userName of config.ADMIN_USER_LIST.split(',')) {
          //     if(userName.trim().toLowerCase() == userProfile.user.userName.toLowerCase()) {
          //       userProfile.isAdmin = true
          //       break
          //     }          
          //   }
          // }   

          if(this.redir)
            this.$router.push({ name: this.redir })
          else
            this.$router.push({ name: 'home' })  
        })
      }).catch(error => {  
        console.log("### MSAL Error "+error.toString());
        this.loginFailed = true;
        this.loginError = error.toString()
      });
    }     
  }
}
</script>