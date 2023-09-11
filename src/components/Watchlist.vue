<script setup>
  import { computed, inject, ref } from 'vue';
  import MoviesFromWatchlist from './MoviesFromWatchlist.vue';

  const localization = inject('localization');
  const appLang = inject('appLang');

  const user = inject('user');
  const authentication = inject('authentication');

  const logIn = inject('logIn');
  const logOut = inject('logOut');

  const showMovieInfo = ref(false);

  const userAvatar = computed(() => user.value.avatar.tmdb.avatar_path ? `https://image.tmdb.org/t/p/w500/${user.value.avatar.tmdb.avatar_path}` :
                                    user.value.avatar.gravatar.hash ? `https://secure.gravatar.com/avatar/${user.value.avatar.gravatar.hash}` : false);

  function toggleMovieInfo() {
    showMovieInfo.value = !showMovieInfo.value;
  }
</script>

<template>
  <Transition name="watchlist" mode="out-in">
    
    <div v-if="user" class="watchlist__container">
      <div class="watchlist__user">
        <div class="watchlist__user-icon">
          <span v-if="!userAvatar" class="material-symbols-outlined">person</span>
          <img :src="userAvatar" alt="user_avatar">
        </div>
        <h3 class="watchlist__username">{{ user.username }}</h3>
        <button class="watchlist__button watchlist__button--logout" @click="logOut"><span class="material-symbols-outlined">logout</span></button>
      </div>
      
      <div id="watchlist" class="watchlist__list">
        <!-- <div class="watchlist__list-wrapper"> -->
          <Transition name="watchlist" mode="out-in">
            <Suspense>
              <div class="watchlist__list-wrapper">
                <MoviesFromWatchlist />
              </div>
              <template #fallback>
                <p :style="{color: 'rgba(0, 0, 0, 0.7)'}">{{ localization.watchlist.fetching_info[appLang] }}...</p>
              </template>
            </Suspense>
          </Transition>
        <!-- </div> -->
      </div>
    </div>

    <div v-else-if="authentication.pending" class="watchlist__container watchlist__container--redirecting">{{ localization.watchlist.redirecting_info[appLang] }}...</div>

    <div v-else class="watchlist__container watchlist__container--unlogged">
      <p>{{ localization.watchlist.login_info[appLang] }}</p>
      <button class="watchlist__button watchlist__button--login" :disabled="authentication.pending" @click="logIn">sign in</button>
      <p>{{ localization.watchlist.login_info_via[appLang] }}</p>
      <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg" alt="">
    </div>

  </Transition>
</template>

<style scoped>
  .watchlist__container {
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
    width: 100%;
    height: 100%;
    max-height: 100%;
  }

  .watchlist__container--unlogged > p {
    margin: 0;
    text-align: center;
  }

  .watchlist__container--unlogged > img {
    display: block;
    max-width: 200px;
    margin: 10px auto 0px auto;
  }

  .watchlist__container--unlogged::before,
  .watchlist__container--unlogged::after {
    content: '';
    margin: auto 0;
  }

  .watchlist__container--redirecting {
    align-items: center;
    justify-content: center;
  }

  .watchlist__user-icon,
  .watchlist__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: black;
    background-color: white;
    border-radius: 50%;
    box-shadow: 1px 1px 5px 0px black;
    overflow: hidden;
  }

  .watchlist__user-icon > span {
    font-size: 35px;
  }

  .watchlist__user-icon > img {
    display: block;
    height: 100%;
  }

  .watchlist__user {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .watchlist__username {
    margin: 0 10px;
    padding: 0;
  }

  .watchlist__button {
    border: 0;
    cursor: pointer;
  }

  .watchlist__button--login {
    flex-direction: column;
    width: auto;
    height: auto;
    margin: 20px auto 20px auto;
    padding: 10px;
    font-size: 18px;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 5px;
  }

  .watchlist__button--logout {
    margin-left: auto;    
  }

  .watchlist__list {
    position: relative;
    flex: 1 1 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-height: 100%;
    border-radius: 15px;
    box-shadow: inset 0px 0px 5px 0px black;
    overflow: hidden;
  }

  .watchlist__list-wrapper {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: center;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
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
</style>