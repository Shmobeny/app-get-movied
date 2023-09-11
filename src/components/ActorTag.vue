<script setup>
  import { ref, onMounted } from 'vue';

  const props = defineProps(['actor']);

  const pictureIsAvailable = ref(props.actor.picture ? true : false);
  const pictureIsReady = ref(false);
  const phantomPicture = ref(null);

  onMounted(() => {
    if (pictureIsAvailable.value) phantomPicture.value.onload = () => pictureIsReady.value = true;
  });
  
</script>

<template>
  <img
    v-if="pictureIsAvailable"
    ref="phantomPicture"
    :src="'https://image.tmdb.org/t/p/w500/' + props.actor.picture"
    alt=""
    class="actor__phantom-picture"
  >
  <div class="actor-picture" :style="{ backgroundImage: pictureIsAvailable ? `url(https://image.tmdb.org/t/p/w500/${props.actor.picture})` : 'unset' }">
    <span v-if="!pictureIsAvailable" class="material-symbols-outlined">face</span>
    <Transition name="loader"> 
      <div v-if="!pictureIsReady && pictureIsAvailable" class="actor__loader">
        <span class="material-symbols-outlined spin">cycle</span>
      </div>
    </Transition>
  </div>
  <span class="actor-name">{{ props.actor.name }}</span>
  <span class="material-symbols-outlined actor-remove">close</span>
</template>

<style scoped>
.actor__phantom-picture {
  position: absolute;
  display: block;
  opacity: 0;
}

.actor-picture {
  position: relative;
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
  background-position-y: -5px;
}

.actor__loader {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: inset 1px 1px 1px 1px rgba(0, 0, 0, 0.4);
  background-color: #f9c00e;
}

.actor__loader > span {
  height: 20px;
  transform: translateY(2px);
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

.spin {
  animation-name: spin;
  animation-duration: 1000ms;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.loader-enter-active,
.loader-leave-active {
  transition: all 380ms ease-in-out;
}

.loader-enter-from,
.loader-leave-to {
  transform: scale(2);
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  } 

  to {
    transform: rotate(360deg);
  } 
}
</style>