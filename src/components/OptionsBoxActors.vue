<script setup>
  import { inject } from 'vue';
  import ActorTag from './ActorTag.vue';

  const localization = inject('localization');
  const appLang = inject('appLang');

  const gamePreferences = inject('gamePreferences');
  const updateIncludedActors = inject('updateIncludedActors');

  function onBeforeLeave(elem) {
    const elemInfo = {
      width: elem.offsetWidth,
      left: elem.offsetLeft,
      top: elem.offsetTop
    }

    elem.style.width = elemInfo.width + 'px';
    elem.style.left = elemInfo.left + 'px';
    elem.style.top = elemInfo.top + 'px';
  }

</script>

<template>
  <Transition name="info">
    <p v-if="gamePreferences.include_actors.length === 0" class="options-box__items-info">
      {{ localization.preferences.actors_info[appLang].split('. ')[0] }}.<br>
      {{ localization.preferences.actors_info[appLang].split('. ')[1] }}
      <!-- No actors selected. <br> Add new names to the filter, by using this input field above. -->
    </p>
  </Transition>
  
  <TransitionGroup name="tags" @before-leave="onBeforeLeave">
    <div
      v-for="(actor, index) in gamePreferences.include_actors"
      :key="actor.id"
      class="options-box__item options-box__item--actor"
      @click="updateIncludedActors(index)"
    >
      <ActorTag :actor="actor" />
      <!-- <div class="actor-picture" :style="{ backgroundImage: `url(https://image.tmdb.org/t/p/w500/${actor.picture})` }">
        <span v-if="!actor.picture" class="material-symbols-outlined">face</span>
      </div>
      <span class="actor-name">{{ actor.name }}</span>
      <span class="material-symbols-outlined actor-remove">close</span> -->
    </div>
  </TransitionGroup>
  
</template>

<style scoped>
.options-box__item--actor {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 95%;
  height: 50px;
  padding-left: 5px;
  padding-right: 15px;
  border-radius: 25px 5px 25px 25px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}

.options-box__item--actor::after {
  content: '';
  top: 0;
  left: 100%;
  position: absolute;
  display: block;
  width: 15px;
  height: 100%;
  background: rgb(255,255,255);
  background: linear-gradient(265deg, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 100%);
  transform: translateX(-100%);
}

.actor-picture {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: inset 1px 1px 1px 1px rgba(0, 0, 0, 0.4);
  background-color: #f9c00e;
  background-size: cover;
  background-repeat: no-repeat;
}

.actor-picture > img {
  width: 100%;
  display: block;
}

.actor-remove {
  position: absolute;
  top: 1px;
  left: 100%;
  color: white;
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  transform: translateX(-106%);
  z-index: 1;
}

.actor-name {
  display: block;
  transform: translate(3px, 3px);
}

.tags-move,
.tags-enter-active,
.tags-leave-active {
  transition: all 380ms ease-in-out;
}

.tags-enter-from,
.tags-leave-to {
  scale: 0;
}

.tags-leave-active {
  position: absolute;
}
</style>