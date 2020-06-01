<template v-if="ok">
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="primary">
      <b-navbar-toggle target="nav_collapse" />

      <b-navbar-brand :to="{name:'home'}" style="font-size:32px;">
        <img src="@/assets/img/logo-white.svg" class="logo"> &nbsp;Smilr
      </b-navbar-brand>
      <b-collapse id="nav_collapse" is-nav>
        <b-navbar-nav>
          <b-button size="lg" :to="{name:'events'}" class="bigger" variant="success">
            <fa icon="coffee" /> Events
          </b-button>
            &nbsp; &nbsp;
          <b-button size="lg" :to="{name:'about'}" class="bigger" variant="success">
            <fa icon="info-circle" /> About
          </b-button>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-button size="lg" :to="{name:'report'}" class="bigger" variant="warning">
            <fa icon="chart-bar" /> Report
          </b-button>
            &nbsp;&nbsp;
          <b-button size="lg" :to="{name:'admin'}" class="bigger" variant="warning">
            <fa icon="tools" /> Admin
          </b-button>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <br>

    <b-container>
      <router-view />
    </b-container>

    <div class="appFooter">
      <b-button v-if="userProfile.user" v-b-modal.userModal variant="outline-primary">
        <fa icon="user" /> {{ userProfile.user.name }}
      </b-button>
      <b-button v-else disabled variant="outline-primary">
        No user logged in
      </b-button>
    </div>

    <b-modal v-if="userProfile.user && userProfile.user.idToken" id="userModal" title="User Details" ok-only>
      <p>Name: {{ userProfile.user.name }}</p>
      <p>User Name: {{ userProfile.user.userName }}</p>
      <p>User ID: {{ userProfile.user.idToken.oid }}</p>
      <p>Tenant: {{ userProfile.user.idToken.aud }}</p>
      <p>Version: {{ userProfile.user.idToken.ver }}</p>
      <!-- There is no real logout as we don't persist the session in cookies, reloading the page works as logout! -->
      <b-button variant="warning" on-click="window.location.assign('/')">
        Logout
      </b-button>
    </b-modal>
  </div>
</template>

<script>
import { userProfile } from './main'
export default {
  name: 'App',

  data() {
    return {
      userProfile: userProfile
    }
  }
}
</script>

<style>
  .appFooter {
    width: 100%;
    text-align: right;
    margin-top: 0.5rem;
    padding: 0.8rem;
    border-top: 1px solid #ddd;
    color: #999
  }
  .logo {
    height: 45px;
  }
  .bigger {
    font-size: 1.4rem !important;
    margin-right: 10px !important;
  }
</style>
