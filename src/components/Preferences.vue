<script setup>
  import { inject, computed } from 'vue';
  import OptionsSlider from './OptionsSlider.vue';
  import OptionsBox from './OptionsBox.vue';

  const localization = inject('localization');
  const appLang = inject('appLang');
  const gamePreferences = inject('gamePreferences');
  const updateReleaseYear = inject('updateReleaseYear');

  const yearData = computed(() => gamePreferences.value.release_year ? { title: gamePreferences.value.release_year, id: gamePreferences.value.release_year } : { title: localization.preferences.year[appLang.value], id: 0 });

  function changeYear(direction) {
    if (yearData.value.id === 0) {
      updateReleaseYear(2023);
      return;
    }

    const newValue = direction === 'forwards' ? yearData.value.id + 1 : 
                     direction === 'backwards' ? yearData.value.id - 1 : null;
    
    updateReleaseYear(newValue);
  }
</script>

<template>
  <OptionsSlider
    :type="'year'"
    :title="localization.titles.preferences_year[appLang]"
    :data="yearData"
    @change="changeYear"
  />

  <OptionsBox
    :type="'genres'"
    :title="localization.titles.preferences_genres[appLang]"
  />

  <OptionsBox
    :type="'actors'"
    :title="localization.titles.preferences_actors[appLang]"
  />
</template>

<style scoped>
.options-select-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 200px;
  margin-bottom: 40px;
}

.options-select-box__title {
  margin: 0;
  padding: 0;
  margin-bottom: 5px;
  text-align: center;
}

.options-select-box__main {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding-top: 10px;
  padding-left: 10px;
  border-radius: 15px;
  box-shadow: inset 0px 0px 5px 0px black;
  overflow: auto;
}

.options-select-box__item {
  height: 30px;
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 5px;
  text-transform: uppercase;
  line-height: 25px;
  vertical-align: middle;
  border-radius: 5px;
  background-color: white;
  box-shadow: 1px 1px 3px 0px rgba(0, 0, 0, 1);
  cursor: pointer;
}

.options-select-box__item--selected {
  padding: 5px 10px;
  font-weight: bold;
  background-color: orange;
}
</style>