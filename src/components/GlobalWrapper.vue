<script setup>
  import { ref, computed, watchEffect, onMounted, provide, inject } from 'vue';

  import useRandom from '../hooks/useRandom';
  import useFetch from '../hooks/useFetch';
  import useFullMovieInfo from '../hooks/useFullMovieInfo';
  import DescriptionBlock from './DescriptionBlock.vue';
  import PostersBlock from './PostersBlock.vue';

  const props = defineProps(['URLSettings', 'pageLimit', 'cardsOnDesk', 'status', 'menuIsActive', 'settingsTriggered']);
  const emit = defineEmits(['setNewPageLimitTo', 'newAPIRequest']);

  const openMenuOnTab = inject('openMenuOnTab');

  const showMovieText = ref(false);
  const showMovieCards = ref(false);
  const errorMsgTrigger = ref(false);
  const showErrorMsg = ref(false);
  const showErrorMsgBody = ref(false);

  const parsedActors = computed(() => props.URLSettings.include_actors.length > 0 ? props.URLSettings.include_actors.join('%7C') : '');
  const parsedGenres = computed(() => props.URLSettings.include_genres.length > 0 ? props.URLSettings.include_genres.join('%7C') : '');

  const { data, error } =
    await useFetch(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=${props.URLSettings.language}&page=${props.URLSettings.page}&primary_release_year=${props.URLSettings.release_year}&sort_by=popularity.desc&with_cast=${parsedActors.value}&with_genres=${parsedGenres.value}&without_keywords=155477`
      , 0
    );

  const pickedMovies = pickMovies();
  const targetMovieRaw = computed(() => Array.isArray(pickedMovies) ? pickedMovies[useRandom(0, pickedMovies.length - 1)] : null);
  const targetMovie = await useFullMovieInfo(targetMovieRaw.value, props.URLSettings.language, true);

  provide('hideTextAndCards', hideTextAndCards);

  // handle errors
  watchEffect(() => {
    if (error && error.type === 'OutOFRangeError') emit('setNewPageLimitTo', data.total_pages);
    if (error && error.type === 'LackOfResults') {
      errorMsgTrigger.value = true;
      setTimeout(() => showErrorMsgBody.value = true, 380);
    };
  });

  watchEffect(() => {
    if (props.settingsTriggered && !props.menuIsActive) hideTextAndCards(true);
  });

  watchEffect(() => {
    if (props.pageLimit < data.total_pages) emit('setNewPageLimitTo', data.total_pages > 500 ? 500 : data.total_pages);
  });

  onMounted(() => {
    setTimeout(showTextAndCards, 0);
    if (errorMsgTrigger.value) setTimeout(() => showErrorMsg.value = true, 0);
  });

  function pickMovies() {
    if (error) return;
    
    let result = [];
    let usedIndexes = [];
    let moviesLimit = props.cardsOnDesk <= data.results.length ? props.cardsOnDesk : data.results.length;

    for (let i = 0; i < moviesLimit; i++) {
      let index;

      do {
        index = useRandom(0, data.results.length - 1);
      } while (usedIndexes.indexOf(index) > -1)

      result.push(data.results[index]);

      usedIndexes.push(index);
    }

    return result;
  };

  function showTextAndCards() {
    // console.log("Showing movie description (text) and cards...");
    showMovieText.value = true;
    showMovieCards.value = true;
  }

  function hideTextAndCards(andMakeNewAPIRequest = false) {
    // console.log(andMakeNewAPIRequest ? "Hiding movie description (text) and cards, making new API request after." : "Hiding movie description (text) and cards...");
    showMovieText.value = false;
    showMovieCards.value = false;

    if (andMakeNewAPIRequest)
      switch (Array.isArray(pickedMovies)) {
        case true:
          setTimeout(() => emit('newAPIRequest'), 100 * pickedMovies.length + 380);
          break;
        case false:
          setTimeout(() => showErrorMsgBody.value = false, 380);

          setTimeout(() => {
            errorMsgTrigger.value = false;
            showErrorMsg.value = false;
          }, 760);
          
          setTimeout(() => emit('newAPIRequest'), 1140);

          break;
      }
  }
</script>

<template>
  <div
    class="wrapper"
    :style="{ filter: props.status !== 'pending' || props.menuIsActive || showErrorMsg ? 'blur(5px)' : 'none' }"
  >
    
    <DescriptionBlock
      :item="error ? false : targetMovie"
      :showText="error ? false : showMovieText"
    />
    
    <div
      class="separator">
    </div>
    
    <PostersBlock 
      :items="error ? false : pickedMovies"
      :target="error ? false : targetMovie"
      :showCards="error ? false : showMovieCards"
    />

  </div>

  <Transition name="error">
    <div
      v-if="showErrorMsg"
      class="error"
      :style="{ filter: props.status !== 'pending' || props.menuIsActive ? 'blur(5px)' : 'none' }"
    >
      <div :class="showErrorMsgBody ? 'error__body error__body--active' : 'error__body'">
        <div class="error__icon"><span class="material-symbols-outlined">warning</span></div>
        <p class="error__text">Unfortunately, we can't find even a single one movie to show you :(<br>Try to change search parameters in Preferences settings.</p>
        <button class="error__btn" @click="openMenuOnTab('preferences')">Open Settings</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  transition: filter 180ms ease-in-out;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 50%;
  height: auto;
}

.separator {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 10px;
  background-color: white;
  /* overflow: hidden; */
}

.error {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 25px;
  background-color: rgba(0, 0, 0, 0.5);
  transition: filter 180ms ease-in-out;
}

.error::before {
  content: '';
  margin-top: auto;
}

.error::after {
  content: '';
  margin-bottom: auto;
}

.error__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  padding: 5px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 1px 1px 5px 0px black;
  transform: scale(0);
  transition: all 380ms cubic-bezier(1,-0.52,.83,1);
}

.error__body--active {
  transform: scale(1);
  transition: all 380ms cubic-bezier(.13,0,0,1.52);
  transition-delay: 380ms;
}

.error__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: #f9c00e;
  border-radius: 50%;
  box-shadow: 1px 1px 5px 0px black;
  transform: translateY(-50%);
  overflow: hidden;
}

.error__icon > span {
  font-size: 40px;
  transform: translateY(-3px);
}

.error__text {
  text-align: center;
  margin: 0;
}

.error__btn {
  padding: 10px 10px 5px 10px;
  color: black;
  font-size: 20px;
  font-weight: bold;
  text-transform: uppercase;
  background-color: white;
  border: 0;
  border-radius: 5px;
  box-shadow: 1px 1px 5px 0px black;
  transform: translateY(50%);
  cursor: pointer;
}

@keyframes error-body {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
  
}

.error-enter-active,
.error-leave-active {
  transition: all 380ms ease-in-out;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
}

</style>