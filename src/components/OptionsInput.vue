<script setup>

  const props = defineProps(['type', 'title']);
 
</script>

<template>
  <div class="options-input">
    <h3 class="options-input__title">{{ props.title }}</h3>
    
    <div class="options-input__wrapper">
      <input class="options-input__main" :type="props.type" :placeholder="'placeholder'">
    </div>
  </div>
</template>

<style scoped>
.options-input {
  width: 100%;
  max-width: 300px;
  margin-bottom: 40px;
}

.options-input__title {
  margin: 0;
  margin-bottom: 5px;
  padding: 0;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.options-input__wrapper {
  border-top: 2px dashed white;
  border-bottom: 2px dashed white;
  background-color: black;
  box-shadow: 0px 2px 2px 0px black,
              0px -2px 2px 0px black;
}

.options-input__main {
  margin: 0;
  width: 100%;
  height: 40px;
  color: white;
  font-size: 16px;
  text-align: center;
  border: 0;
  background-color: transparent;
}

.options-input__main:focus {
  outline: 0;
}
</style>