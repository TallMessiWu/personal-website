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
        @click="(e) => openCollection(item, e)"
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

    <!-- Collection Details Modal -->
    <transition name="modal-fade">
      <div v-if="activeCollection" class="modal-overlay" :class="{ 'is-closing': isClosing }" @click.self="closeCollection">
        <div class="modal-wrapper" :style="modalStyle">
          <button class="close-btn" @click="closeCollection">
            <el-icon><Close /></el-icon>
          </button>
          <div class="modal-content">
            <div class="collection-details">
              <div class="collection-header">
                <h2 class="collection-name">{{ activeCollection.name }}</h2>
                <p class="collection-info">{{ activeCollection.postCount }} {{ t('portfolio.posts') }}</p>
              </div>

              <!-- Posts Masonry -->
              <div class="masonry-container">
                <div class="masonry-column" v-for="(column, index) in columns" :key="index">
                  <daily-card
                    v-for="post in column"
                    :key="post._id"
                    :post="post"
                    @click="(e: MouseEvent) => openPost(post, e)"
                  />
                </div>
              </div>

              <div v-if="isPostsLoading" class="modal-loading">
                <div class="loading-spinner">
                  <span>{{ t('common.loading') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Post Details Modal (Stacked on top) -->
    <transition name="modal-fade">
      <div v-if="activePost" class="post-modal-overlay" :class="{ 'is-closing': isPostClosing }" @click.self="closePost">
        <div class="modal-wrapper" :style="postModalStyle">
          <button class="close-btn" @click="closePost">
            <el-icon><Close /></el-icon>
          </button>
          <div class="modal-content">
             <daily-card :post="activePost" :expanded="true" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type CSSProperties } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { Close } from '@element-plus/icons-vue';
import DailyCard from '@/components/DailyCard.vue';
import { fetchCollectionsFromCloud, fetchPostsByCollectionId, type CollectionDisplay } from '@/data/portfolioData';
import type { Post } from '@/data/dailyData';

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

// Modal State
const activeCollection = ref<CollectionDisplay | null>(null);
const collectionPosts = ref<Post[]>([]);
const isPostsLoading = ref(false);
const modalStyle = ref<CSSProperties>({});
const originRect = ref<DOMRect | null>(null);
const isClosing = ref(false);

// Masonry Logic for Modal
const columnCount = ref(3);
const updateColumnCount = () => {
  const width = window.innerWidth;
  if (width > 1000) {
    columnCount.value = 3;
  } else if (width > 600) {
    columnCount.value = 2;
  } else {
    columnCount.value = 1;
  }
};

const sortedCollectionPosts = computed(() => {
  return [...collectionPosts.value].sort((a, b) => {
    // 仅按时间倒序排列（合集内不处理置顶）
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

const columns = computed(() => {
  const cols: Post[][] = Array.from({ length: columnCount.value }, () => []);
  const colHeights = new Array(columnCount.value).fill(0);

  const getPostEstimatedHeight = (post: Post): number => {
    let height = 120; // 基础高度 (标题 + 元信息 + 内边距 + 外边距)
    const width = 300; // 假定卡片宽度

    // 媒体卡片
    if (post.images && post.images.length > 0) {
      const imgUrl = post.images[0].image;
      const match = imgUrl ? imgUrl.match(/(\d+)x(\d+)/) : null;
      if (match) {
        const w = parseInt(match[1]);
        const h = parseInt(match[2]);
        height += (h / w) * width;
      } else {
        height += 300; // 媒体默认高度估算
      }
    }
    // 仅文字卡片
    else if (post.content) {
      height += 68;
    }
    return height;
  };

  sortedCollectionPosts.value.forEach((post) => {
    // 寻找最短列
    let minHeight = colHeights[0];
    let minIndex = 0;
    for (let i = 1; i < columnCount.value; i++) {
      if (colHeights[i] < minHeight) {
        minHeight = colHeights[i];
        minIndex = i;
      }
    }
    // 加入最短列
    cols[minIndex].push(post);
    colHeights[minIndex] += getPostEstimatedHeight(post);
  });

  return cols;
});

const openCollection = async (collection: CollectionDisplay, event: MouseEvent) => {
  if (isClosing.value) return;

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  originRect.value = rect;

  modalStyle.value = {
    position: 'absolute',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transition: 'none',
    transformOrigin: 'center center',
    zIndex: 2001
  };

  activeCollection.value = collection;
  isPostsLoading.value = true;

  // Fetch posts for this collection
  try {
    collectionPosts.value = await fetchPostsByCollectionId(collection._id);
  } finally {
    isPostsLoading.value = false;
  }

  nextTick(() => {
    void document.body.offsetHeight;
    modalStyle.value = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 'min(95vw, 1200px)',
      height: 'min(95vh, 900px)',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      zIndex: 2001
    };
  });
};

const closeCollection = () => {
  if (isClosing.value) return;
  if (!originRect.value) {
    activeCollection.value = null;
    return;
  }

  isClosing.value = true;
  modalStyle.value = {
     position: 'absolute',
     top: `${originRect.value.top}px`,
     left: `${originRect.value.left}px`,
     width: `${originRect.value.width}px`,
     height: `${originRect.value.height}px`,
     transform: 'none',
     transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
     zIndex: 2001,
     overflow: 'hidden'
  };

  setTimeout(() => {
    activeCollection.value = null;
    collectionPosts.value = [];
    originRect.value = null;
    isClosing.value = false;
  }, 400);
};

// Post Detail Modal Logic (Stacked)
const activePost = ref<Post | null>(null);
const postModalStyle = ref<CSSProperties>({});
const postOriginRect = ref<DOMRect | null>(null);
const isPostClosing = ref(false);

const openPost = (post: Post, event: MouseEvent) => {
  if (isPostClosing.value) return;
  event.stopPropagation();

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  postOriginRect.value = rect;

  postModalStyle.value = {
    position: 'absolute',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transition: 'none',
    transformOrigin: 'center center',
    zIndex: 3001
  };

  activePost.value = post;

  nextTick(() => {
    void document.body.offsetHeight;
    postModalStyle.value = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 'min(90vw, 800px)',
      height: 'min(90vh, 800px)',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      zIndex: 3001
    };
  });
};

const closePost = () => {
  if (isPostClosing.value) return;
  if (!postOriginRect.value) {
    activePost.value = null;
    return;
  }

  isPostClosing.value = true;
  postModalStyle.value = {
     position: 'absolute',
     top: `${postOriginRect.value.top}px`,
     left: `${postOriginRect.value.left}px`,
     width: `${postOriginRect.value.width}px`,
     height: `${postOriginRect.value.height}px`,
     transform: 'none',
     transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
     zIndex: 3001,
     overflow: 'hidden'
  };

  setTimeout(() => {
    activePost.value = null;
    postOriginRect.value = null;
    isPostClosing.value = false;
  }, 400);
};

onMounted(async () => {
  updateColumnCount();
  window.addEventListener('resize', updateColumnCount);
  try {
    collections.value = await fetchCollectionsFromCloud();
  } catch (error) {
    console.error('Failed to load portfolio collections:', error);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount);
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
      opacity: 1; /* 取消默认透明度，防止颜色泛白 */
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
        opacity: 0.6; /* 稍微降低透明度，配合 dark overlay 提升文字可读性 */
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

/* Modal Styles (Shared/Inspired by Daily.vue) */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex; justify-content: center; align-items: center;
  transition: all 0.4s ease;

  &.is-closing {
    background-color: transparent;
  }
}

.post-modal-overlay {
  .modal-overlay();
  z-index: 3000; /* Higher than collection modal */
}

.modal-wrapper {
  position: relative;
}

.modal-content {
  background-color: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  border: 1px solid var(--color-border);
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 105; /* 确保在内部元素之上 */
}

.collection-details {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px;
  overflow-y: auto;

  @media (max-width: 600px) {
    padding: 20px;
  }
}

.collection-header {
  margin-bottom: 30px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;

  .collection-name {
    font-size: 2rem;
    color: var(--color-text-primary);
    margin-bottom: 5px;
  }

  .collection-info {
    color: var(--color-text-secondary);
    font-size: 1rem;
  }

  @media (max-width: 800px) {
    padding-left: 56px; /* 进一步避开下移后的关闭按钮 */
  }
}

.masonry-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  min-height: 200px; /* 确保有最小高度展示加载或内容 */
  width: 100%;

  :deep(.daily-card) {
    width: 100%;
    margin-bottom: 20px;
  }
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.modal-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 110;
}

.close-btn {
  position: absolute;
  top: 20px;
  left: -60px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 200; /* 高于 modal-content 的 105 */
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
    transform: rotate(90deg);
  }

  :deep(.el-icon) {
    font-size: 20px;
    color: #fff;
  }

  @media (max-width: 800px) {
    left: 15px;
    top: 25px;
    background: rgba(0,0,0,0.5);
    border: none;
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 800px) {
  .modal-wrapper {
    width: 100% !important;
    height: 100% !important;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
  }

  .modal-content {
    border-radius: 0;
    border: none;
  }
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
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
