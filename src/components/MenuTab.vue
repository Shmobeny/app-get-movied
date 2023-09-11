<script setup>
  import { computed, inject } from 'vue';

  const props = defineProps(['lang', 'activeTab', 'isHidden', 'type', 'icon']);
  const emit = defineEmits(['selectTab']);

  const localization = inject('localization');
  const appLang = inject('appLang');

  const bodyCSS = computed(() => props.activeTab === props.type ? 'body body--active' :
                                 props.isHidden ? 'body body--hidden' : 'body');
  const contentCSS = computed(() => `content content--${props.type}`);
</script>

<template>
  <div :class="bodyCSS" @click="$emit('selectTab', props.type)">

    <div v-if="props.activeTab === props.type" class="phantom-buttons">
      <!-- <div v-if="props.activeTab !== 'settings'" class="phantom-buttons__btn" @click="$emit(selectTab, 'settings')"></div> -->
      <div v-if="props.activeTab !== 'watchlist'" class="phantom-buttons__btn" :class="{'phantom-buttons__btn--after-active': props.activeTab === 'settings'}" @click.stop="$emit('selectTab', 'watchlist')"></div>
      <div v-if="props.activeTab !== 'preferences'" class="phantom-buttons__btn" :class="{'phantom-buttons__btn--after-active': props.activeTab === 'watchlist'}" @click.stop="$emit('selectTab', 'preferences')"></div>
    </div>

    <div :class="contentCSS">
      <Transition name="content" mode="out-in">
        <span v-if="props.activeTab !== props.type" class="content__title">
          <span class="material-symbols-outlined content__title-icon">{{ props.icon }}</span>
          <span>{{ localization.titles[props.type][appLang] }}</span>
        </span>
        <slot v-else>
          <span>{{ props.type }}</span>
        </slot>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.body {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 600px;
  height: 90%;
  transform: translateX(-100%);
  transition: all 380ms ease-in-out;
  animation: body 380ms ease-in-out 380ms forwards;
}

.body:nth-child(2) {
  padding-right: 40px;
  padding-bottom: 10px;
  animation-delay: 480ms;
}

.body:nth-child(3) {
  padding-right: 80px;
  padding-bottom: 20px;
  animation-delay: 580ms;
}

.body--hidden {
  padding-right: 0px !important;
  cursor: pointer;
}

.body--hidden:nth-of-type(2) {
  width: 80px;
}

.body--hidden:nth-of-type(3) {
  width: 40px;
}

.content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 10px;
  background-color: rgb(236, 236, 236);
  border-radius: 0 0 15px 0;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1);
  transition: background-color 380ms ease-in-out;
  overflow: hidden;
}

.content--watchlist {
  padding: 10px 10px 10px 50px;
}

.content--preferences {
  padding: 10px 10px 10px 90px;
}

.body--active > .content {
  background-color: white;
}

.content__title {
  position: absolute;
  top: 0;
  left: 100%;
  display: flex;
  padding-top: 5px;
  font-size: 25px;
  text-transform: uppercase;
  transform: rotate(90deg) translateY(100%);
  transform-origin: bottom left;
}

.content__title-icon {
  padding-left: 5px;
  transform: rotate(-90deg);
}

.content-enter-active,
.content-leave-active {
  transition: opacity 190ms ease-in-out;
}

.content-enter-from,
.content-leave-to {
  opacity: 0;
}

.phantom-buttons {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  max-width: 600px;
  height: 100%;
  /* background-color: rgba(255, 0, 0, 0.4); */
}

.phantom-buttons--hidden {
  display: none;
}

.phantom-buttons__btn {
  width: 40px;
  height: 100%;
  /* background-color: rgba(0, 255, 255, 0.4); */
  cursor: pointer;
}

.phantom-buttons__btn--after-active {
  margin-left: auto;
}

@keyframes body {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0%);
  }
}

@media screen and (max-width: 600px) {
  .body {
    width: 99%;
    /* height: 95%; */
  }
}
</style>