<template>

  <el-container>
    <el-header>
      <the-header/>
    </el-header>

    <el-main>
      <router-view/>
    </el-main>

    <el-footer>
      <the-footer/>
    </el-footer>

  </el-container>

</template>

<script setup lang="ts">
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";

</script>

<style scoped lang="less">
.el-container, .el-header, .el-main, .el-footer {
  height: auto;
  padding: 0;
}

.el-header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
}
</style>