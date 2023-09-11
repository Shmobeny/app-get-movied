<script setup>
  import { computed, ref, inject, onMounted } from 'vue';

  const props = defineProps(['index', 'item', 'target', 'showCard', 'isSelected']);
  const emit = defineEmits(['selectMovieCard']);

  const localization = inject('localization');
  const appLang = inject('appLang');
  const user = inject('user');
  const watchlist = inject('watchlist');

  const hideTextAndCards = inject('hideTextAndCards');
  const changeGameStatusTo = inject('changeGameStatusTo');
  const updateChosenMovie = inject('updateChosenMovie');
  const updateTargetMovie = inject('updateTargetMovie');
  const editWatchList = inject('editWatchList');
  const openMenuOnTab = inject('openMenuOnTab');

  const cardElem = ref(null);
  const cardMainContentElem = ref(null);
  const cardContextIsActive = ref(false);
  const phantomPoster = ref(null);
  const posterLoaded = ref(false);
  const watchlistIsUpdating = ref(false);
  
  const isInWatchList = computed(() => watchlist.value.IDs.indexOf(props.item.id) === -1 ? false : true);
  const isPosterAvalible = computed(() => props.item.poster_path ? true : false);
  const poster = computed(() => isPosterAvalible.value ? `https://image.tmdb.org/t/p/w500${props.item.poster_path}` : '../assets/img/poster-placeholder-2.png');
  const cardCSS = computed(() => props.showCard ? 'card card--active' : 'card');
  const cardMainContentCSS = computed(() => props.isSelected ? 'card__main-content blurred-mask' : 'card__main-content');

  const onClickValues = {
    clicksCount: 0,
    action: null,
    timeToReact: 165,
  }

  onMounted(() => {
    phantomPoster.value.onload = () => posterLoaded.value = true;
  });

  function onClick(e) {
    clearTimeout(onClickValues.action);
    
    onClickValues.clicksCount++;
    
    onClickValues.action = setTimeout(() => {
      if (onClickValues.clicksCount === 1) {
        callContextMenu();
        onClickValues.clicksCount = 0;
      } else {
        alert("ZoomIn function not added right now");
        onClickValues.clicksCount = 0;
      }
    }, onClickValues.timeToReact);
  }

  function callContextMenu() {
    cardContextIsActive.value = true;
  }

  function closeContextMenu() {
    cardContextIsActive.value = false;
  }

  function makeDecision() {
    if (props.item.id === props.target.id) {
      changeGameStatusTo(1);
    } else {
      changeGameStatusTo(2);
    };

    updateChosenMovie(props.item);
    updateTargetMovie(props.target);
    closeContextMenu();
    hideTextAndCards(true);
  }

  async function addToWatchList() {
    if (!user.value) {
      openMenuOnTab('watchlist');
      return;
    };

    watchlistIsUpdating.value = true;
    await editWatchList('add', props.item);
    watchlistIsUpdating.value = false;
  }

</script>

<template>
  <div
    ref="cardElem"
    :class="cardCSS"
    :style="{ transitionDelay: 100 * props.index + 'ms' }">

    <img ref="phantomPoster" class="card__phantom-img" :src="poster">
    
    <div
      ref="cardMainContentElem"
      :class="cardMainContentCSS"
      :style="{ backgroundImage: `url(${poster})` }"
      @click.passive="emit('selectMovieCard', props.index)"
    >
      <h2 v-if="!isPosterAvalible && posterLoaded" class="card__title">{{ props.item.title }}</h2>
      
      <Transition name="context">
        <div v-if="!posterLoaded" class="card__loader">
          <span class="material-symbols-outlined">cycle</span>
        </div>
      </Transition>
    </div>

    <Transition name="context">
      <div v-if="props.isSelected" class="card__mask">
        <Transition name="fav-btns" mode="out-in">
          <button v-if="watchlistIsUpdating" class="card__button card__button--favorite card__button--favorite-adding">{{ localization.buttons.adding[appLang] }}...</button>
          <button v-else-if="isInWatchList" class="card__button card__button--favorite card__button--favorite-done">{{ localization.buttons.watchlisted[appLang] }}</button>
          <button v-else class="card__button card__button--favorite" @click.passive.self="addToWatchList">{{ localization.buttons.to_watchlist[appLang] }}</button>
        </Transition>
        <button class="card__button card__button--choose" @click.passive.self="makeDecision">{{ localization.buttons.chose[appLang] }}</button>
        <button class="card__button card__button--cancel" @click.passive.self="emit('selectMovieCard', null)">{{ localization.buttons.cancel[appLang] }}</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  top: -120%;
  left: 0;
  flex-shrink: 0;
  aspect-ratio: 375 / 562;
  height: 100%;
  margin: 0 10px;
  border: 0px solid black;
  border-radius: 10px;
  box-shadow: 1px 1px 5px 0px black;
  transition: all 380ms ease-in-out;
  overflow: hidden;
}

.card--active {
  top: 0%;
}

.card__main-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  background-color: #f9c00e;
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(0px);
  transition: filter 180ms ease-in-out;
}

.card:first-of-type {
  margin-left: 0;
}

.card:last-of-type {
  margin-right: 0;
}

.card__phantom-img {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.card__loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9c00e;
}

.card__loader > span {
  font-size: 60px;
  height: 50px;
  animation-name: spin;
  animation-duration: 1000ms;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.card__title {
  margin: 0;
  padding: 10px 5px;
  color: white;
  font-size: 18px;
  text-align: center;
  background-color: black;
  border-top: 3px dashed #f9c00e;
  border-bottom: 3px dashed #f9c00e;
  box-shadow: 0px 0px 0px 5px black;
}

.card__mask {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  font-size: 50px;
  color: aliceblue;
  border: 1px solid black;
  border-radius: 10px;
}

.card__button {
  width: 100%;
  max-width: 200px;
  margin: 0;
  padding: 5px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  border: 1px solid black;
  background-color: black;
  cursor: pointer;
}

.card__button--choose {
  width: 120%;
  max-width: none;
  margin: 5px;
  padding: 15px 5px;
  color: black;
  background-color: white;
  border-radius: 5px;
  box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.3);
}

.card__button--favorite {
  background-color: orange;
  border-top: 0;
  border-radius: 0 0 15px 15px;
  transform: translateY(-1px);
  box-shadow: inset 0px 10px 10px 0px rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 1);
}

.card__button--favorite-adding {
  background-color: aliceblue;
  color: black;
  text-shadow: none;
  cursor: auto;
}

.card__button--favorite-done {
  background-color: green;
  cursor: auto;
}

.card__button--cancel {
  background-color: red;
  border-bottom: 0;
  border-radius: 15px 15px 0 0;
  transform: translateY(1px);
  box-shadow: inset 0px -10px 10px 0px rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 1);
}

.blurred-mask {
  filter: blur(5px);
}

.fav-btns-enter-active,
.fav-btns-leave-active {
  transition: transform 180ms ease-in-out;
}

.fav-btns-enter-from,
.fav-btns-leave-to {
  transform: translateY(-100%);
}

.context-enter-active,
.context-leave-active {
  transition: all 180ms ease-in-out;
}

.context-enter-from,
.context-leave-to {
  transform: scale(1.5);
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

@media screen and (max-height: 610px) {
  .card__title {
    font-size: 16px;
  }
  .card__mask {
    padding: 0 2px;
  }
  .card__button {
    font-size: 16px;
    padding: 3px;
  }

  .card__button--choose {
    padding: 10px 5px;
  }
}
</style>