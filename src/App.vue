<script setup>
  import { computed, ref, watch, onErrorCaptured, provide, onMounted, readonly, inject } from 'vue';
  import useRandom from './hooks/useRandom';
  import useFetch from './hooks/useFetch';
  import useFullMovieInfo from './hooks/useFullMovieInfo';
  import GlobalWrapper from './components/GlobalWrapper.vue';
  import FakeWrapper from './components/FakeWrapper.vue';
  import InfoBlock from './components/InfoBlock.vue';
  import Menu from './components/Menu.vue';

  const localization = inject('localization');

  const availableValues = {
    languages: [
      { title: 'English', id: 'en' },
      { title: 'Україньска', id: 'uk' },
      { title: 'Русский', id: 'ru' },
      { title: 'Custom', id: 'custom' }], // keep 'custom' always at last index of array
    cards: [
      { title: '3', id: 3 },
      { title: '6', id: 6 },
      { title: '12', id: 12 },
    ],
    status: ['pending', 'win', 'lose'],
  };

  const availableGenres = ref({
    language: null,
    genres: []
  });

  const user = ref( JSON.parse(localStorage.getItem("user")) );
  
  const watchlist = ref({
    use_local: false,
    is_updating: false,
    IDs: localStorage.getItem("watchlist_IDs") === null ? [] : JSON.parse(localStorage.getItem("watchlist_IDs")),
    items: localStorage.getItem("watchlist_items") === null ? [] : JSON.parse(localStorage.getItem("watchlist_items")),
  });

  const authentication = ref({
    triggered: localStorage.getItem('authentication_triggered') ? true : false, // trigger helps to detect if user comeback from MovieDB auth page.
    token: localStorage.getItem('fresh_token'), // need to genereate session ID. Session ID need to retrive user data.
    approved: null, // user can approve or... 
    denied: null, // ... deny token, during authentication on MovieDB side
    pending: false,
    error: null,
    completed: null,
  }); 

  const state = ref({
    key: 1,
    page_limit: 500,
    game: 0,
    settings_trigger: false,
    movie: { chosen: null, target: null },
    fetch_resolved: false,
    content_loaded: false,
    menu_is_active: false,
    menu_tab: 'watchlist',
  });

  const options = ref({
    cards_on_desk: localStorage.getItem("cards_on_desk") === null ? 0 : localStorage.getItem("cards_on_desk") * 1,
    language: localStorage.getItem("language") === null ? 0 : localStorage.getItem("language") * 1,
    custom_language: localStorage.getItem("custom_language"),
  });

  const gamePreferences = ref({
    release_year: localStorage.getItem("release_year") ? localStorage.getItem("release_year") * 1 : null,
    include_actors: localStorage.getItem("include_actors") === null ? [] : JSON.parse(localStorage.getItem("include_actors")),
    include_genres: localStorage.getItem("include_genres") === null ? [] : localStorage.getItem("include_genres").split(',').map(item => item * 1),
  });

  const appLang = computed(() => options.value.language === availableValues.languages.length - 1 ? availableValues.languages[0].id : availableValues.languages[options.value.language].id);

  const URLSettings = computed(() => {
    return {
      language: options.value.language < availableValues.languages.length - 1 ? availableValues.languages[options.value.language].id : options.value.custom_language,
      page: useRandom(1, state.value.page_limit),
      release_year: gamePreferences.value.release_year,
      include_actors: gamePreferences.value.include_actors.map(item => item.id),
      include_genres: gamePreferences.value.include_genres,
    }
  });

  // Provide values and functions
  provide('genres', {
    availableGenres,
    updateAvailableGenres
  });

  // Provide only values
  provide('appLang', readonly(appLang));
  provide('availableValues', readonly(availableValues));
  provide('options', readonly(options));
  provide('gamePreferences', readonly(gamePreferences));
  provide('user', readonly(user));
  provide('watchlist', readonly(watchlist));
  provide('authentication', readonly(authentication));

  // Provide only functions
  provide('changeGameStatusTo', changeGameStatusTo);
  provide('updateChosenMovie', updateChosenMovie);
  provide('updateTargetMovie', updateTargetMovie);
  provide('updateCardsOnDesk', updateCardsOnDesk);
  provide('updateLanguage', updateLanguage);
  provide('updateCustomLanguage', updateCustomLanguage);
  provide('updateReleaseYear', updateReleaseYear);
  provide('updateIncludedGenres', updateIncludedGenres);
  provide('updateIncludedActors', updateIncludedActors);
  provide('logIn', logIn);
  provide('logOut', logOut);
  provide('editWatchList', editWatchList);
  provide('syncLocalWatchlistWithDB', syncLocalWatchlistWithDB);
  provide('syncWatchlistItem', syncWatchlistItem);
  provide('useLocalWatchList', useLocalWatchList);
  provide('openMenuOnTab', openMenuOnTab);

  watch(() => state.value.page_limit, newAPIRequest);

  watch(() => authentication.value.approved, (newValue) => {
    if (newValue) logIn();
  });

  watch(() => authentication.value.denied, (newValue) => {
    if (newValue)
      setTimeout(() => {
        authentication.value.triggered = false;
        localStorage.removeItem('authentication_triggered');
        authentication.value.token = null;
        authentication.value.pending = false;
      }, 1000);

      setTimeout(() => authentication.value.denied = null, 3000)
  });

  watch(() => authentication.value.error, (newValue) => {
    if (newValue)
      authentication.value.triggered = false;
      localStorage.removeItem('authentication_triggered');
      authentication.value.token = null;
      authentication.value.pending = false;

      setTimeout(() => authentication.value.error = null, 3000);
  })

  watch(user, () => {
    if (user.value) localStorage.setItem("user", JSON.stringify(user.value));
  });

  watch(() => authentication.value.completed, () => {
    authentication.value.triggered = false;
    localStorage.removeItem('authentication_triggered');
    authentication.value.pending = false;

    setTimeout(() => authentication.value.completed = null, 2000);
  });

  onMounted(() => {
    const search = window.location.search;

    if (search.length === 0) {
      localStorage.removeItem('used_token');
      return;
    }
    
    if (user.value) {
      localStorage.removeItem('used_token');
      window.location = window.location.origin;
      return;
    }

    const parsedSearch = parse(search);
    const isValid = validate(parsedSearch);
    
    if (!isValid) {
      localStorage.removeItem('used_token');
      localStorage.removeItem('authentication_triggered');
      window.location = window.location.origin;
      return;
    }

    authentication.value.approved = 'approved' in parsedSearch ? true : false;
    authentication.value.denied = authentication.value.approved ? false : true;
    localStorage.setItem('used_token', authentication.value.token);
    localStorage.removeItem('fresh_token');

    function parse(str) {
      let strToArr = str.split('&');
      let result = {};

      for (let i = 0; i < strToArr.length; i++) {
        const item = strToArr[i].split('=');
        const key = item[0][0] === '?' ? item[0].slice(1) : item[0];
        const value = item[1];
        
        result[key] = value;
      }

      return result;
    }

    function validate(obj) {
      return 'request_token' in obj && obj.request_token !== localStorage.getItem('used_token') ? true : false;
    }
  });

  onMounted(() => {
    window.onload = e => state.value.content_loaded = true;
  });

  onErrorCaptured(() => console.log("ERROR"));

  function setNewPageLimitTo(newValue) {
    // console.log("Changing Page Limit to " + newValue);
    state.value.page_limit = newValue * 1;
  }

  function newAPIRequest() {
    // console.log("Making new API request...", URLSettings.value);
    releaseSettingsTrigger();
    URLSettings.value.page = useRandom(1, state.value.page_limit);
    state.value.key += 1;
  }

  function changeGameStatusTo(newIndex) {
    // console.log("Game status changed to: " + availableValues.status[newIndex]);
    if (state.value.fetch_resolved) state.value.game = newIndex;
    if (newIndex !== 0) state.value.fetch_resolved = false;
  }

  function updateChosenMovie(movie) {
    // console.log("User chose this movie:", movie);
    state.value.movie.chosen = movie;
  }

  function updateTargetMovie(movie) {
    // console.log("This movie is target now:", movie);
    state.value.movie.target = movie;
  }

  function updateLanguage(newIndex) {
    switch (true) {
      case newIndex < availableValues.languages.length && newIndex > -1:
        // console.log("Language changed to: " + availableValues.languages[newIndex].title);
        triggerSettingsChanges();
        options.value.language = newIndex;
        localStorage.setItem('language', newIndex);

        if (newIndex !== availableValues.languages.length - 1) updateCustomLanguage(null);
        break;
      default:
        // console.log("Wrong language index passed!");
    }
  }

  function updateCustomLanguage(ISOCode) {
    if (ISOCode === null) {
      options.value.custom_language = null;
      localStorage.removeItem('custom_language');
      return;
    }

    switch (isISOCode(ISOCode)) {
      case true:
        triggerSettingsChanges();
        options.value.custom_language = ISOCode;
        localStorage.setItem('custom_language', ISOCode);
        break;
      default:
        options.value.custom_language = 'en';
        localStorage.setItem('custom_language', 'en');
    }

    function isISOCode(ISOCode) {
      let languageNames = new Intl.DisplayNames(['en'], {type: 'language'});
      
      try {
        languageNames.of(ISOCode);
        // console.log("ISOCode test PASSED! Changing custom language to: " + languageNames.of(ISOCode));
        return true;
      } catch(err) {
        // console.log("ISOCode test FAILED! Changing custom language to: English");
        return false;
      }
    }
  }

  function updateCardsOnDesk(newIndex) {
    switch (newIndex < availableValues.cards.length && newIndex > -1) {
      case true:
        // console.log("Quantity of cards on a desk now: " + availableValues.cards[newIndex].title);
        triggerSettingsChanges();
        options.value.cards_on_desk = newIndex;
        localStorage.setItem('cards_on_desk', newIndex);
        break;
      default:
        // console.log("Wrong quantity index passed!");
    }
  }

  function updateReleaseYear(newValue) {
    // console.log("Changing target release year to " + newValue);
    triggerSettingsChanges();
    gamePreferences.value.release_year = newValue ? newValue * 1 : null;
    if (newValue === null) {
      localStorage.removeItem('release_year');
    } else {
      localStorage.setItem('release_year', newValue);
    }
  }

  function updateAvailableGenres(lang, newArrWithGenres) {
    // console.log("Updating array of available genres (for caching purposes)...");
    // console.log("--" + lang);
    availableGenres.value.language = lang;
    availableGenres.value.genres = [...newArrWithGenres];
  }

  function updateIncludedGenres(index = false) {
    triggerSettingsChanges();

    if (!index) {
      // console.log(`Genres collection cleared!`);
      gamePreferences.value.include_genres = [];
      localStorage.removeItem('include_genres');
      return;
    }

    const findIndex = gamePreferences.value.include_genres.indexOf(index);

    switch (findIndex !== -1) {
      case true:
        // console.log(`Removing genre (ID:${index}) from collection.`);
        gamePreferences.value.include_genres.splice(findIndex, 1);
        break;
      case false:
        // console.log(`Adding genre (ID:${index}) to collection.`);
        gamePreferences.value.include_genres.push(index);
        break;
    }

    localStorage.setItem('include_genres', gamePreferences.value.include_genres);
  }
  
  function updateIncludedActors(actorsObjOrInnerIndex = false) {
    triggerSettingsChanges();

    if (actorsObjOrInnerIndex === false) {
      // console.log(`Actors collection cleared!`);
      gamePreferences.value.include_actors = [];
      localStorage.removeItem('include_actors');
      return;
    }

    if (typeof actorsObjOrInnerIndex === 'number') {
      // console.log(`Actor ${gamePreferences.value.include_actors[actorsObjOrInnerIndex].name} was removed from collection!`);
      gamePreferences.value.include_actors.splice(actorsObjOrInnerIndex, 1);
      localStorage.setItem('include_actors', JSON.stringify(gamePreferences.value.include_actors));
      return;
    }

    const findIndex = actorsIndexInCollection();

    if (findIndex === -1) {
      // console.log(`Adding actor to collection.`);
      gamePreferences.value.include_actors.push(actorsObjOrInnerIndex);
      localStorage.setItem('include_actors', JSON.stringify(gamePreferences.value.include_actors));
    } else {
      // console.log(`Actor is already in collection.`);
    }

    function actorsIndexInCollection() {
      const checkObjects = gamePreferences.value.include_actors.map(item => item.id === actorsObjOrInnerIndex.id ? true : false);
      return checkObjects.indexOf(true);
    }
  }

  async function logIn() {
    // (1) Initilal Function entry:
    // - get request token
    // - save token and authentication trigger state to local memory
    // - redirect to authentication page of request token
    // (2) Function entry after user comes back with validated request token:
    // - use request token to get session ID
    // - use session ID to get user ID
    // - save user's DATA to Local Storage, so we don't have to ask user to login again

    authentication.value.pending = true;

    let requestToken = null;

    // console.log(authentication.value.token);

    if (authentication.value.token) { // (2)
      requestToken = authentication.value.token;
    } else { // (1)
      
      try {
        requestToken = (await useFetch('https://api.themoviedb.org/3/authentication/token/new', 1500)).data.request_token;
        if (requestToken === undefined) throw new Error();
      } catch (err) {
        // console.log("Error during fetching request token", err);
        authentication.value.error = { type: 'token' };
        return;
      }

      localStorage.setItem('authentication_triggered', true);
      localStorage.setItem('fresh_token', requestToken);

      window.open(`https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${window.location.origin}`, '_self');
      return;
    }

    let sessionID = null;
    let userData = null;

    try {
      sessionID = (await useFetch('https://api.themoviedb.org/3/authentication/session/new', 1000, { request_token: requestToken })).data.session_id;
      if (sessionID === undefined) throw new Error();
    } catch (err) {
      // console.log("Error during fetching session ID", err);
      authentication.value.error = { type: 'session_id' };
      return;
    }

    try {
      userData = (await useFetch(`https://api.themoviedb.org/3/account/account_id?session_id=${sessionID}`, 1000)).data;
      if (userData.success === false || userData === null) throw new Error();
    } catch (err) {
      // console.log("Error during fetching user data", err);
      authentication.value.error = { type: 'user_data' };
      return;
    }

    user.value = userData;
    authentication.value.completed = true;
  }

  function logOut() {
    user.value = null;

    authentication.value.approved = null;
    authentication.value.token = null;
    
    localStorage.removeItem('user');
    localStorage.removeItem('watchlist_items');
    localStorage.removeItem('watchlist_IDs');
  }

  async function editWatchList(type, item) {
    watchlist.value.is_updating = true;
    
    await useFetch(`https://api.themoviedb.org/3/account/${user.value.id}/watchlist`, 1000, { media_type: 'movie', media_id: item.id, watchlist: type === 'add' });
    
    if (type === 'add') {      
      item.in_watchlist = true;
      watchlist.value.IDs.unshift(item.id);
      const fullMovieInfo = await useFullMovieInfo(item, options.value.custom_language ? options.value.custom_language : availableValues.languages[options.value.language].id);
      watchlist.value.items.unshift(fullMovieInfo);
    } else {
      const targetID = watchlist.value.IDs.indexOf(item.id);
      watchlist.value.IDs.splice(targetID, 1);
      watchlist.value.items.splice(targetID, 1);
    }

    localStorage.setItem('watchlist_IDs', JSON.stringify(watchlist.value.IDs));
    localStorage.setItem('watchlist_items', JSON.stringify(watchlist.value.items));

    watchlist.value.is_updating = false;
  }

  function syncLocalWatchlistWithDB(DBArray) {
    watchlist.value.IDs = [];
    watchlist.value.items = [];

    DBArray.forEach((item) => watchlist.value.IDs.push(item.id));
    watchlist.value.items = [...DBArray];

    localStorage.setItem('watchlist_IDs', JSON.stringify(watchlist.value.IDs));
    localStorage.setItem('watchlist_items', JSON.stringify(watchlist.value.items));
  }

  function syncWatchlistItem(item) {
    watchlist.value.items[watchlist.value.IDs.indexOf(item.id)] = {...item};

    localStorage.setItem('watchlist_IDs', JSON.stringify(watchlist.value.IDs));
    localStorage.setItem('watchlist_items', JSON.stringify(watchlist.value.items));
  }

  function useLocalWatchList(newValue) {
    if (typeof newValue !== 'boolean') return;  
    watchlist.value.use_local = newValue;
  }

  function toggleMenu() {
    // console.log(state.value.menu_is_active ? 'Menu is DIACTIVATED' : 'Menu is ACTIVATED');
    state.value.menu_is_active = !state.value.menu_is_active;
  }

  function openMenuOnTab(tab) {
    // console.log(state.value.menu_is_active ? 'Menu is DIACTIVATED' : 'Menu is ACTIVATED');
    state.value.menu_is_active = true;
    state.value.menu_tab = tab;
  }

  function triggerSettingsChanges() {
    if (state.value.settings_trigger) return;
    // console.log("User did some changes in settings. This will cause new API request");
    state.value.settings_trigger = true;
  }

  function releaseSettingsTrigger() {
    if (!state.value.settings_trigger) return;
    // console.log("Settings trigger switched to default value after new API request");
    state.value.settings_trigger = false;
  }
</script>

<template>
  
  <Suspense
    v-if="!authentication.triggered"
    timeout="0"
    @resolve="state.fetch_resolved = true"
    @pending="state.fetch_resolved = false">
      <GlobalWrapper
        :key="state.key"
        :URLSettings="URLSettings"
        :pageLimit="state.page_limit"
        :cardsOnDesk="availableValues.cards[options.cards_on_desk].id"
        :status="availableValues.status[state.game]"
        :menuIsActive="state.menu_is_active"
        :settingsTriggered="state.settings_trigger"
        @setNewPageLimitTo="setNewPageLimitTo"
        @newAPIRequest="newAPIRequest"
      />

      <template #fallback>
        <FakeWrapper
          :status="availableValues.status[state.game]"
        />
      </template>
  </Suspense>

  <Transition name="info">
    <InfoBlock
      v-if="state.game !== 0"
      :status="availableValues.status[state.game]"
      :movie="state.movie"
      :fetchResolved="state.fetch_resolved"
      :watchlistIsUpdating="watchlist.is_updating"
    />
  </Transition>

  <Transition name="menu" mode="out-in">
    <div
      v-if="!state.menu_is_active && !authentication.triggered"
      class="menu"
      @click="openMenuOnTab('settings')">
        <span class="material-symbols-outlined">menu</span>
    </div>

    <Menu
      v-else-if="state.menu_is_active"
      :activeTab="state.menu_tab"
      @pointerdown.self="toggleMenu"
    />
  </Transition>

  <Transition name="loader">
    <!-- v-if="!state.fetch_resolved && state.game === 0" -->
    <div
      v-if="!state.fetch_resolved && state.game === 0"
      class="loader loader--sub-loader"
      :style="{ filter: state.menu_is_active ? 'blur(5px)' : 'none' }"
    >
      <div class="loader__content"><span class="material-symbols-outlined">cycle</span></div>
    </div>
  </Transition>
  
  <Transition name="loader">
    <div v-if="!state.content_loaded" class="loader">{{ localization.loading[appLang] }}...</div>
  </Transition>
  
  <Transition name="login">
    <div v-if="authentication.triggered" class="login-background"></div>
  </Transition>

  <Transition name="login" mode="out-in">
    <div
      v-if="authentication.triggered && authentication.pending"
      class="login-info"
    >
      {{ localization.loggin.pending[appLang] }}...
    </div>
    
    <div
      v-else-if="authentication.completed"
      class="login-info"
    >
    {{ localization.loggin.success[appLang] }}
    </div>

    <div
      v-else-if="authentication.denied"
      class="login-info"
    >
    {{ localization.loggin.reject[appLang] }}
    </div>

    <div
      v-else-if="authentication.error"
      class="login-info"
    >
      {{ authentication.error.type === 'session_id' ? localization.loggin.error_id[appLang] :
         authentication.error.type === 'user_data' ? localization.loggin.error_data[appLang] : localization.loggin.error_any[appLang] }}
    </div>
  </Transition>

</template>

<style scoped>
  .loader {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: white;
    transition: filter 180ms ease-in-out;
    z-index: 10000;
  }

  .loader__content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background-color: white;
    border-radius: 50%;
    animation-name: spin;
    animation-duration: 1000ms;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  .loader__content > span {
    font-size: 70px;
    transform: translateY(6px);
  }

  .loader--sub-loader {
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9998;
  }

  .login-background,
  .login-info {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  }

  .login-background {
    background-color: white;
    transition-delay: 760ms !important;
  }

  .menu {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 0 0 15px 0;
    background-color: white;
    box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 1);
    text-shadow: 1px 1px 0px rgba(0, 0, 0, 1);
    cursor: pointer;
    z-index: 9999;
  }

  .menu > span {
    font-size: 30px;
  }

  .login-enter-active,
  .login-leave-active {
    transition: opacity 380ms ease-in-out;
  }

  .login-enter-from,
  .login-leave-to {
    opacity: 0;
  }

  .info-enter-active,
  .info-leave-active,
  .loader-enter-active,
  .loader-leave-active {
    transition: all 380ms ease-in-out;
  }

  .info-enter-from,
  .info-leave-to,
  .loader-enter-from,
  .loader-leave-to {
    transform: scale(2);
    opacity: 0;
  }

  .info-enter-to {
    transition-delay: 380ms;
  }

  .loader-leave-to {
    transition-delay: 380ms;
  }

  .menu-enter-active,
  .menu-leave-active {
    transition: all 380ms ease-in-out;
  }

  .menu-enter-from,
  .menu-leave-to {
    left: -100%;
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