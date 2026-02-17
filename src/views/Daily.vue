

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
          :key="post.id"
          :post="post"
          @click="(e: MouseEvent) => openPost(post, e)"
        />
      </div>
    </div>

    <!-- Details Modal Overlay -->
    <transition name="modal-fade">
      <div v-if="activePost" class="modal-overlay" :class="{ 'is-closing': isClosing }" @click.self="closePost">
        <div class="modal-content" :style="modalStyle">
          <button class="close-btn" @click="closePost">
            <el-icon><Close /></el-icon>
          </button>
           <daily-card :post="activePost" :expanded="true" />
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

import { dailyData, type Post } from '@/data/dailyData';

const posts = ref<Post[]>(dailyData);

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

onMounted(() => {
  updateColumnCount();
  window.addEventListener('resize', updateColumnCount);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount);
});

// Distribute posts into columns using height-balancing algorithm
const columns = computed(() => {
  const cols: Post[][] = Array.from({ length: columnCount.value }, () => []);
  const colHeights = new Array(columnCount.value).fill(0);

  const getPostEstimatedHeight = (post: Post): number => {
    let height = 120; // Base height (Title + Meta + Padding + Margins)
    const width = 300; // Assumed card width

    // Media Card
    if (post.image || post.video || (post.images && post.images.length)) {
      // Try to parse dimensions from mock URL for better precision
      // Format: .../600x400/...
      const imgUrl = post.image || (post.images ? post.images[0] : '');
      const match = imgUrl ? imgUrl.match(/(\d+)x(\d+)/) : null;
      if (match) {
        const w = parseInt(match[1]);
        const h = parseInt(match[2]);
        // aspect ratio = h / w
        height += (h / w) * width;
      } else {
        height += 300; // Default estimate for media
      }
    }
    // Text-Only Card (limit to 2 lines ~ 50px)
    else if (post.content || post.excerpt) {
      height += 60;
    }
    // Title-Only Card (no extra height)

    return height;
  };

  sortedPosts.value.forEach((post) => {
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

.modal-content {
  background-color: var(--color-surface);
  border-radius: 12px; /* Match card border radius */
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  border: 1px solid var(--color-border);
  overflow: hidden;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
    transform: rotate(90deg);
  }

  :deep(.el-icon) {
    font-size: 20px;
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

@media (max-width: 600px) {
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

  .modal-content {
    width: 100% !important; /* Override JS width */
    height: 100% !important; /* Full screen on mobile */
    border-radius: 0;
    max-width: none;
    max-height: none;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
  }

  .close-btn {
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.3); /* Stronger contrast */
  }
}
</style>

