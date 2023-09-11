<script setup>
  import { ref } from 'vue';
  import MenuTab from './MenuTab.vue';
  import MenuTabWrapper from './MenuTabWrapper.vue';
  import Settings from './Settings.vue';
  import Watchlist from './Watchlist.vue';
  import Preferences from './Preferences.vue';

  const props = defineProps(['activeTab']);

  // const availableTabs = ['settings', 'watchlist', 'preferences'];
  const activeTab = ref(props.activeTab);

  function selectTab(tabName) {
    activeTab.value = tabName;
  }
</script>

<template>
  <div class="menu__container">

    <MenuTab
      :activeTab="activeTab"
      :isHidden="false"
      :type="'preferences'"
      :icon="'tune'"
      @selectTab="selectTab"
    >
      <MenuTabWrapper
        :type="'preferences'"
      >
        <Preferences />
      </MenuTabWrapper>
    </MenuTab>

    <MenuTab
      :activeTab="activeTab"
      :isHidden="activeTab === 'preferences'"
      :type="'watchlist'"
      :icon="'visibility'"
      @selectTab="selectTab"
    >
      <MenuTabWrapper
        :type="'watchlist'"
      >
        <Watchlist />
      </MenuTabWrapper>
    </MenuTab>

    <MenuTab
      :activeTab="activeTab"
      :isHidden="activeTab === 'preferences' || 'watchlist'"
      :type="'settings'"
      :icon="'settings'"
      @selectTab="selectTab"
    > 
      <MenuTabWrapper
        :type="'settings'"
      > 
        <Settings />
      </MenuTabWrapper>
    </MenuTab>

  </div>
</template>

<style scoped>
.menu__container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 204, 0, 0.8);
  z-index: 9999;
}

/* .menu__buttons {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  max-width: 600px;
  height: 90%;
  background-color: rgba(255, 0, 0, 0.4);
}

.menu__buttons--hidden {
  display: none;
}

.menu__phantom-btn {
  width: 40px;
  height: 100%;
  background-color: rgba(0, 255, 255, 0.4);
  cursor: pointer;
}

.menu__phantom-btn--after-active {
  margin-left: auto;
}

@media screen and (max-width: 600px) {
  .menu__buttons {
    width: 95%;
    height: 95%;
  }
} */
</style>