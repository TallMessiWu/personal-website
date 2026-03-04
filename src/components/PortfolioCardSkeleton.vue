<template>
  <div class="portfolio-card-skeleton">
    <el-skeleton animated style="height: 100%;">
      <template #template>
        <!-- 保持与 .image-wrapper 一致的 16 / 10 比例 -->
        <div class="image-wrapper-skeleton">
          <el-skeleton-item variant="image" class="image-skeleton" />

          <div class="overlay-skeleton">
            <!-- 名称占位 -->
            <el-skeleton-item variant="h1" class="title-skeleton" style="width: 50%; height: 32px;" />
             <!-- 帖子数量占位 -->
            <el-skeleton-item variant="text" class="meta-skeleton" style="width: 30%; height: 16px;" />
            <!-- 查看合集按钮占位 -->
            <el-skeleton-item variant="button" class="btn-skeleton" style="width: 100px; height: 36px; border-radius: 12px;" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped lang="less">
.portfolio-card-skeleton {
  width: 100%;
}

.image-wrapper-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  aspect-ratio: 16 / 10;

  .image-skeleton {
    width: 100%;
    height: 100%;
  }

  /* 把浮层的背景改成和卡片内容一样的底色 */
  .overlay-skeleton {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    /* 改用与卡片一致的主题表面色 */
    background-color: var(--color-surface);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }
}

:deep(.el-skeleton) {
  --el-skeleton-color: var(--color-border);
  --el-skeleton-to-color: var(--color-surface);
}
</style>
