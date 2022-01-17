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

        <b-navbar-nav class="ms-auto">
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
      <router-view @loginComplete="refreshUser" />
    </b-container>

    <!-- User details button in footer -->
    <div class="appFooter">
      <b-button v-if="user" v-b-modal.userModal variant="outline-primary">
        <fa icon="user" /> {{ user.userName }}
      </b-button>
      <b-button v-else disabled variant="outline-primary">
        No user logged in
      </b-button>
    </div>

    <!-- Popup modal used by the user button -->
    <b-modal v-if="user" id="userModal" title="User Details" ok-only>
      <p>Name: {{ user.name }}</p>
      <p>User Name: {{ user.userName }}</p>
      <img class="photo" :src="userPhoto" alt="user">
      <b-button variant="warning" @click="logout">
        Logout
      </b-button>
    </b-modal>
  </div>
</template>

<script>
import auth from './services/auth'
import graph from './services/graph'

export default {
  name: 'App',

  data() {
    return {
      user: {},
      userPhoto: 'https://i.pravatar.cc/120'
    }
  },

  async created() {
    // Restore any cached or saved local user
    this.refreshUser()
    graph.getPhoto()
      .then((photo) => this.userPhoto = photo)
  },

  methods: {
    refreshUser() {
      this.user = auth.user()
    },

    async logout() {
      await auth.logout()

      this.$router.push({ name: 'home' })
    },
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
    padding-left: 1rem;
  }
  .bigger {
    font-size: 1.4rem !important;
    margin-right: 10px !important;
  }
  .photo {
    float: right;
    width: 120px;
    position: absolute;
    top: 5px;
    right: 10px;
    border-radius: 50%;
  }
</style>
