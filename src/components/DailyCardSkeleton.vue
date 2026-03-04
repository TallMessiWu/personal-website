<template>
  <div class="daily-card-skeleton" :class="{ 'no-media': cardType !== 'image' }">
    <el-skeleton animated>
      <template #template>
        <!-- 图片卡片 (cardType === 'image') -->
        <div v-if="cardType === 'image'" class="media-container-skeleton" :style="{ minHeight: estimatedMediaHeight + 'px' }">
          <el-skeleton-item variant="image" class="image-skeleton" />
        </div>

        <div class="content-container">
          <!-- 标题 (所有类型都有标题) -->
          <el-skeleton-item variant="h3" style="width: 80%; margin-bottom: 8px;" />

          <!-- 文字内容 (在 text 和 image 类型才展示长文字) -->
          <template v-if="cardType === 'text' || cardType === 'image'">
            <el-skeleton-item variant="text" style="width: 100%; margin-bottom: 4px;" />
            <el-skeleton-item variant="text" style="width: 90%; margin-bottom: 4px;" />
            <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 12px;" />
          </template>

          <!-- 短文字/纯标题类型 (标题下面可能只跟很短的一句摘要) -->
          <template v-if="cardType === 'title-only'">
            <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 12px;" />
          </template>

          <!-- 日期 Meta -->
          <div class="meta-skeleton">
            <el-skeleton-item variant="text" style="width: 30%; height: 12px;" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  // 仅在瀑布流计算中作为占位高度模拟，可以随机一个合理的高度避免排版太空
  seed?: number
}>()

// 决定卡片的类型：image (带图), text (纯文本), title-only (短标题)
const cardType = computed(() => {
  const s = props.seed !== undefined ? props.seed : Math.floor(Math.random() * 10);
  const typeMod = s % 5;
  // 大约 60% 概率是带图卡片，20% 纯文本，20% 仅标题
  if (typeMod < 3) return 'image';
  if (typeMod === 3) return 'text';
  return 'title-only';
})

const estimatedMediaHeight = computed(() => {
  if (cardType.value !== 'image') return 0;
  // 随机高度模拟不同尺寸的图片 200px - 400px
  const base = props.seed !== undefined ? (props.seed % 3) : Math.floor(Math.random() * 3);
  const heights = [200, 300, 400];
  return heights[base];
})
</script>

<style scoped lang="less">
.daily-card-skeleton {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  break-inside: avoid;
  box-shadow: var(--shadow-sm);
  width: 100%;
  margin-bottom: 20px; /* 在真实的 DailyCard 中 margin-bottom 是 20px 由于瀑布流 */
}

.media-container-skeleton {
  width: 100%;
  background-color: var(--color-surface);

  .image-skeleton {
    width: 100%;
    height: 100%;
    min-height: inherit; /* 跟随父级的随机高度 */
  }
}

.content-container {
  padding: 16px;

  .no-media & {
    padding-top: 18px;
  }
}

.meta-skeleton {
  display: flex;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

/* 覆盖 el-skeleton 的默认发光使其适配暗色主题和网站主题 */
:deep(.el-skeleton) {
  --el-skeleton-color: var(--color-border);
  --el-skeleton-to-color: var(--color-surface);
}
</style>
