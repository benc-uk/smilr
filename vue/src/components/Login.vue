<template>
  <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
    <h1 slot="header"><fa icon="user"/> &nbsp; Login Required</h1>
    To access this part of the application you must be logged in
    <br/><br/>
    <p class="text-center">
      <b-button @click="login" size="lg" variant="success"> 
      &nbsp;&nbsp; <fa icon="user"/> LOGIN WITH AZURE ACTIVE DIRECTORY &nbsp;&nbsp; </b-button>
    </p>
    
    <b-alert v-if="loginFailed" show>Login failed, please try again!</b-alert>
  </b-card>
</template>

<script>
/* eslint-disable */
import AuthService from '../lib/auth-service'
import { userProfile } from '../main'
import { config } from '../main'

export default {
  name: 'Login',

  props: ['redir'],

  data() {
    return {
      authService: null,
      loginFailed: false
    }
  },

  created() {
    this.authService = new AuthService(config.AAD_CLIENT_ID, '/login')
  },

  methods: {
    login() {
      this.loginFailed = false;
      this.authService.login().then(
        resp => {
          if (resp) {
            // Access tokens are sometimes encrypted, I give up with them
            //this.authService.getToken(resp.user).then(accessToken => console.log("$$$ AT", accessToken) )
            
            // Store everything, including idToken
            userProfile.user = resp.user
            userProfile.idToken = resp.idToken
            userProfile.isAdmin = false
            
            // Check against list of admins
            if(config.ADMIN_USER_LIST) {
              for(let userName of config.ADMIN_USER_LIST.split(',')) {
                if(userName.trim().toLowerCase() == userProfile.user.displayableId.toLowerCase()) {
                  userProfile.isAdmin = true
                  break
                }          
              }
            }

            // Redirect if we have a route to forward onto
            if(this.redir)
              this.$router.push({ name: this.redir })
            else
              this.$router.push({ name: 'admin' })
          } else {
            this.loginFailed = true;
          }
        },
        () => {
          this.loginFailed = true;
        }
      );
    }     
  }
}
</script>