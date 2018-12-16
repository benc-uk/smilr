<template>
  <div class="mx-auto spinner">
    <looping-rhombuses-spinner :animation-duration="1500" :rhombus-size="35" color="#666" />
  </div>
</template>

<script>
import { LoopingRhombusesSpinner  } from 'epic-spinners'

export default {
  name: "Spinner",

  components: {
    LoopingRhombusesSpinner
  }
}
</script>

<style>
.spinner {
   font-size: 6rem;
   width: 9rem;
}
</style>
