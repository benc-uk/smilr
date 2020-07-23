<template>
  <b-card border-variant="primary" header-bg-variant="primary" header-text-variant="white">
    <h1 slot="header">
      <fa icon="user" /> &nbsp; Login Required
    </h1>
    To access this part of the application you must be logged in
    <br><br>
    <p class="text-center">
      <b-button size="lg" variant="success" @click="login">
        &nbsp;&nbsp; <fa icon="user" /> LOGIN WITH AZURE ACTIVE DIRECTORY &nbsp;&nbsp;
      </b-button>
    </p>

    <b-alert v-if="loginFailed" show>
      <b>Login failed!</b> <br>{{ loginError }}
    </b-alert>
  </b-card>
</template>

<script>
import auth from '../services/auth'

export default {
  name: 'Login',

  props: {
    redir: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      loginFailed: false,
      loginError: null
    }
  },

  methods: {
    async login() {
      try {
        this.loginFailed = false
        await auth.login()
        this.$emit('loginComplete')

        // Direct to root or redir path if provided
        if (this.redir) {
          this.$router.push({ name: this.redir })
        } else {
          this.$router.push({ name: 'home' }).catch(() => {})
        }
      } catch (err){
        console.log('### MSAL Error ' + err.toString())
        this.loginFailed = true
        this.loginError = err.toString()
      }
    }
  }
}
</script>