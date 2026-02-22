

<template>
  <div class="daily-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('daily.title') }} <span class="highlight">{{ t('daily.highlight') }}</span></h1>
      <p class="subtitle">{{ t('daily.subtitle') }}</p>
    </div>

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

    <!-- Load More Trigger (Sentinel) -->
    <div ref="loadTrigger" class="load-trigger">
      <div v-if="isLoading || hasMore" class="loading-spinner">
        <span>{{ t('common.loading') }}</span>
      </div>
      <div v-else class="end-message">
        <span>·</span>
      </div>
    </div>

    <!-- Details Modal Overlay -->
    <transition name="modal-fade">
      <div v-if="activePost" class="modal-overlay" :class="{ 'is-closing': isClosing }" @click.self="closePost">
        <div class="modal-wrapper" :style="modalStyle">
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
import { useHead } from '@vueuse/head';
import DailyCard from '@/components/DailyCard.vue';
import { Close } from '@element-plus/icons-vue';
import { ref, onMounted, onUnmounted, nextTick, computed, type CSSProperties } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('nav.daily')} | ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: 'Glimpses into my daily life, thoughts, and random musings.'
    }
  ]
})

import { fetchPostsFromCloud, type Post } from '@/data/dailyData';

const posts = ref<Post[]>([]);
const isLoading = ref(true);

// Lazy Loading State
const page = ref(1);
const pageSize = 12; // Load 12 posts per batch
const loadTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// Sort posts: Pinned first, then by Date descending
const sortedPosts = computed(() => {
  return [...posts.value].sort((a, b) => {
    // 1. Pinned status (pinned comes first)
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // 2. Date descending (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

// Visible posts for lazy loading
const visiblePosts = computed(() => {
  return sortedPosts.value.slice(0, page.value * pageSize);
});

// Check if there are more posts to load
const hasMore = computed(() => {
  return visiblePosts.value.length < sortedPosts.value.length;
});

const loadMore = () => {
  if (hasMore.value) {
    page.value++;
  }
};

// Masonry Logic (JS-based to ensure left-to-right filling order)
const columnCount = ref(3);

const updateColumnCount = () => {
  const width = window.innerWidth;
  if (width > 1000) {
    columnCount.value = 3;
  } else if (width > 600) {
    columnCount.value = 2;
  } else {
    columnCount.value = 1; // Mobile: 1 Column for better readability
  }
};

onMounted(async () => {
  updateColumnCount();
  window.addEventListener('resize', updateColumnCount);

  // Fetch data from CloudBase
  try {
    const cloudPosts = await fetchPostsFromCloud();
    posts.value = cloudPosts;
  } catch (error) {
    console.error('Failed to load daily posts:', error);
  } finally {
    isLoading.value = false;
  }

  // Setup Intersection Observer for Infinite Scroll
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
      loadMore();
    }
  }, {
    rootMargin: '200px', // Trigger loading before reaching the very bottom
    threshold: 0.1
  });

  if (loadTrigger.value) {
    observer.observe(loadTrigger.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount);
  if (observer) {
    observer.disconnect();
  }
});

// Distribute posts into columns using height-balancing algorithm
const columns = computed(() => {
  const cols: Post[][] = Array.from({ length: columnCount.value }, () => []);
  const colHeights = new Array(columnCount.value).fill(0);

  const getPostEstimatedHeight = (post: Post): number => {
    let height = 120; // Base height (Title + Meta + Padding + Margins)

    // Media Card — 统一估算媒体高度，云存储 URL 中无可靠的尺寸信息
    if (post.images && post.images.length > 0) {
      height += 200;
    }
    // Text-Only Card (limit to 2 lines ~ 50px)
    else if (post.content) {
      height += 68; // Increased from 60 to account for 24px top padding
    }
    // Title-Only Card (no extra height)

    return height;
  };

  // Use visiblePosts instead of sortedPosts for infinite scroll
  visiblePosts.value.forEach((post) => {
    // Find shortest column
    let minHeight = colHeights[0];
    let minIndex = 0;

    for (let i = 1; i < columnCount.value; i++) {
      if (colHeights[i] < minHeight) {
        minHeight = colHeights[i];
        minIndex = i;
      }
    }

    // Add post to shortest column
    cols[minIndex].push(post);
    colHeights[minIndex] += getPostEstimatedHeight(post);
  });

  return cols;
});

const activePost = ref<Post | null>(null);
const modalStyle = ref<CSSProperties>({});
const originRect = ref<DOMRect | null>(null);
const isClosing = ref(false);

const openPost = (post: Post, event: MouseEvent) => {
  if (isClosing.value) return;

  // 1. Calculate start position
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  originRect.value = rect;

  // 2. Set initial style to match the card's current position
  modalStyle.value = {
    position: 'absolute',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transition: 'none',
    transformOrigin: 'center center',
    zIndex: 2001 // Ensure above overlay
  };

  activePost.value = post;

  // 3. Next tick, animate to center
  nextTick(() => {
    // Force reflow
    void document.body.offsetHeight;

    modalStyle.value = {
      position: 'absolute', // Fixed visually by overlay context, but calculating center relative to overlay
      top: '50%',
      left: '50%',
      width: 'min(90vw, 800px)',
      height: 'min(90vh, 800px)', // Expand height
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      zIndex: 2001
    };
  });
};

const closePost = () => {
  if (isClosing.value) return;

  if (!originRect.value) {
    activePost.value = null;
    return;
  }

  isClosing.value = true;

  // Animate back to original position
  modalStyle.value = {
     position: 'absolute',
     top: `${originRect.value.top}px`,
     left: `${originRect.value.left}px`,
     width: `${originRect.value.width}px`,
     height: `${originRect.value.height}px`,
     transform: 'none', // Reset transform
     transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
     zIndex: 2001,
     overflow: 'hidden' // Ensure content doesn't spill during shrink
  };

  // Clear after animation
  setTimeout(() => {
    activePost.value = null;
    originRect.value = null;
    isClosing.value = false;
  }, 400); // Match transition duration
};
</script>

<style scoped lang="less">
.daily-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: left;
  margin-bottom: 50px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;

  .page-title {
    font-size: 2.5rem;
    color: var(--color-text-primary);
    margin-bottom: 10px;
    font-weight: 700;

    .highlight {
      color: var(--color-accent-primary);
    }
  }

  .subtitle {
    font-family: var(--font-family-base);
    color: var(--color-text-secondary);
    font-size: 1.1rem;
  }
}

.masonry-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 600px) {
    gap: 10px;
  }
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0; /* Prevent flex overflow issues */

  @media (max-width: 600px) {
    gap: 10px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7); /* Darker overlay */
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.4s ease;

  &.is-closing {
    background-color: transparent;
    backdrop-filter: none;
  }
}

.modal-wrapper {
  position: relative;
  /* Styling that was previously on modal-content for positioning/sizing is now handled via inline style binding on this wrapper */
}

.modal-content {
  background-color: var(--color-surface);
  border-radius: 12px; /* Match card border radius */
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  border: 1px solid var(--color-border);
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 12px; /* Moved further down */
  left: -80px; /* Move outside to the left */
  right: auto; /* Reset right */
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  width: 44px; /* Slightly larger */
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
    transform: rotate(90deg);
    border-color: rgba(255,255,255,0.3);
  }

  :deep(.el-icon) {
    font-size: 24px;
    color: #fff;
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

@media (max-width: 800px) { /* Adjust breakpoint for mobile/tablet */
  .daily-page {
    padding: 20px 16px;
  }

  .page-header {
    margin-bottom: 30px;

    .page-title { font-size: 2rem; }
    .subtitle { font-size: 1rem; }
  }

  .masonry-container {
    flex-direction: column; /* Ensure 1 column stacking naturally even if JS fails, but JS handles it */
  }

  .modal-wrapper {
    width: 100% !important; /* Override JS width */
    height: 100% !important; /* Full screen on mobile */
    max-width: none;
    max-height: none;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
  }

  .modal-content {
    border-radius: 0;
    border: none;
  }

  .close-btn {
    /* On mobile, keep it inside or top-right float over content */
    top: 15px;
    left: 15px; /* Top left inside */
    border: none;
  }
}

.load-trigger {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
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

.end-message {
  opacity: 0.5;
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 200px;
  gap: 15px;
  color: var(--color-text-secondary);
  font-weight: bold;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--color-text-secondary);
    opacity: 0.3;
  }
}
</style>

