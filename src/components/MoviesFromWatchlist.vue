<script setup>
  import { computed, inject, ref } from 'vue';
  import useFetch from '../hooks/useFetch';
  import WatchListItem from './WatchListItem.vue';

  const localization = inject('localization');
  const appLang = inject('appLang');

  const availableValues = inject('availableValues');
  const options = inject('options');
  const user = inject('user');
  const watchlist = inject('watchlist');
  const editWatchList = inject('editWatchList');
  const syncLocalWatchlistWithDB = inject('syncLocalWatchlistWithDB');
  const useLocalWatchList = inject('useLocalWatchList');

  const selectedItem = ref(null);
  const page = ref(0);
  const isReverse = ref(false);

  const language = computed(() => options.value.language < availableValues.languages.length - 1 ? availableValues.languages[options.value.language].id : options.value.custom_language);
  
  const movies = await getAllMovies();
  
  const availablePages = computed(() => Math.floor((movies.value.length - 1) / 4));
  const pageContent = computed(() => movies.value.slice(page.value * 4, page.value * 4 + 4));
  const isWatchlistEmpty = computed(() => pageContent.value.length === 0 ? true : false );

  async function getAllMovies() {

    if (watchlist.value.use_local) {
      await new Promise((res) => setTimeout(res, 380));
      return ref([...watchlist.value.items]);
    }

    const result = ref([]);

    const firstRequest = await useFetch(`https://api.themoviedb.org/3/account/${user.value.id}/watchlist/movies?language=${language.value}&sort_by=created_at.desc`, 1000);
    result.value = result.value.concat(firstRequest.data.results);

    if (firstRequest.data.total_pages > 1) {
      for (let i = 2; i <= firstRequest.data.total_pages; i++) {
        const newRequest = (await useFetch(`https://api.themoviedb.org/3/account/${user.value.id}/watchlist/movies?language=${language.value}&page=${i}&sort_by=created_at.desc`, 0)).data.results;
        result.value = result.value.concat(newRequest);
      }
    };

    syncLocalWatchlistWithDB(result.value);

    return result;
  }

  async function removeFromWatchlist(index, item) {
    isReverse.value = false;
    movies.value.splice(index + (page.value * 4), 1);
    selectItem(null);
    if (pageContent.value.length === 0) changePage('prev');
    await editWatchList('remove', item);
  }

  function changePage(type) {
    useLocalWatchList(false);

    let targetPage;
    
    switch (true) {
      case type === 'next':
        isReverse.value = false;
        targetPage = page.value + 1;
        page.value = targetPage < availablePages.value ? targetPage : availablePages.value;
        break;
      case type === 'prev':
        isReverse.value = true;
        targetPage = page.value - 1;
        page.value = targetPage > -1 ? targetPage : 0;
        break;
    }

    selectItem(null);
  }

  function selectItem(index) {
    selectedItem.value = index;
  }

  function onBeforeLeave(el) {
    el.style.width = el.offsetWidth + "px";
    el.style.height = el.offsetHeight + "px";
  }
  
</script>

<template>
  <Transition name="watchlist" mode="out-in">
    <div v-if="isWatchlistEmpty" class="item__info">
      <p>{{ localization.watchlist.empty_info[appLang] }}.</p>
    </div>
  </Transition>
  <TransitionGroup :name="isReverse ? 'watchlist-items--reverse' : 'watchlist-items'" @before-leave="onBeforeLeave">
    <div
      v-for="(movie, index) in pageContent"
      :key="movie.id"
      class="item"
    >
    <Suspense>
      <WatchListItem
        :index="index"
        :item="movie"
        :lang="language"
        :isSelected="selectedItem === index ? true : false"
        :isLast="pageContent.length - 1 === index ? true : false"
        @selectItem="selectItem"
        @removeItem="removeFromWatchlist"
      />
      <template #fallback>
        <div
          class="item-placeholder"
        >
          <span class="material-symbols-outlined">cycle</span>
        </div>
      </template>
    </Suspense>
    </div>
  </TransitionGroup>
  <Teleport to="#watchlist">
    <div v-if="page !== 0 && !isWatchlistEmpty" class="page-btn page-btn--prev" @click="changePage('prev')"><span class="material-symbols-outlined">arrow_back_ios</span></div>
    <div v-if="page !== availablePages && !isWatchlistEmpty" class="page-btn page-btn--next" @click="changePage('next')"><span class="material-symbols-outlined">arrow_forward_ios</span></div>
  </Teleport>
</template>

<style scoped>
.item {
  flex: 1 0 40%;
  max-width: 210px;
}

.item__info {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.item__info > p {
  margin: 5px;
  color: rgba(0, 0, 0, 0.7);
  text-align: center;
}

.item-placeholder {
  flex: 1 0 40%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
  max-width: 190px;
  max-height: 284px;
  aspect-ratio: 375 / 562;
  margin: 10px;
  border: 0px solid black;
  border-radius: 10px;
  box-shadow: 1px 1px 5px 0px black;
  background-color: #f9c00e;
  transition: all 380ms ease-in-out;
  overflow: hidden;
}

.item-placeholder > span {
  font-size: 60px;
  height: 50px;
  animation-name: spin;
  animation-duration: 1000ms;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.page-btn  {
  position: absolute;
  top: 50%;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 40px;
  background-color: white;
  box-shadow: 1px 1px 5px 0px black;
  cursor: pointer;
}

.page-btn--prev {
  border-radius: 0% 50% 50% 0%;
  transform: translate(-1%, -50%);
}

.page-btn--prev > span {
  transform: translateX(-3px);
}

.page-btn--next {
  left: 100%;
  border-radius: 50% 0% 0% 50%;
  transform: translate(-99%, -50%);
}

.page-btn--next > span {
  transform: translateX(8px);
}

.watchlist-enter-active,
.watchlist-leave-active {
  transition: all 380ms cubic-bezier(1,-0.49,.02,1.55);
}

.watchlist-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.watchlist-enter-to {
  transform: translateX(0%);
  opacity: 1;
}

.watchlist-leave-from {
  transform: translateX(0%);
  opacity: 1;
}

.watchlist-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.watchlist-items-move,
.watchlist-items-enter-active,
.watchlist-items-leave-active {
  transition: all 380ms ease-in-out;
}

.watchlist-items-enter-from {
  /* opacity: 0; */
  transform: translateX(250%);
}

.watchlist-items-leave-to {
  /* opacity: 0; */
  transform: translateX(-250%);
}

.watchlist-items-leave-active {
  position: absolute;
}

/*  */

.watchlist-items--reverse-move,
.watchlist-items--reverse-enter-active,
.watchlist-items--reverse-leave-active {
  transition: all 380ms ease-in-out;
}

.watchlist-items--reverse-enter-from {
  /* opacity: 0; */
  transform: translateX(-250%);
}

.watchlist-items--reverse-leave-to {
  /* opacity: 0; */
  transform: translateX(250%);
}

.watchlist-items--reverse-leave-active {
  position: absolute;
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