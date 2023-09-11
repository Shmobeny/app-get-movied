<script setup>
  import { inject } from 'vue';
  const props = defineProps(['lang', 'type']);
  const localization = inject('localization');
  const appLang = inject('appLang');
</script>

<template>
  <div class="tab-wrapper">
    <h2 class="tab-wrapper__title">{{ localization.titles[props.type][appLang] }}</h2>
    <div class="tab-wrapper__main-content">
      <slot>Not available right now</slot>
    </div>
  </div>
</template>

<style scoped>
.tab-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tab-wrapper__title {
  margin: 0;
  padding: 10px;
  text-transform: uppercase;
  border-bottom: 1px solid gray;
}

.tab-wrapper__main-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px 10px 0px 10px;
  overflow: hidden;
  overflow-y: auto;
}

.tab-wrapper__main-content::before,
.tab-wrapper__main-content::after {
  content: '';
  margin: auto;
}
</style>