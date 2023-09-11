<script setup>
  import { ref, computed, inject } from 'vue';
  import useFetch from '../hooks/useFetch';
  import OptionsBoxGenres from './OptionsBoxGenres.vue';
  import OptionsBoxActors from './OptionsBoxActors.vue';

  const props = defineProps(['type', 'title']);

  const localization = inject('localization');
  const appLang = inject('appLang');
  const updateIncludedActors = inject('updateIncludedActors');

  const inputActorNameElem = ref(null);
  const nowSearchingForActor = ref(false);
  const errorDuringSearchingActor = ref({ status: false, type: null });
  const formButtonIsDisabled = ref(true);
  const genresListIsFetched = ref(false);

  const inputActorCSS = computed(() => errorDuringSearchingActor.value.status ? 'options-box__input-actors options-box__input-actors--error' : 'options-box__input-actors');
  const inputActorPlaceholder = computed(() => errorDuringSearchingActor.value.status && errorDuringSearchingActor.value.type === 'query_error' ? localization.preferences.actors_query_error[appLang.value] :
                                               errorDuringSearchingActor.value.status && errorDuringSearchingActor.value.type === 'connection_error' ? localization.preferences.actors_connection_error[appLang.value] : '');

  async function addActor() {
    if (nowSearchingForActor.value) return;

    const searchQuery = inputActorNameElem.value.value;
    const searchQueryEncoded = encodeURI(searchQuery);

    // console.log(`Searching for actor ${searchQuery} in database...`);
    nowSearchingForActor.value = true;
    const actor = await useFetch(`https://api.themoviedb.org/3/search/person?query=${searchQueryEncoded}&include_adult=false&language=en-US&page=1`, 380);
    nowSearchingForActor.value = false;

    switch (true) {
      case actor.data !== null && actor.data.results.length > 0:
        // console.log(`Success! Actor ${actor.data.results[0].name} was found.`);
        updateIncludedActors({ name: actor.data.results[0].name, id: actor.data.results[0].id, picture: actor.data.results[0].profile_path });
        inputActorNameElem.value.value = '';
        detectInput();
        break;
      case actor.data !== null && actor.data.results.length === 0:
        // console.log(`Failure! Actor ${searchQuery} is not in database!`);
        setInputToErrorState('query_error');
        break;
      default:
        // console.log(`Error accured during searching for actor`);
        setInputToErrorState('connection_error');
    }
  }

  function detectInput() {
    formButtonIsDisabled.value = inputActorNameElem.value.value.length === 0 ? true : false;
  }

  function setInputToErrorState(errorType) {
    errorDuringSearchingActor.value.status = true;
    errorDuringSearchingActor.value.type = errorType;
    inputActorNameElem.value.value = '';
    detectInput();
    inputActorNameElem.value.blur();
  }

  function clearInputErrorState() {
    if (!errorDuringSearchingActor.value.status) return;
    errorDuringSearchingActor.value.status = false;
    errorDuringSearchingActor.value.type = null;
  };

  function setGenresListIsFetchedTo(newValue) {
    if (typeof newValue !== 'boolean') return;
    genresListIsFetched.value = newValue;
  }

</script>

<template>
  <div class="options-box">
    <h3 class="options-box__title">{{ props.title }}</h3>
    <form v-if="props.type === 'actors'" @submit.prevent="addActor">
      <div class="options-box__input-container">
        <input
          ref="inputActorNameElem"
          :class="inputActorCSS"
          :placeholder="inputActorPlaceholder"
          @input="detectInput"
          @focus="clearInputErrorState"
        >
        <button class="options-box__input-button" @submit.prevent="addActor" :disabled="nowSearchingForActor || formButtonIsDisabled">
          <span v-if="!nowSearchingForActor" class="material-symbols-outlined">add</span>
          <span v-else class="material-symbols-outlined spin">autorenew</span>
        </button>
      </div>
    </form>
    <div class="options-box__wrapper">
      <div class="options-box__main">
        
        <Transition :name="genresListIsFetched ? 'info' : 'info--immediately'" mode="out-in">
          <!-- <div> -->
          <Suspense v-if="props.type === 'genres'">
            <OptionsBoxGenres
              :genresListIsFetched="genresListIsFetched"
              @setGenresListIsFetchedTo="setGenresListIsFetchedTo" />
            
            <template #fallback>
              <p class="options-box__items-info">{{ localization.preferences.genres_info[appLang] }}...</p>
            </template>
          </Suspense>
          <!-- </div> -->
        </Transition>

        <OptionsBoxActors v-if="props.type === 'actors'" />
      </div>
    </div>
  </div>
</template>

<style>
.options-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 40px;
}

.options-box:last-of-type {
  margin-bottom: 0px;
}

.options-box__title {
  margin: 0;
  padding: 0;
  margin-bottom: 5px;
  text-align: center;
}

.options-box__input-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  flex-shrink: 0;
  height: 50px;
  margin-bottom: 10px;
}

.options-box__input-actors,
.options-box__input-button {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: white;
  border: 1px solid lightgrey;
  border-radius: 15px;
}

.options-box__input-actors {
  width: 100%;
  flex: 1 0 100%;
  padding: 0 10px;
  font-size: 16px;
  text-transform: uppercase;
  box-shadow: inset 0px 0px 5px 0px black;
  transition: all 380ms ease-in-out;
}

.options-box__input-actors--error {
  text-transform: none;
  background-color: red;
  font-weight: bold;
  border: 1px solid brown;
  animation-name: shake;
  animation-duration: 380ms;
  animation-timing-function: ease-in-out;
}

.options-box__input-actors::placeholder {
  color: white;
  text-shadow: 1px 1px 1px black;
}

.options-box__input-button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  color: black;
  border: 0;
  border-radius: 50%;
  background-color: orange;
  box-shadow: 1px 1px 3px 0px rgba(0, 0, 0, 1);
  transform: translateX(-45px);
  transition: all 190ms ease-in-out;
  cursor: pointer;
}

.options-box__input-button:disabled {
  color: rgba(0, 0, 0, 0.5);
  background-color: white;
  cursor: not-allowed;
}

.options-box__wrapper {
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
}

.options-box__main {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  width: 100%;
  height: 190px;
  padding-top: 10px;
  padding-left: 10px;
  border-radius: 15px;
  box-shadow: inset 0px 0px 5px 0px black;
  overflow-y: auto;
  overflow-x: hidden;
}

.options-box__items-info {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  color: rgba(0, 0, 0, 0.7);
  text-align: center;
  transform: translate(-50%, -50%);
}

.options-box__item {
  min-height: 30px;
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 5px 10px;
  text-align: center;
  text-transform: uppercase;
  line-height: 25px;
  vertical-align: middle;
  border-radius: 5px;
  background-color: white;
  box-shadow: 1px 1px 3px 0px rgba(0, 0, 0, 1);
  transition: all 170ms ease-in-out;
  transform-origin: 50% 50%;
  cursor: pointer;
}

.options-box__item--selected {
  background-color: orange;
  transform: scale(1.05);
}

.spin {
  color: black !important;
  animation-name: spin;
  animation-duration: 380ms;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.info-enter-active,
.info-leave-active {
  transition: opacity 380ms ease-in-out;
}

.info--immediately-enter-active,
.info--immediately-leave-active {
  transition: opacity 0ms ease-in-out;
}

.info-enter-from,
.info-leave-to {
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

@keyframes shake {
  0% {
    transform: translateX(0px);
  }

  10% {
    transform: translateX(10px);
  }

  20% {
    transform: translateX(0px);
  }

  30% {
    transform: translateX(-10px);
  }

  40% {
    transform: translateX(0px);
  }

  50% {
    transform: translateX(10px);
  }

  60% {
    transform: translateX(0px);
  }

  70% {
    transform: translateX(-10px);
  }

  80% {
    transform: translateX(0px);
  }

  90% {
    transform: translateX(10px);
  }

  100% {
    transform: translateX(0px);
  }
}
</style>