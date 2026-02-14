

<template>
  <div class="daily-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('daily.title') }} <span class="highlight">{{ t('daily.highlight') }}</span></h1>
      <p class="subtitle">{{ t('daily.subtitle') }}</p>
    </div>

    <div class="masonry-grid">
      <daily-card
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @click="(e: MouseEvent) => openPost(post, e)"
      />
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
import { ref, nextTick, computed, type CSSProperties } from 'vue';
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

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  video?: string;
  date: string;
}

const posts = ref<Post[]>([
  {
    id: 1,
    title: 'Weekend Photography',
    excerpt: 'Took my camera to the old town this sunny weekend.',
    content: 'Took my camera to the old town this sunny weekend. The stone paths and weathered walls tell stories of history. I took many photos, capturing the mood of the moment.\n\nAway from the city noise, only bird songs and breeze. Sat in a riverside tea house for an afternoon, watching people go by, time felt slower.',
    image: 'https://placehold.co/600x400/1e1e1e/333.png?text=Photo+1&font=roboto',
    date: '2023-10-21'
  },
  {
    id: 2,
    title: 'Code Refactoring',
    excerpt: 'Refactored the core module, code feels much more elegant now.',
    content: 'Refactored the core module, code feels much more elegant now. Places where logic was messy are now organized. Although it took some time, seeing 30% efficiency boost made it worth it.\n\nCoding is like poetry; structure is rhythm, logic is imagery. Perfect code is a programmer\'s romance.',
    date: '2023-10-20'
  },
  {
    id: 3,
    title: 'Guitar Practice: Sunny Day',
    excerpt: 'Practiced "Sunny Day" for a long time, finally nailed it.',
    content: 'Practiced "Sunny Day" for a long time, finally nailed it. This song by Jay Chou is full of youth memories. The fingerstyle arrangement is challenging, especially the harmonics.\n\nRecorded a video to document it. Not perfect, but satisfied. Music makes you forget worries and focus on the beauty of now.',
    video: 'placeholder',
    date: '2023-10-18'
  },
  {
    id: 4,
    title: 'Reading Note',
    excerpt: 'Read "Hackers & Painters", deeply touched by views on creativity.',
    content: 'Read "Hackers & Painters", deeply touched by views on creativity. Paul Graham thinks hackers and painters are both creators. We all need to create outstanding works through constant trial and correction.\n\nThe book also discusses wealth, design, and taste, giving me new perspectives beyond technology. Highly recommend to every programmer.',
    image: 'https://placehold.co/600x800/1e1e1e/333.png?text=Book&font=roboto',
    date: '2023-10-15'
  },
  {
    id: 5,
    title: 'Delicious Dinner',
    excerpt: 'Tried a new recipe. Presentation average, taste great.',
    content: 'Tried a new recipe - Braised Pork. Although presentation was average and color not bright enough, the taste was great, fatty but not greasy. Cooking is like programming; steps are algorithms, heat is parameters, seasoning is configuration.\n\nWill try Sweet and Sour Ribs next time, hoping for better visuals.',
    image: 'https://placehold.co/600x600/1e1e1e/333.png?text=Food&font=roboto',
    date: '2023-10-12'
  },
  {
    id: 6,
    title: 'Rainy Day Thoughts',
    excerpt: 'Rainy days always calm me down to think.',
    content: 'Rainy days always calm me down to think. Listening to rain outside, mood becomes peaceful. Thinking about future plans or just spacing out is enjoyable.\n\nAir after rain is fresh, smell of earth requires relaxation. Hope tomorrow is a good day.',
    date: '2023-10-10'
  }
]);

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

.masonry-grid {
  column-count: 3;
  column-gap: 20px;

  @media (max-width: 900px) {
    column-count: 2;
  }

  @media (max-width: 600px) {
    column-count: 1;
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
  border-radius: 6px;
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
</style>

