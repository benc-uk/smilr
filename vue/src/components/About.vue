<template>
  <div class="about">
    <h1>This is an about page ::: {{ blah }}</h1>
  </div>
</template>

<script>
export default {
  name: 'About',
  data: function () {
    return {
      blah: process.env.VUE_APP_TITLE
    }
  },
}
</script>