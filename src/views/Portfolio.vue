<template>
  <div class="portfolio-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('portfolio.title') }}</h1>
    </div>

    <!-- 刷新时的 Loading Bar (撑开式) -->
    <transition name="expand">
      <div v-if="isRefreshing" class="refresh-load-bar">
        <div class="refresh-spinner"></div>
      </div>
    </transition>

    <!-- 加载中（防抖：仅在加载超过 200ms 时才显示） -->
    <div v-if="showSkeleton" class="portfolio-grid">
      <portfolio-card-skeleton v-for="n in 6" :key="'pskel-'+n" />
    </div>

    <!-- 数据为空（需确认加载已结束） -->
    <div v-else-if="!isLoading && collections.length === 0" class="end-message">
      <span>·</span>
    </div>

    <!-- 合集网格 -->
    <transition-group v-else name="list" tag="div" class="portfolio-grid">
      <div
        v-for="item in collections"
        :key="item._id"
        class="portfolio-item"
        @click.stop="handleCardClick(item, $event)"
      >
        <div class="image-wrapper" :class="{ 'is-active': activeCardId === item._id }">
          <el-skeleton animated class="cover-skeleton">
            <template #template>
              <el-skeleton-item variant="image" style="width:100%;height:100%;" />
              <div class="cover-skeleton-overlay">
                <el-skeleton-item variant="h1" style="width:50%;height:28px;" />
                <el-skeleton-item variant="text" style="width:30%;height:14px;" />
                <el-skeleton-item variant="button" style="width:90px;height:34px;border-radius:10px;" />
              </div>
            </template>
          </el-skeleton>
          <img
            v-if="item.thumbnail && !hasCollectionCoverFailed(item)"
            :src="item.thumbnail"
            :alt="item.name"
            :class="{ 'is-loaded': isCollectionCoverLoaded(item) }"
            loading="lazy"
            @load="markCollectionCoverLoaded(item)"
            @error="markCollectionCoverFailed(item)"
          />
          <!-- 置顶标识 -->
          <div v-if="item.pinned" class="pinned-indicator">
            {{ t('portfolio.pinned') }}
          </div>
          <div class="overlay">
            <h3 class="item-title">{{ item.name }}</h3>
            <div class="item-meta">
              <span class="post-count">{{ item.postCount }} {{ t('portfolio.posts') }}</span>
              <span v-if="item.latestPostDate" class="latest-date">{{ t('portfolio.latestDate') }} {{ item.latestPostDate.split(' ')[0] }}</span>
            </div>
            <span class="view-btn" @click.stop="openCollection(item, $event)">{{ t('portfolio.viewBtn') }}</span>
          </div>
        </div>
      </div>
    </transition-group>

    <!-- 分页结束标识 -->
    <div v-if="!isLoading && collections.length > 0" class="end-message">
      <span>·</span>
    </div>

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
                <p v-if="activeCollection.description" class="collection-desc">{{ activeCollection.description }}</p>
                <p class="collection-info">{{ activeCollection.postCount }} {{ t('portfolio.posts') }}</p>
              </div>

              <!-- Posts Masonry -->
              <div class="masonry-container" ref="masonryRef" v-show="!isPostsLoading && columns.length > 0">
                <div class="masonry-column" v-for="(column, index) in columns" :key="index">
                  <daily-card
                    v-for="post in column"
                    :key="post._id"
                    :post="post"
                    :data-post-id="post._id"
                    @click="(e: MouseEvent) => openPost(post, e)"
                  />
                </div>
              </div>

              <!-- Posts End Message -->
              <div v-if="!isPostsLoading && collectionPosts.length > 0" class="end-message in-details">
                <span>·</span>
              </div>

              <!-- Posts Skeleton Loading（防抖：仅在加载超过 200ms 时才显示） -->
              <div class="masonry-container" v-if="showPostsSkeleton">
                <div class="masonry-column" v-for="colIndex in columnCount" :key="'skel-col-'+colIndex">
                  <daily-card-skeleton v-for="itemIndex in 2" :key="'skel-item-'+colIndex+'-'+itemIndex" :seed="itemIndex * colIndex" />
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch, type CSSProperties } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { Close } from '@element-plus/icons-vue';
import { useBackClose } from '@/composables/useBackClose';
import DailyCard from '@/components/DailyCard.vue';
import DailyCardSkeleton from '@/components/DailyCardSkeleton.vue';
import PortfolioCardSkeleton from '@/components/PortfolioCardSkeleton.vue';
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
const isRefreshing = ref(false);
const showSkeleton = ref(false);
let skeletonTimer: ReturnType<typeof setTimeout> | null = null;

// Modal State
const activeCollection = ref<CollectionDisplay | null>(null);
const collectionPosts = ref<Post[]>([]);
const isPostsLoading = ref(false);
const showPostsSkeleton = ref(false);
let postsSkeletonTimer: ReturnType<typeof setTimeout> | null = null;
const modalStyle = ref<CSSProperties>({});
const originRect = ref<DOMRect | null>(null);
const isClosing = ref(false);

// 移动端返回按钮拦截
const collectionBack = useBackClose(() => closeCollection());

// Active card for mobile (simulates hover)
const activeCardId = ref<string | null>(null);
const loadedCoverKeys = ref<Set<string>>(new Set());
const failedCoverKeys = ref<Set<string>>(new Set());

const getCoverKey = (collection: CollectionDisplay) => `${collection._id}:${collection.thumbnail || ''}`;

const isCollectionCoverLoaded = (collection: CollectionDisplay) => {
  return loadedCoverKeys.value.has(getCoverKey(collection));
};

const hasCollectionCoverFailed = (collection: CollectionDisplay) => {
  return failedCoverKeys.value.has(getCoverKey(collection));
};

const markCollectionCoverLoaded = (collection: CollectionDisplay) => {
  const key = getCoverKey(collection);
  const loaded = new Set(loadedCoverKeys.value);
  const failed = new Set(failedCoverKeys.value);
  loaded.add(key);
  failed.delete(key);
  loadedCoverKeys.value = loaded;
  failedCoverKeys.value = failed;
};

const markCollectionCoverFailed = (collection: CollectionDisplay) => {
  const key = getCoverKey(collection);
  const loaded = new Set(loadedCoverKeys.value);
  const failed = new Set(failedCoverKeys.value);
  loaded.delete(key);
  failed.add(key);
  loadedCoverKeys.value = loaded;
  failedCoverKeys.value = failed;
};

// Masonry Logic — 基于真实 DOM 高度的两阶段瀑布流
const columnCount = ref(3);
const columns = ref<Post[][]>([]);
const masonryRef = ref<HTMLElement | null>(null);
const cardHeights = new Map<string, number>();
let imgLoadTimer: ReturnType<typeof setTimeout> | null = null;

const updateColumnCount = () => {
  const width = window.innerWidth;
  if (width > 1000) {
    columnCount.value = 3;
  } else if (width > 767) {
    columnCount.value = 2;
  } else {
    columnCount.value = 1;
  }
};

const sortedCollectionPosts = computed(() => {
  return [...collectionPosts.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

// 估算高度（仅在无真实高度时作为 fallback）
const getEstimatedHeight = (post: Post): number => {
  let h = 120;
  if (post.images && post.images.length > 0) h += 200;
  else if (post.content) h += 68;
  return h;
};

// 按最短列优先将帖子分配到各列
const distributeCards = () => {
  const cols: Post[][] = Array.from({ length: columnCount.value }, () => []);
  const colHeights = new Array(columnCount.value).fill(0);

  sortedCollectionPosts.value.forEach((post) => {
    const height = cardHeights.get(post._id) ?? getEstimatedHeight(post);
    let minIdx = 0;
    for (let i = 1; i < columnCount.value; i++) {
      if (colHeights[i] < colHeights[minIdx]) minIdx = i;
    }
    cols[minIdx].push(post);
    colHeights[minIdx] += height;
  });

  columns.value = cols;
};

// 测量所有卡片的真实 DOM 高度
const measureCardHeights = () => {
  if (!masonryRef.value) return false;
  let changed = false;
  const cards = masonryRef.value.querySelectorAll<HTMLElement>('.daily-card[data-post-id]');
  cards.forEach((el) => {
    const id = el.dataset.postId;
    if (!id) return;
    const h = el.offsetHeight;
    if (cardHeights.get(id) !== h) {
      cardHeights.set(id, h);
      changed = true;
    }
  });
  return changed;
};

// 数据或列数变化 → 分配 → 测量 → 重新分配
watch([sortedCollectionPosts, columnCount], () => {
  distributeCards();
  nextTick(() => {
    if (measureCardHeights()) {
      distributeCards();
    }
  });
});

// 图片加载完成后重新测量（防抖 100ms）
const onImageLoad = () => {
  if (imgLoadTimer) clearTimeout(imgLoadTimer);
  imgLoadTimer = setTimeout(() => {
    if (measureCardHeights()) {
      distributeCards();
    }
  }, 100);
};

const handleCardClick = (collection: CollectionDisplay, event: MouseEvent) => {
  const isMobile = window.innerWidth <= 767;
  if (isMobile) {
    if (activeCardId.value === collection._id) {
      activeCardId.value = null;
    } else {
      activeCardId.value = collection._id;
    }
  } else {
    openCollection(collection, event);
  }
};

// 对没有封面的合集，异步补加载第一张卡片的图片作为封面。
// SDK 冷启动时 getTempFileURL 可能返回空（cloud:// 未解析），需重试等待 SDK 就绪。
const loadFallbackCovers = async () => {
  const targets = collections.value.filter(c => !c.thumbnail);
  if (!targets.length) return;

  const findValidUrl = (posts: import('@/data/dailyData').Post[]): string => {
    for (const post of posts) {
      for (const img of post.images ?? []) {
        const url = img.thumbnail || img.image;
        // cloud:// 表示 getTempFileURL 未能解析，跳过
        if (url && !url.startsWith('cloud://')) return url;
      }
    }
    return '';
  };

  await Promise.all(targets.map(async (col) => {
    // 最多重试 3 次，每次间隔 1.5s，等待 SDK 冷启动完成
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1500));
      try {
        const posts = await fetchPostsByCollectionId(col._id);
        const url = findValidUrl(posts);
        if (url) {
          const idx = collections.value.findIndex(c => c._id === col._id);
          if (idx !== -1 && !collections.value[idx].thumbnail) {
            collections.value[idx] = { ...collections.value[idx], thumbnail: url };
          }
          return;
        }
        // 合集本身就没有帖子，不再重试
        if (posts.length === 0 && col.postCount === 0) return;
        // 有帖子但 URL 都是 cloud://（未解析），继续重试
      } catch { /* 继续重试 */ }
    }
  }));
};

const openCollection = async (collection: CollectionDisplay, event: MouseEvent) => {
  if (isClosing.value) return;

  // Reset active card when opening modal
  activeCardId.value = null;

  const target = (event.currentTarget as HTMLElement).closest('.portfolio-item') as HTMLElement;
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
  collectionBack.activate();
  isPostsLoading.value = true;

  // 防抖：200ms 后才显示详情骨架屏
  postsSkeletonTimer = setTimeout(() => {
    if (isPostsLoading.value) showPostsSkeleton.value = true;
  }, 200);

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

  // Fetch posts for this collection
  try {
    collectionPosts.value = await fetchPostsByCollectionId(collection._id);
  } finally {
    if (postsSkeletonTimer) clearTimeout(postsSkeletonTimer);
    showPostsSkeleton.value = false;
    isPostsLoading.value = false;
  }
};

const closeCollection = () => {
  if (isClosing.value) return;
  collectionBack.deactivate();
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

const postBack = useBackClose(() => closePost());

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
  postBack.activate();

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
  postBack.deactivate();
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

// 刷新页面数据
const handleRefresh = async () => {
  if (isRefreshing.value || isLoading.value) return;

  // 1. 如果有打开的 modal，立即关闭它们（不带动画以立即响应刷新状态）
  if (activePost.value) {
    activePost.value = null;
    postOriginRect.value = null;
    isPostClosing.value = false;
  }

  if (activeCollection.value) {
    activeCollection.value = null;
    collectionPosts.value = [];
    originRect.value = null;
    isClosing.value = false;
  }

  isRefreshing.value = true;
  const startTime = Date.now();

  try {
    collections.value = await fetchCollectionsFromCloud();
    void loadFallbackCovers();

    const elapsed = Date.now() - startTime;
    if (elapsed < 600) {
      await new Promise(resolve => setTimeout(resolve, 600 - elapsed));
    }
  } catch (error) {
    console.error('Failed to refresh portfolio:', error);
  } finally {
    isRefreshing.value = false;
  }
};

const onRefreshEvent = (e: Event) => {
  const customEvent = e as CustomEvent;
  if (customEvent.detail === '/portfolio') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleRefresh();
  }
};

const handleGlobalClick = () => {
  activeCardId.value = null;
};

onMounted(async () => {
  updateColumnCount();
  window.addEventListener('resize', updateColumnCount);
  window.addEventListener('click', handleGlobalClick);
  // 监听 masonry 容器内图片加载事件（capture 模式捕获子元素 load）
  masonryRef.value?.addEventListener('load', onImageLoad, true);

  // 防抖：200ms 后才显示骨架屏，避免快速加载时的闪烁
  skeletonTimer = setTimeout(() => {
    if (isLoading.value) showSkeleton.value = true;
  }, 200);

  try {
    collections.value = await fetchCollectionsFromCloud();
    void loadFallbackCovers();
  } catch (error) {
    console.error('Failed to load portfolio collections:', error);
  } finally {
    if (skeletonTimer) clearTimeout(skeletonTimer);
    showSkeleton.value = false;
    isLoading.value = false;
  }

  window.addEventListener('refresh-page', onRefreshEvent);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount);
  window.removeEventListener('click', handleGlobalClick);
  masonryRef.value?.removeEventListener('load', onImageLoad, true);
  if (imgLoadTimer) clearTimeout(imgLoadTimer);
  if (skeletonTimer) clearTimeout(skeletonTimer);
  if (postsSkeletonTimer) clearTimeout(postsSkeletonTimer);
  window.removeEventListener('refresh-page', onRefreshEvent);
});
</script>

<style scoped lang="less">
.portfolio-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 767px) {
    padding-bottom: 20px;
  }

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

.end-message {
  opacity: 0.5;
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 200px;
  margin: 40px auto 0;
  gap: 15px;
  color: var(--color-text-secondary);
  font-weight: bold;

  @media (max-width: 767px) {
    margin-top: 20px;
  }

  &.in-details {
    flex-shrink: 0;
    margin: 10px auto 0;

    @media (max-width: 767px) {
      margin-top: 0;
    }
  }

  &::before,
  &::after {
    content: "——";
    flex: 1;
    height: 1px;
    background-color: transparent;
    opacity: 0.5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
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
    isolation: isolate;

    img {
      position: absolute;
      inset: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition:
        opacity 0.45s ease,
        transform 0.5s ease;
      opacity: 0;

      &.is-loaded {
        opacity: 1;
      }
    }

    .cover-skeleton {
      position: absolute;
      inset: 0;
      z-index: 0;

      :deep(.el-skeleton) {
        --el-skeleton-color: var(--color-border);
        --el-skeleton-to-color: var(--color-surface);
        height: 100%;
      }

      .cover-skeleton-overlay {
        position: absolute;
        inset: 0;
        background-color: var(--color-surface);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
    }

    .overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 3;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      gap: 12px;
      backdrop-filter: blur(2px);
    }

    /* Hover effect for desktop, active class for mobile */
    @media (hover: hover) {
      &:hover {
        border-color: var(--color-accent-primary);

        img.is-loaded {
          transform: scale(1.1);
          opacity: 0.6;
        }

        .overlay {
          opacity: 1;
          pointer-events: auto;

          .item-title,
          .item-meta,
          .view-btn {
            transform: translateY(0);
          }
        }
      }
    }

    &.is-active {
      border-color: var(--color-accent-primary);

      img.is-loaded {
        transform: scale(1.1);
        opacity: 0.6;
      }

      .overlay {
        opacity: 1;
        pointer-events: auto;

        .item-title,
        .item-meta,
        .view-btn {
          transform: translateY(0);
        }
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
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  transform: translateY(20px);
  transition: transform 0.3s ease 0.05s;
  margin-bottom: 0.66rem;

  .latest-date {
    font-size: 0.8rem;
    opacity: 0.8;
  }
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

    @media (max-width: 767px) {
      padding: 0px 20px 20px; /* 增加底部间距确保 end-message 不被遮挡 */
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

  .collection-desc {
    font-size: 1rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 10px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .collection-info {
    color: var(--color-text-secondary);
    font-size: 1rem;
  }

  @media (max-width: 767px) {
    padding-left: 56px; /* 进一步避开下移后的关闭按钮 */
  }
}

.masonry-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  min-height: 200px;
  width: 100%;
  flex-shrink: 0; /* 防止在 flex 容器中高度塌陷 */

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

/* Removed modal-loading as we now use skeleton masonry */
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

  @media (max-width: 767px) {
    left: 15px;
    top: 25px;
    background: rgba(0,0,0,0.5);
    border: none;
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 767px) {
  .masonry-container {
    flex-direction: column;
    align-items: stretch;
  }

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

.refresh-load-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  overflow: hidden;
  margin-bottom: 40px;
  position: relative;
  width: 100%;
}

.refresh-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-accent-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* 撑开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
  margin-bottom: 0;
}
</style>
