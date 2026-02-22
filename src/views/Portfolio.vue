<template>
  <div class="portfolio-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('portfolio.title') }}</h1>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <span>{{ t('common.loading') }}</span>
      </div>
    </div>

    <!-- 数据为空 -->
    <div v-else-if="collections.length === 0" class="empty-state">
      <span>{{ t('portfolio.empty') }}</span>
    </div>

    <!-- 合集网格 -->
    <transition-group v-else name="list" tag="div" class="portfolio-grid">
      <div
        v-for="item in collections"
        :key="item._id"
        class="portfolio-item"
      >
        <div class="image-wrapper">
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            :alt="item.name"
            loading="lazy"
          />
          <div v-else class="placeholder-cover">
            <span>{{ item.name.charAt(0) }}</span>
          </div>
          <!-- 置顶标识 -->
          <div v-if="item.pinned" class="pinned-indicator">
            {{ t('portfolio.pinned') }}
          </div>
          <div class="overlay">
            <h3 class="item-title">{{ item.name }}</h3>
            <div class="item-meta">
              <span class="post-count">{{ item.postCount }} {{ t('portfolio.posts') }}</span>
            </div>
            <span class="view-btn">{{ t('portfolio.viewBtn') }}</span>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { fetchCollectionsFromCloud, type CollectionDisplay } from '@/data/portfolioData';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('nav.portfolio')} | ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: 'Check out my portfolio of web development projects, creative coding experiments, and design works.'
    }
  ]
})

const collections = ref<CollectionDisplay[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    collections.value = await fetchCollectionsFromCloud();
  } catch (error) {
    console.error('Failed to load portfolio collections:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped lang="less">
.portfolio-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
}

.page-title {
  font-size: 2.5rem;
  color: var(--color-text-primary);
  font-weight: 700;
}

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-text-secondary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.portfolio-item {
  .image-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    background-color: var(--color-surface);
    aspect-ratio: 16 / 10;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
      opacity: 0.8;
    }

    .placeholder-cover {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary, #6366f1));
      font-size: 4rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.8);
      transition: transform 0.5s ease;
    }

    .overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      gap: 12px;
      backdrop-filter: blur(2px);
    }

    &:hover {
      border-color: var(--color-accent-primary);

      img,
      .placeholder-cover {
        transform: scale(1.1);
        opacity: 0.4;
      }

      .overlay {
        opacity: 1;
      }
    }
  }
}

.item-title {
  font-size: 1.6rem;
  color: #fff;
  font-weight: 700;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  transform: translateY(20px);
  transition: transform 0.3s ease 0.05s;
}

.pinned-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  height: 24px;
  background-color: var(--color-accent-primary);
  border-radius: 12px;
  padding: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 0.8rem;
  font-weight: bold;
}

.portfolio-item:hover .item-title,
.portfolio-item:hover .item-meta {
  transform: translateY(0);
}

.view-btn {
  padding: 8px 20px;
  border: 1px solid var(--color-accent-primary);
  color: var(--color-accent-primary);
  border-radius: 12px;
  font-size: 0.9rem;
  background-color: rgba(0, 0, 0, 0.5);
  transform: translateY(20px);
  transition: all 0.3s ease 0.1s;

  &:hover {
    background-color: var(--color-accent-primary);
    color: #fff;
  }
}

.portfolio-item:hover .view-btn {
  transform: translateY(0);
}

/* List transition */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
