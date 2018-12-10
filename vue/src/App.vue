<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="primary">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand :to="{name:'home'}" style="font-size:32px;"><img src="./assets/logo-white.svg" class="logo"> &nbsp;Smilr</b-navbar-brand>
       <b-collapse is-nav id="nav_collapse">
          <b-navbar-nav >
            <b-button size="lg" :to="{name:'events'}">Events</b-button> 
            &nbsp;&nbsp;
            <b-button size="lg" :to="{name:'about'}">About</b-button>
          </b-navbar-nav>
       </b-collapse>
    </b-navbar>

    <br/>
    
    <b-container>
      <router-view/>
    </b-container>
  </div>
</template>

<style>
  .logo {
    height: 40px;
  }
</style>
