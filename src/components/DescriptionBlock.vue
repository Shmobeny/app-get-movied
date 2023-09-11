<script setup>
  import { computed, inject } from 'vue';
  
  const hideTextAndCards = inject('hideTextAndCards');

  const props = defineProps(['item', 'showText']);

  const localization = inject('localization');
  const appLang = inject('appLang');
  
  const isEmpty = computed(() => props.item === false ? true : false);
  const descriptionElemCSS = computed(() => props.showText ? 'description description--active' : 'description');

</script>

<template>
  <div :class="descriptionElemCSS">
    <div class="shadow shadow--top"></div>
    <p class="description__text">
      <span>
        {{ isEmpty ? '' : props.item.overview ? props.item.overview : localization.description_error[appLang] }}
      </span>
    </p>
    <div class="shadow shadow--bottom"></div>
    <button v-if="props.item.overview === false" class="description__button" @click="hideTextAndCards(true)">{{ localization.buttons.skip[appLang] }}</button>
  </div>
</template>

<style scoped>
  .description {
    position: relative;
    left: 120%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-wrap: nowrap;
    flex: 1 1 50%;
    height: auto;
    color: white;
    font-size: 20px;
    transition: all 380ms ease-in-out;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  .description--active {
    left: 0%;
  }

  .description::before, .description::after {
    content: '';
    margin: auto;
  }

  .description__text {
    width: 100%;
    max-height: 100%;
    margin: 20px 0;
    padding: 20px;
    border-top: 5px dashed white;
    border-bottom: 5px dashed white;
    background-color: black;
    box-shadow: 0px 10px 2px 0px black,
                0px -10px 2px 0px black;
    overflow-y: auto;
  }

  .description__text span {
    display: block;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .description__button {
    width: 90%;
    max-width: 375px;
    margin: auto 0px 0px 0px;
    padding: 5px;
    color: black;
    font-size: 20px;
    font-weight: bold;
    text-transform: uppercase;
    border: 0px solid black;
    border-radius: 5px;
    background-color: orange;
    box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1),
                inset 0px 0px 0px 0px rgba(0, 0, 0, 1);
    transition: all 380ms ease-in-out;
    cursor: pointer;
  }

  .shadow {
    position: relative;
    display: block;
    width: 100%;
    height: 24px;
    background: rgb(0,0,0);
    z-index: 10;
  }

  .shadow--top {
    top: 24px;
    transform: translateY(100%);
    background: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  }
  .shadow--bottom {
    top: -24px;
    transform: translateY(-100%);
    background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  }
</style>