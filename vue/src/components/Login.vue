<template>
  <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
    <h1 slot="header"><fa icon="user"/> &nbsp; Login Required</h1>
    To access this part of the application you must be logged in
    <br/><br/>
    <p class="text-center"><b-button @click="login" size="lg" variant="success"> &nbsp;&nbsp; <fa icon="user"/> LOGIN WITH AZURE ACTIVE DIRECTORY &nbsp;&nbsp; </b-button></p>
    
    <b-alert v-if="loginFailed" show>Login failed, please try again!</b-alert>
  </b-card>
</template>

<script>
import AuthService from '../auth/auth-service'
import GraphService from '../auth/graph-service'
import { userProfile } from '../main'

export default {
  name: 'Login',

  data() {
    return {
      authService: null,
      graphService: null,
      loginFailed: false,
      appid: process.env.VUE_APP_AAD_CLIENT_ID
    }
  },

  created() {
    this.authService = new AuthService(process.env.VUE_APP_AAD_CLIENT_ID, '/login');
    this.graphService = new GraphService();
  },

  methods:{
    login() {
      this.loginFailed = false;
      this.authService.login().then(
        user => {
          if (user) {
            userProfile.user = user
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