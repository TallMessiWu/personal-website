<template>
  <el-row class="container" type="flex" justify="space-between" align="middle">

    <!--logo-->
    <el-col :span="6" :offset="1">
      <el-row>
        <img class="logo" src="@/assets/logo.png" alt="logo"/>
      </el-row>
    </el-col>

    <!--选项-->
    <el-col :span="10">
      <el-row>
        <el-col :span="4">
          首页
        </el-col>
        <el-col :span="4">
          视频
        </el-col>
        <el-col :span="4">
          音乐
        </el-col>
        <el-col :span="4">
          项目
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">

</script>

<style scoped>
.container {
  padding: 1rem 0 1rem 0;
  border-bottom: 1px solid #e5e5e5;
}

.logo {
  width: 3rem;
}

</style>