<script setup>
  import DescriptionBlock from './DescriptionBlock.vue';
  import PostersBlock from './PostersBlock.vue';

  const props = defineProps(['status']);
</script>

<template>
  <div class="wrapper" :style="{ filter: props.status !== 'pending' ? 'blur(5px)' : 'none' }">

    <DescriptionBlock
      :item="false"
      :showText="false"
    />

    <div class="separator"></div>

    <PostersBlock
      :items="false"
      :target="false"
      :showCards="false"
    />

  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  transition: filter 180ms ease-in-out;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 50%;
  height: auto;
}

.separator {
  display: block;
  flex-shrink: 0;
  height: 10px;
  background-color: white;
}
</style>