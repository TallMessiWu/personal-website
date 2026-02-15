

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

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  images?: string[]; // Support for multiple images
  video?: string;
  date: string;
  pinned?: boolean;
}

const posts = ref<Post[]>([
  {
    id: 101, // Pinned item 1
    title: '我的 2023 年度总结',
    excerpt: '这一年，经历了许多挑战与成长，是时候停下来回顾一下了。',
    content: '这一年，经历了许多挑战与成长，是时候停下来回顾一下了。从技术的精进到生活的感悟，每一个瞬间都值得铭记。\n\n感谢所有遇到的朋友，感谢努力的自己。期待 2024 会更好！',
    image: 'https://placehold.co/600x400/1e1e1e/333.png?text=2023+Summary&font=roboto',
    date: '2023-12-31',
    pinned: true
  },
  {
    id: 3,
    title: '吉他练习：晴天',
    excerpt: '练习《晴天》很久了，终于录了一个满意的版本。',
    content: '练习《晴天》很久了，终于录了一个满意的版本。周杰伦的这首歌充满了青春的回忆。指弹的编配很有挑战性，特别是泛音部分。\n\n录了个视频记录一下。虽然不完美，但是很满足。音乐让人忘却烦恼，专注于当下的美好。',
    video: 'placeholder',
    // Video with custom cover
    image: 'https://placehold.co/600x400/5e3a2a/fff.png?text=Guitar+Cover&font=roboto',
    date: '2023-10-18',
    pinned: true
  },
  {
    id: 1,
    title: '周末摄影扫街',
    excerpt: '趁着周末阳光正好，带着相机去了老城区。',
    content: '趁着周末阳光正好，带着相机去了老城区。石板路和斑驳的墙壁诉说着历史的故事。拍了很多照片，记录下这一刻的心情。\n\n远离城市的喧嚣，只有鸟鸣和微风。在河边的茶馆坐了一个下午，看着人来人往，时间仿佛变慢了。',
    // Multiple images example
    images: [
      'https://placehold.co/600x400/1e1e1e/333.png?text=Photo+1&font=roboto',
      'https://placehold.co/600x400/2a2a2a/444.png?text=Photo+2&font=roboto',
      'https://placehold.co/600x400/333333/555.png?text=Photo+3&font=roboto',
      'https://placehold.co/600x800/444444/666.png?text=Vertical+Photo&font=roboto'
    ],
    image: 'https://placehold.co/600x400/1e1e1e/333.png?text=Photo+1&font=roboto', // Fallback/Main cover
    date: '2023-10-21'
  },
  {
    id: 2,
    title: '代码重构心得',
    excerpt: '重构了核心模块，代码现在感觉优雅多了。',
    content: '重构了核心模块，代码现在感觉优雅多了。之前逻辑混乱的地方，现在井井有条。虽然花了不少时间，但看到效率提升 30%，一切都值了。\n\n写代码就像写诗，结构是韵律，逻辑是意境。完美的代码是程序员的浪漫。',
    date: '2023-10-20'
  },
  {
    id: 4,
    title: '读书笔记：《黑客与画家》',
    excerpt: '读了《黑客与画家》，对创造力的观点感触很深。',
    content: '读了《黑客与画家》，对创造力的观点感触很深。保罗·格雷厄姆认为黑客和画家都是创作者。我们都需要通过不断的尝试和修正，来在这个世界上创造优秀的作品。\n\n书中还谈到了财富、设计和品味，给了我很多技术之外的视角。强烈推荐给每一位程序员。',
    image: 'https://placehold.co/600x800/1e1e1e/333.png?text=Book&font=roboto',
    date: '2023-10-15'
  },
  {
    id: 5,
    title: '美味的晚餐尝试',
    excerpt: '尝试了一个新菜谱。卖相一般，味道超赞。',
    content: '尝试了一个新菜谱——红烧肉。虽然卖相一般，颜色不够红亮，但味道超赞，肥而不腻。做饭就像编程，步骤是算法，火候是参数，调料是配置。\n\n下次试试糖醋排骨，争取视觉效果也能跟上。',
    image: 'https://placehold.co/600x600/1e1e1e/333.png?text=Food&font=roboto',
    date: '2023-10-12'
  },
  {
    id: 6,
    title: '雨天随想',
    excerpt: '下雨天总是能让人静下来思考。',
    content: '下雨天总是能让人静下来思考。听着窗外的雨声，心情变得平和。思考一下未来的规划，或者单纯的发发呆，都是一种享受。\n\n雨后的空气很清新，泥土的味道让人放松。希望明天是个好天气。',
    date: '2023-10-10'
  },
  {
    id: 7,
    title: '一个短暂的想法',
    excerpt: '',
    content: '',
    date: '2023-10-08'
  },
  {
    id: 8,
    title: '极简生活',
    excerpt: '',
    date: '2023-10-05'
  },
  {
    id: 9,
    title: '新入手的机械键盘',
    excerpt: '红轴的手感果然不一样，打字停不下来。',
    content: '终于拔草了这款种草很久的机械键盘。红轴的手感轻盈，声音不大，很适合在办公室使用。换了套复古配色的键帽，颜值爆表。\n\n工欲善其事，必先利其器。好的工具确实能提升幸福感。',
    image: 'https://placehold.co/600x400/333333/eee.png?text=Keyboard&font=roboto',
    date: '2023-10-01'
  },
  {
    id: 10,
    title: '秋天的第一杯咖啡',
    excerpt: '拿铁的温度刚刚好，温暖了这个午后。',
    image: 'https://placehold.co/500x700/6f4e37/fff.png?text=Coffee&font=roboto',
    date: '2023-09-28'
  }
]);

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
  } else {
    columnCount.value = 2; // Mobile and Tablet both use 2 columns per request
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
</style>

