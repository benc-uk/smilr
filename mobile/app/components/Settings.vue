<template>
  <Page>
    <ActionBar title="Settings" android:flat="true">
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="goBack()" />
    </ActionBar>
    <GridLayout columns="*" rows="30, 50">
      <Label text="Smilr API Endpoint:" row="0" col="0" class="prompt-text"/>
      <TextField v-model="apiField" hint="Smilr API Endpoint URL" row="1" col="0" />
    </GridLayout>
    </Page>
</template>


<script>
import storage from "nativescript-localstorage";

export default {
  methods: {
    goBack() {
      storage.setItem('apiEndpoint', this.apiField)
      this.$navigateBack()
    }
  },

  created() {
    this.apiField = storage.getItem('apiEndpoint');
  },

  data() {
    return {
      apiField: ""
    }
  },
}
</script>

<style scoped>

.prompt-text {
  font-size: 16;
  padding-top: 5;
  padding-left: 10;
}
</style>
