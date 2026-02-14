<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter();

router.push("/home")

</script>

<style scoped></style>
