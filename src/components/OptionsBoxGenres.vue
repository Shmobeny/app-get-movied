<script setup>
  import { ref, computed, inject } from 'vue';
  import useFetch from '../hooks/useFetch';

  const props = defineProps(['genresListIsFetched']);
  const emit = defineEmits(['setGenresListIsFetchedTo']);
  
  const { availableGenres, updateAvailableGenres } = inject('genres');

  const localization = inject('localization');
  const appLang = inject('appLang');

  const availableValues = inject('availableValues');
  const options = inject('options');
  const gamePreferences = inject('gamePreferences');

  const updateIncludedGenres = inject('updateIncludedGenres');

  // const genresListUpdated = ref(false);

  const lang = computed(() => options.value.language < availableValues.languages.length - 1 ? availableValues.languages[options.value.language].id : options.value.custom_language);
  const allTagCSS = computed(() => gamePreferences.value.include_genres.length === 0 ? 'options-box__item options-box__item--selected' : 'options-box__item');

  if (availableGenres.value.language !== lang.value || availableGenres.value.genres.lenght === 0) {
    const newGenresList = await useFetch(`https://api.themoviedb.org/3/genre/movie/list?language=${lang.value}`, 380).then(res => res.data);
    updateAvailableGenres(lang.value, newGenresList.genres);
    emit('setGenresListIsFetchedTo', true);
    // genresListUpdated.value = true;
  } else {
    emit('setGenresListIsFetchedTo', false);
  }

</script>

<template>
  <div
    :class="allTagCSS"
    @click="updateIncludedGenres()"
  >
    {{ localization.preferences.genres[appLang] }}
  </div>
  <div
    v-for="(genre, index) in availableGenres.genres"
    :class="[{ 'options-box__item--animate': props.genresListIsFetched }, gamePreferences.include_genres.indexOf(genre.id) !== -1 ? 'options-box__item options-box__item--selected' : 'options-box__item']"
    :style="{ animationDelay: index * 100 + 'ms' }"
    @click="updateIncludedGenres(genre.id)"
  >
    {{ genre.name }}
  </div>
</template>

<style scoped>

.options-box__item--animate {
  opacity: 0;
  animation-name: popup;
  animation-duration: 380ms;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
  transition: all 100ms ease-in-out;
}

@keyframes popup {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>