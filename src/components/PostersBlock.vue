<script setup>
  import { ref } from 'vue';
  import MovieCard from './MovieCard.vue';

  const props = defineProps(['items', 'target', 'showCards', 'watchlistIsUpdating']);

  const selectedMovieCard = ref(null);

  let lockScroll = false;

  function onPointerDown(e) {
    if (e.pointerType !== 'mouse') return;

    const target = e.target.closest('.posters');
    let originalX = e.x;

    target.style.scrollBehavior = 'auto';

    target.addEventListener('pointermove', slide);
    target.addEventListener('pointerup', () => {
      target.removeEventListener('pointermove', slide);
      target.style.scrollBehavior = 'smooth';
    });

    let lastKnownShift = 0;

    function slide(e) {
      target.setPointerCapture(e.pointerId);
      
      const shift = e.x - originalX;

      switch(shift < 0) {
        case true:
          if (shift > lastKnownShift) {
            originalX = lastKnownShift;
            return;
          }
          break;
        default:
          if (shift < lastKnownShift) {
            originalX = lastKnownShift;
            return;
          };
      }

      lastKnownShift = shift;
      
      target.scrollLeft += shift > 0 ? 1 * -1 : 1;
    }
  }

  function onMouseWheel(e) {
    if (lockScroll) return;
    
    const target = e.target.closest('.posters');
    const cardWidth = document.querySelector('.card').offsetWidth + 10;
    
    target.scrollLeft += e.deltaY > 0 ? cardWidth : cardWidth * -1;
    
    lockScroll = true;
    setTimeout(() => lockScroll = false, 300);
  }

  function selectMovieCard(index) {
    selectedMovieCard.value = index;
  }

</script>
<!-- @pointerdown.passive="onPointerDown" -->
<template>
  <div class="posters"
    @mousewheel.passive="onMouseWheel"
  >
    <MovieCard
      v-for="n in props.items.length"
      :index="n - 1"
      :item="props.items[n - 1]"
      :target="props.target"
      :showCard="props.showCards"
      :watchlistIsUpdating="props.watchlistIsUpdating"
      :isSelected="selectedMovieCard === n - 1 ? true : false"
      @selectMovieCard="selectMovieCard"
    />
  </div>
</template>

<style scoped>
  .posters {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    flex: 1 0 50%;
    max-height: 50%;
    padding: 20px;
    border-left: 5px solid white;
    border-right: 5px solid white;
    border-radius: 20px 20px 0 0;
    box-shadow: inset 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
    overflow-x: auto;
    scroll-behavior: smooth;
  }

  .posters::before, .posters::after {
    content: '';
    margin: auto;
  }

</style>