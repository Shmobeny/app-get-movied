<script setup>
  import { ref, inject } from 'vue';
  import OptionsSlider from './OptionsSlider.vue';

  // values
  const localization = inject('localization');
  const appLang = inject('appLang');
  const availableValues = inject('availableValues');
  const options = inject('options');

  // functions
  const updateLanguage = inject('updateLanguage');
  const updateCardsOnDesk = inject('updateCardsOnDesk');

  const optionsCollection = {
    // this adaptation allows to use single function for multiple actions
    // [0] - name in 'options'
    // [1] - name in 'availableValues'
    // [2] - function to change global value
    language: ['language', 'languages', updateLanguage],
    cards: ['cards_on_desk', 'cards', updateCardsOnDesk]
  };

  function change(type, direction) {
    
    let newIndex;

    switch (true) {
      case direction === 'forwards':
        newIndex = options.value[optionsCollection[type][0]] + 1;
        if (newIndex === availableValues[optionsCollection[type][1]].length) {
          optionsCollection[type][2](0);
        } else {
          optionsCollection[type][2](newIndex);
        }
        break;

      case direction === 'backwards':
        newIndex = options.value[optionsCollection[type][0]] - 1;
        if (newIndex === -1) {
          optionsCollection[type][2](availableValues[optionsCollection[type][1]].length - 1);
        } else {
          optionsCollection[type][2](newIndex);
        }
        break;
    }
  }
</script>

<template>

  <OptionsSlider
    :type="'language'"
    :title="localization.titles.settings_lang[appLang]"
    :data="availableValues.languages[options.language]"
    @change="change"
  />

  <OptionsSlider
    :type="'cards'"
    :title="localization.titles.settings_cards[appLang]"
    :data="availableValues.cards[options.cards_on_desk]"
    @change="change"
  />

</template>

<style scoped>
</style>