<script setup>
  import { computed, inject } from 'vue';

  const props = defineProps(['lang', 'status', 'movie', 'fetchResolved', 'watchlistIsUpdating']);

  const localization = inject('localization');
  const appLang = inject('appLang');
  const watchlist = inject('watchlist');
  
  const isInWatchList = computed(() => watchlist.value.IDs.indexOf(props.movie.target.id) === -1 ? false : true);
  const infoCSS = computed(() => props.status === 'win' ? 'info info--win' : 'info info--lose');
  const isPosterAvalible = computed(() => props.movie.target.poster_path ? true : false);
  const poster = computed(() => isPosterAvalible.value ? `https://image.tmdb.org/t/p/w500${props.movie.target.poster_path}` : '../assets/img/poster-placeholder-2.png');
  
  const changeGameStatusTo = inject('changeGameStatusTo');
  const editWatchList = inject('editWatchList');
</script>

<template>
  <div
    :class="infoCSS">
      <div
        class="info__icon"
        :style="{ backgroundColor: props.status === 'win' ? 'green' : 'red' }">
        <span class="info__icon-item">{{ props.status === 'win' ? `${localization.game_status.win[appLang]}` : `${localization.game_status.lose[appLang]}` }}</span></div>
      <div
        class="info__card"
        :style="{ backgroundImage: `url(${poster})` }">
        <h2 v-if="!isPosterAvalible" class="info__movie-title">{{ props.movie.target.title }}</h2>
      </div>
      <button
        :class="isInWatchList ? 'info__button info__button--favorite-done' : 'info__button info__button--favorite'"
        @click="editWatchList('add', props.movie.target )"
        :disabled="isInWatchList || props.watchlistIsUpdating"
      >
        <Transition name="scale" mode="out-in">
          <span v-if="props.watchlistIsUpdating" class="info__button-text">{{ localization.buttons.adding[appLang] }}...</span>
          <span v-else-if="isInWatchList" class="info__button-text">{{ localization.buttons.watchlisted[appLang] }}</span>
          <span v-else class="info__button-text">{{ localization.buttons.to_watchlist[appLang] }}</span>
        </Transition>
      </button>
      <button class="info__button info__button--continue" @click="changeGameStatusTo(0)" :disabled="!props.fetchResolved">
        <Transition name="scale" mode="out-in">
          <span v-if="props.fetchResolved" class="info__button-text">{{ localization.buttons.continue[appLang] }}</span>
          <span v-else class="info__button-text">{{ localization.buttons.loading[appLang] }}...</span>
        </Transition>
      </button>
  </div>
</template>

<style scoped>
  .info {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    max-height: 100%;
    padding: 40px;
    overflow: auto;
    z-index: 11;
  }

  .info::before, .info::after {
    content: '';
    margin: auto;
  }

  .info--win {
    /* background-color: rgba(0, 255, 255, 0.5); */
    background-color: rgba(255, 255, 255, 0.5);
  }

  .info--lose {
    background-color: rgba(165, 42, 42, 0.5);
  }

  .info__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 50px;
    max-height: 25px;
    padding: 5px 15px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 5px;
    background-color: red;
    box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1);
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 1);
    transform: translateY(50%);
  }

  .info__card {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    flex-shrink: 0;
    aspect-ratio: 375 / 562;
    min-width: 200px;
    max-width: 375px;
    max-height: 562px;
    margin-bottom: 10px;
    /* border: 4px solid white; */
    border-radius: 10px;
    background-color: black;
    background-position: 50%;
    background-repeat: no-repeat;
    background-size: cover;
    box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1);
  }

  .info__movie-title {
    margin: 0;
    padding: 10px 5px;
    width: 100%;
    color: white;
    font-size: 18px;
    text-align: center;
    background-color: black;
    border-top: 3px dashed #f9c00e;
    border-bottom: 3px dashed #f9c00e;
    box-shadow: 0px 0px 0px 5px black;
  }

  .info__button {
    width: 100%;
    max-width: 375px;
    margin: 0;
    margin-bottom: 10px;
    padding: 5px;
    color: black;
    font-size: 20px;
    font-weight: bold;
    text-transform: uppercase;
    border: 0px solid black;
    border-radius: 5px;
    background-color: white;
    box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1),
                inset 0px 0px 0px 0px rgba(0, 0, 0, 1);
    transition: all 380ms ease-in-out;
    cursor: pointer;
  }

  .info__button--continue {
    height: 55px;
    padding: 15px 5px;
  }

  .info__button--favorite,
  .info__button--favorite-done {
    color: white;
    background-color: rgb(255, 166, 0);
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 1);
  }

  .info__button:disabled {
    color: rgba(0, 0, 0, 0.5);
    background-color: lightgrey;
    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 1),
                inset 1px 1px 5px 0px rgba(0, 0, 0, 1);
    text-shadow: none;
    cursor: not-allowed;
  }

  .info__button--favorite-done:disabled {
    color: white;
    background-color: green;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 1);
    box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1),
                inset 0px 0px 0px 0px rgba(0, 0, 0, 1);
  }

  .info__button-text {
    display: block;
  }

  .scale-enter-active,
  .scale-leave-active {
    transition: all 190ms ease-in-out;
  }

  .scale-enter-from,
  .scale-leave-to {
    transform: scale(0);
  }

  .fav-btns-enter-active,
  .fav-btns-leave-active {
    transition: all 190ms ease-in-out;
  }

  .fav-btns-enter-from,
  .fav-btns-leave-to {
    opacity: 0;
    /* transform: translateX(10px); */
    transform: scale(1.2);
  }

  .fav-btns-enter-from {
    /* transform: translateX(-10px); */
    transform: scale(0.8);
  }

  .rotate {
    font-size: 25px;
    animation: rotate 500ms ease-in-out infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

</style>