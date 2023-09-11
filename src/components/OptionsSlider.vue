<script setup>
  import { ref, watch, inject, computed } from 'vue';

  const props = defineProps(['type', 'title', 'data']);
  const emit = defineEmits(['change']);

  const localization = inject('localization');
  const appLang = inject('appLang');

  const options = inject('options');
  const updateCustomLanguage = inject('updateCustomLanguage');
  const updateReleaseYear = inject('updateReleaseYear');
  const useLocalWatchList = inject('useLocalWatchList');

  const inputElem = ref(null);
  const switchFix = ref(true);
  const directionDetector = ref(null);

  const placeholderContent = computed(() => props.type === 'year' ? props.data.title : 
                                            options.value.custom_language !== null ? `Custom: ${options.value.custom_language}` : 'Custom');

  watch(inputElem, () => {
    if (props.data.id === 'custom') inputElem.value.focus();
  });

  function handleInputBlur(e) {
    if (e.target.value.length === 0) return;
    
    switch (props.type) {
      case 'year':
        updateReleaseYear(e.target.value * 1);
        break;
      case 'language':
        updateCustomLanguage(e.target.value);
        break;
    }
  }

  function handleClick(direction) {
    switchFix.value = !switchFix.value;
    directionDetector.value = direction ? direction : 'forwards';

    switch (props.type) {
      case 'year':
        emit('change', direction);
        break;
      default:
        if (props.type === 'language') useLocalWatchList(false);
        emit('change', props.type, direction);
    }
  }
</script>

<template>
  <div class="options-slider">
    <Transition name="reset">
      <button
        v-if="props.type === 'year' && props.data.id !== 0"
        class="options-slider__reset"
        @click="handleClick(null)"
      >
        {{ localization.buttons.reset[appLang] }}
      </button>
    </Transition>

    <h3 class="options-slider__title">{{ props.title }}</h3>
    
    <div class="options-slider__main">
      <button @click="handleClick('backwards')" class="options-slider__button"><span class="material-symbols-outlined">arrow_back_ios</span></button>
      <div class="options-slider__value">
        <Transition :name="directionDetector" mode="out-in">
          
          <div v-if="switchFix">
            <input
              v-if="props.data.id === 'custom' || props.type === 'year'"
              ref="inputElem"
              :type="props.type === 'year' ? 'number' : 'text'"
              :placeholder="placeholderContent"
              class="options-slider__input"
              @blur="handleInputBlur">
            <span v-else>{{ props.data.title }}</span>
          </div>
          
          <div v-else>
            <input
              v-if="props.data.id === 'custom' || props.type === 'year'"
              ref="inputElem"
              :type="props.type === 'year' ? 'number' : 'text'"
              :placeholder="placeholderContent"
              class="options-slider__input"
              @blur="handleInputBlur">
            <span v-else>{{ props.data.title }}</span>
          </div>
        </Transition>
      </div>
      <button @click="handleClick('forwards')" class="options-slider__button"><span class="material-symbols-outlined">arrow_forward_ios</span></button>
    </div>    
  </div>
</template>

<style scoped>
.options-slider {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin-bottom: 40px;
}

.options-slider:last-of-type {
  margin-bottom: 0;
}

.options-slider__title {
  margin: 0;
  padding: 0;
  margin-bottom: 5px;
  text-align: center;
}

.options-slider__title::first-letter {
  text-transform: uppercase;
}

.options-slider__main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.options-slider__button {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  color: black;
  border: 0;
  border-radius: 50%;
  background-color: white;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1);
  transform: translateX(-50%);
  cursor: pointer;
}

.options-slider__button:first-of-type {
  transform: translateX(50%);
}

.options-slider__button:first-of-type > span {
  transform: translateX(5px);
}

.options-slider__value {
  width: 100%;
  height: 36px;
  margin: 0 auto;
  /* padding: 0 20px; */
  color: white;
  text-align: center;
  vertical-align: middle;
  line-height: 34px;
  border-top: 2px dashed white;
  border-bottom: 2px dashed white;
  background-color: black;
  box-shadow: 0px 2px 2px 0px black,
              0px -2px 2px 0px black;
  overflow: hidden;
}

.options-slider__input {
  width: 100%;
  padding: 0;
  margin: 0;
  color: white;
  font-size: 16px;
  text-align: center;
  border: 0;
  background-color: transparent;
}

.options-slider__input::placeholder {
  color: white;
  transition: all 100ms ease-in-out;
}

.options-slider__input:focus {
  outline: 0;
}

.options-slider__input:focus::placeholder {
  color: rgba(255, 255, 255, 0.5);
  transform: scale(0.8);
}

.options-slider__reset {
  position: absolute;
  top: 100%;
  left: 50%;
  display: block;
  margin: 0 auto;
  color: black;
  font-size: 16px;
  border: 0;
  border-radius: 0 0 5px 5px;
  background-color: white;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1);
  transform: translateX(-50%);
  transform-origin: 50% 0%;
  cursor: pointer;
}

.forwards-enter-active,
.forwards-leave-active,
.backwards-enter-active,
.backwards-leave-active,
.reset-enter-active,
.reset-leave-active {
  transition: all 190ms ease-in-out;
}

.forwards-enter-from,
.backwards-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.backwards-enter-from,
.forwards-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.reset-enter-from,
.reset-leave-to {
  transform: translateX(-50%) scaleY(0);
}
</style>