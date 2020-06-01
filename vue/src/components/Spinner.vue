<template>
  <div style="text-align: center">
    <hollow-dots-spinner :animation-duration="800" :dot-size="35" :dots-num="3" color="#666" style="display: inline-block; width: 14rem" />
  </div>
</template>

<script>
import { HollowDotsSpinner } from 'epic-spinners'

export default {
  name: 'Spinner',

  components: {
    HollowDotsSpinner
  }
}
</script>
