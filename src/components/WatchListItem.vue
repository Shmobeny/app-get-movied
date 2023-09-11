<script setup>
  import { computed, inject, onMounted, ref } from 'vue';
  import useFetch from '../hooks/useFetch';
  import useFullMovieInfo from '../hooks/useFullMovieInfo';

  const props = defineProps(['index', 'item', 'lang', 'isLast', 'isSelected']);
  const emit = defineEmits(['selectItem', 'removeItem']);

  const { availableGenres, updateAvailableGenres } = inject('genres');

  const localization = inject('localization');
  const appLang = inject('appLang');

  const watchlist = inject('watchlist');
  const syncWatchlistItem = inject('syncWatchlistItem');
  const useLocalWatchList = inject('useLocalWatchList');

  const showInfo = ref(false);
  const phantomPoster = ref(null);
  const posterLoaded = ref(false);

  const movieInfo = await getMovieInfo();
  const genres = await getGenres();

  const isPosterAvalible = computed(() => movieInfo.poster_path ? true : false);
  const isBackdropAvalible = computed(() => movieInfo.backdrop_path ? true : false);
  const poster = computed(() => isPosterAvalible.value ? `https://image.tmdb.org/t/p/w500${movieInfo.poster_path}` : '../assets/img/poster-placeholder-2.png');
  const backdrop = computed(() => isBackdropAvalible.value ? `https://image.tmdb.org/t/p/w500${movieInfo.backdrop_path}` : '../assets/img/backdrop-placeholder.png');
  const cardPosterCSS = computed(() => props.isSelected ? 'card__poster blurred-mask' : 'card__poster');

  async function getMovieInfo() {
    switch (watchlist.value.use_local) {
      case true:
        return props.item;
      default:
        // await new Promise((res) => setTimeout(res, 10000));
        let result = await useFullMovieInfo(props.item, props.lang)
        syncWatchlistItem(result);
        if (props.isLast) useLocalWatchList(true);
        return result;
    } 
  }

  async function getGenres() {
    let genres = '';

    if (availableGenres.value.language !== props.lang || availableGenres.value.genres.lenght === 0) {
      const newGenresList = await useFetch(`https://api.themoviedb.org/3/genre/movie/list?language=${props.lang}`, 380).then(res => res.data);
      updateAvailableGenres(props.lang, newGenresList.genres);
    }

    props.item.genre_ids.forEach( (item) => availableGenres.value.genres.forEach( (genre) => genre.id === item ? genres.length === 0 ? genres += genre.name : genres += ", " + genre.name : false)  );
    
    return genres;
  }

  onMounted(() => {
    phantomPoster.value.onload = () => posterLoaded.value = true;
  });
  
</script>

<template>
  <div class="card">
    <div class="card__body">
      <img ref="phantomPoster" class="card__phantom-img" :src="poster">
      
      <div
        :class="cardPosterCSS"
        :style="{ backgroundImage: `url(${poster})` }"
        @click="emit('selectItem', props.index)"
      >
        <h2
          v-if="!isPosterAvalible && posterLoaded"
          class="card__title"
        >
          {{ movieInfo.title }}
        </h2>

        <Transition name="movie-info">
          <div v-if="!posterLoaded" class="card__loader">
            <span class="material-symbols-outlined">cycle</span>
          </div>
        </Transition>
      </div>
      
      <Transition name="context">
        <div v-if="props.isSelected"
          class="card__mask"
          @click.passive.self="emit('selectItem', null)"
        >
          <button class="card__button card__button--remove" @click.passive.self="emit('removeItem', props.index, props.item)">{{ localization.buttons.remove[appLang] }}</button>
          <h2 class="card__title" @click.passive.self="emit('selectItem', null)">{{ movieInfo.title }}</h2>
          <button class="card__button card__button--info" @click="showInfo = true">{{ localization.buttons.info[appLang] }}</button>
        </div>
      </Transition>
    </div>
    
    <Teleport to="#watchlist">
      <Transition name="movie-info">
        <div v-if="showInfo" class="movie-info" @click="showInfo = false">
          <div class="movie-info__background">
            <div class="movie-info__background-filler"></div>
            <img
              class="movie-info__background-content"
              :src="backdrop">
          </div>

          <h2 class="movie-info__title">{{ movieInfo.title }} ({{ movieInfo.release_date.slice(0, 4) }})</h2>
          
          <p class="movie-info__genres">{{ genres }}</p>
          
          <div class="movie-info__overview">
            <div class="movie-info__overview-shadow movie-info__overview-shadow--top"></div>
            <p class="movie-info__overview-text">{{ movieInfo.overview ? movieInfo.overview : localization.watchlist.description_error[appLang] }}</p>
            <div class="movie-info__overview-shadow movie-info__overview-shadow--bottom"></div>
          </div>

          <img class="movie-info__phantom-img" :src="backdrop">
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.card {
  flex: 1 0 40%;
  max-width: 210px;
}

.card__body {
  position: relative;
  min-width: 150px;
  max-width: 210px;
  max-height: 284px;
  margin: 10px;
  border: 0px solid black;
  border-radius: 10px;
  box-shadow: 1px 1px 5px 0px black;
  transition: all 380ms ease-in-out;
  overflow: hidden;
}

.card__poster {
  display: flex;
  align-items: center;
  aspect-ratio: 375 / 562;
  background-color: #f9c00e;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50%;
  filter: blur(0px);
  transition: filter 180ms ease-in-out;
}

.card__title {
  width: 100%;
  padding: 10px 5px;
  color: white;
  font-size: 18px;
  text-align: center;
  background-color: black;
  border-top: 3px dashed white;
  border-bottom: 3px dashed white;
  box-shadow: 0px 0px 0px 5px black;
  transform: translateY(-15px);
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
  font-size: 50px;
  color: aliceblue;
  border: 1px solid black;
  border-radius: 10px;
}

.card__button {
  width: 100%;
  max-width: 140px;
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

.card__button--remove {
  background-color: red;
  border-top: 0;
  border-radius: 0 0 15px 15px;
  transform: translateY(-1px);
  box-shadow: inset 0px 10px 10px 0px rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 1);
}

.card__button--info {
  background-color: orange;
  border-bottom: 0;
  border-radius: 15px 15px 0 0;
  transform: translateY(1px);
  box-shadow: inset 0px -10px 10px 0px rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 1);
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

.movie-info {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px;
  color: white;
  background-color: rgba(0, 0, 0, 1);
}

.movie-info__background {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  z-index: 1;
}

.movie-info__background-filler {
  flex-grow: 1;
  box-shadow: 50px 30px 50px 0px black,
              -50px 30px 50px 0px black;
  z-index: 2;
}

.movie-info__background-content {
  flex-shrink: 0;
  width: 100%;
  z-index: 1;
}

.movie-info__title {
  position: relative;
  margin: 20px 0 5px 0;
  z-index: 2;
}

.movie-info__genres {
  margin: 0;
  color: #f9c00e;
  font-weight: bold;
  font-style: italic;
  opacity: 0.8;
}

.movie-info__overview {
  position: relative;
  text-shadow: 1px 1px 1px black;
  overflow: auto;
  z-index: 2;
}

.movie-info__overview-text {
  max-height: 100%;
  margin: 0;
  padding: 20px 0;
  overflow: auto;
}

.movie-info__overview-shadow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 20px;
  background: rgb(0,0,0);
  background: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  overflow: hidden;
}

.movie-info__overview-shadow--bottom {
  top: 100%;
  background: rgb(0,0,0);
  background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  transform: translateY(-100%);
}

.movie-info__phantom-img {
  display: block;
  flex-shrink: 0;
  margin-top: auto;
  opacity: 0;
}

.blurred-mask {
  filter: blur(5px);
}

.movie-info-enter-active,
.movie-info-leave-active {
  transition: all 180ms ease-in-out;
}

.movie-info-enter-from,
.movie-info-leave-to {
  transform: scale(1.5);
  opacity: 0;
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
</style>