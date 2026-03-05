<template>
  <div class="daily-card" :class="{ 'is-expanded': expanded, 'no-media': !hasMedia }" ref="cardRef">
    <!-- Move Live Icon to root for absolute top-left positioning relative to card -->
    <!-- Only show when expanded as requested -->
    <div v-if="(isCurrentLivePhoto || isSingleLivePhoto) && expanded && !isPlayingLive"
         class="live-icon-wrapper">
      <div class="live-icon-badge"
           :class="{ 'is-expanded': liveIconExpanded }"
           @click.stop="toggleLiveIcon">
        <div class="live-icon-symbol">◎</div>
        <span>{{ $t('daily.live') }}</span>
        <el-icon class="live-arrow" :class="{ 'is-rotated': liveIconExpanded }"><ArrowDown /></el-icon>
      </div>

      <transition name="fade-slide">
        <div v-if="liveIconExpanded" class="live-menu" @click.stop="replayLivePhoto">
           <el-icon><RefreshRight /></el-icon>
           <span>{{ $t('daily.replay') }}</span>
        </div>
      </transition>
    </div>

    <!-- Custom Full screen Image/Live Viewer -->
    <teleport to="body">
      <transition name="viewer-fade">
        <div v-if="viewerShow" class="custom-viewer-overlay" @click.self="closeViewer">
          <div class="viewer-content">
            <!-- Close Button -->
            <button class="viewer-close-btn" @click="closeViewer">
              <el-icon><Close /></el-icon>
            </button>

            <!-- Image Counter -->
            <div v-if="post.images && post.images.length > 1" class="viewer-counter">
              {{ viewerIndex + 1 }} / {{ post.images.length }}
            </div>

            <!-- Navigation -->
            <button v-if="viewerIndex > 0" class="viewer-nav prev" @click="prevViewerImage">
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <button v-if="post.images && viewerIndex < post.images.length - 1" class="viewer-nav next" @click="nextViewerImage">
              <el-icon><ArrowRight /></el-icon>
            </button>

            <!-- Media Container Track -->
            <div v-if="post.images" class="viewer-track-wrapper">
               <div class="viewer-media-wrapper"
                    :class="{ 'is-swiping': viewerIsSwiping }"
                    :style="{ transform: `translateX(calc(-${viewerIndex * 100}% + ${viewerSwipeDeltaX}px))` }"
                    @touchstart.passive="onViewerSwipeStart"
                    @touchmove.passive="onViewerSwipeMove"
                    @touchend="onViewerSwipeEnd">

                  <div v-for="(item, index) in post.images" :key="index" class="viewer-slide-item">
                     <template v-if="shouldRenderViewerMedia(index)">
                       <template v-if="item.video">
                         <div class="viewer-live-container">
                           <img :src="item.image" alt="viewer cover" class="viewer-image" draggable="false" />
                           <video v-show="index === viewerIndex && viewerIsPlaying"
                                  ref="viewerVideoRef"
                                  :src="item.video"
                                  :muted="isLiveMuted"
                                  class="viewer-video"
                                  playsinline
                                  @ended="viewerIsPlaying = false"
                           ></video>
                           <div v-if="index === viewerIndex && !viewerIsPlaying" class="live-icon-wrapper in-viewer">
                              <div class="live-icon-badge"
                                   :class="{ 'is-expanded': viewerLiveIconExpanded }"
                                   @click.stop="toggleViewerLiveIcon">
                                <div class="live-icon-symbol">◎</div>
                                <span>{{ $t('daily.live') }}</span>
                                <el-icon class="live-arrow" :class="{ 'is-rotated': viewerLiveIconExpanded }"><ArrowDown /></el-icon>
                              </div>
                              <transition name="fade-slide">
                                <div v-if="viewerLiveIconExpanded" class="live-menu" @click.stop="replayViewerLivePhoto">
                                   <el-icon><RefreshRight /></el-icon>
                                   <span>{{ $t('daily.replay') }}</span>
                                </div>
                              </transition>
                           </div>
                         </div>
                       </template>
                       <template v-else>
                         <img :src="item.image" alt="viewer image" class="viewer-image" draggable="false" />
                       </template>
                     </template>
                     <template v-else>
                       <div class="lazy-placeholder"></div>
                     </template>
                  </div>
               </div>

               <!-- Viewer Audio Control Button -->
               <div v-if="isViewerLivePhoto" class="viewer-audio-btn" @click.stop="toggleLiveMute">
                 <transition name="audio-fade">
                   <img v-if="isLiveMuted" key="mute" :src="muteIcon" alt="audio muted" class="audio-icon" />
                   <img v-else key="unmute" :src="unmuteIcon" alt="audio unmuted" class="audio-icon" />
                 </transition>
               </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <div class="media-container" v-if="(post.images && post.images.length > 0) || post.video">
      <!-- 1. Video Expanded Mode: Bilibili Iframe or Auto-play simulation -->
      <div v-if="post.video && expanded" class="video-player-container">
        <iframe v-if="isBilibili && bilibiliSrc"
                :src="bilibiliSrc"
                scrolling="no"
                border="0"
                frameborder="no"
                framespacing="0"
                allowfullscreen="true"
                class="bilibili-iframe">
        </iframe>
        <div v-else class="video-player-sim">
          <el-icon class="playing-icon"><VideoPlay /></el-icon>
          <span>Playing Video...</span>
        </div>
      </div>

      <!-- 2. Multi-Image Expanded Mode: Slider -->
      <div v-else-if="post.images && post.images.length > 1 && expanded" class="image-slider">
        <!-- Image Slider Track -->
        <div class="slider-track"
             :class="{ 'is-swiping': isSwiping }"
             :style="{ transform: `translateX(calc(-${currentImageIndex * 100}% + ${swipeDeltaX}px))` }"
             @touchstart.passive="onSwipeStart"
             @touchmove.passive="onSwipeMove"
             @touchend="onSwipeEnd"
             @click="handleMediaClick">

          <div v-for="(item, index) in post.images" :key="index" class="slider-item">
             <!-- 懒加载条件：只渲染当前、上一张、下一张 -->
             <template v-if="shouldRenderMedia(index)">
               <template v-if="item.video">
                  <!-- Live Photo Container -->
                  <div class="live-photo-container">
                     <!-- Cover Image -->
                     <img :src="item.thumbnail || item.image" alt="live photo cover" class="slider-image live-cover" draggable="false" />

                     <!-- Video (Only play if current) -->
                     <video v-show="index === currentImageIndex && isPlayingLive"
                            ref="liveVideoRef"
                            :src="item.video"
                            :muted="isLiveMuted"
                            class="slider-image live-video"
                            playsinline
                            @ended="onLiveVideoEnded"
                     ></video>
                  </div>
               </template>
               <template v-else>
                   <!-- Standard Image -->
                   <img :src="item.thumbnail || item.image" alt="post image" class="slider-image" draggable="false" />
               </template>
             </template>
             <!-- 占位符供未加载图片使用，保持轨道宽度结构 -->
             <template v-else>
               <div class="lazy-placeholder"></div>
             </template>
          </div>
        </div>

        <div class="slider-counter">
          {{ currentImageIndex + 1 }} / {{ post.images.length }}
        </div>

        <!-- Slider Audio Control Button -->
        <div v-if="isCurrentLivePhoto" class="slider-audio-btn" @click.stop="toggleLiveMute">
          <transition name="audio-fade">
            <img v-if="isLiveMuted" key="mute" :src="muteIcon" alt="audio muted" class="audio-icon" />
            <img v-else key="unmute" :src="unmuteIcon" alt="audio unmuted" class="audio-icon" />
          </transition>
        </div>

        <div class="slider-nav prev" v-if="currentImageIndex > 0" @click.stop="prevImage" title="Previous">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div class="slider-nav next" v-if="post.images && currentImageIndex < post.images.length - 1" @click.stop="nextImage" title="Next">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- 3. Default / Collapsed Mode OR Single Image Expanded -->
      <div v-else class="media-preview" @click="handleMediaClick">
        <!-- Case 1: Single Live Photo -->
        <template v-if="isSingleLivePhoto">
           <div class="live-photo-container">
              <img :src="singleLivePhotoData.cover" alt="live photo cover" referrerpolicy="no-referrer" class="live-cover" />
              <video v-show="isPlayingLive"
                     ref="liveVideoRef"
                     :src="singleLivePhotoData.video"
                     :muted="isLiveMuted"
                     playsinline
                     class="live-video"
                     @ended="onLiveVideoEnded"
              ></video>
           </div>

           <!-- Single Expanded Audio Control Button -->
           <div v-if="isPlayingLive" class="slider-audio-btn single-audio-btn" @click.stop="toggleLiveMute">
             <transition name="audio-fade">
               <img v-if="isLiveMuted" key="mute" :src="muteIcon" alt="audio muted" class="audio-icon" />
               <img v-else key="unmute" :src="unmuteIcon" alt="audio unmuted" class="audio-icon" />
             </transition>
           </div>
        </template>

        <!-- Case 2: Standard Image or Video Indicator -->
        <template v-else>
          <!-- Show first image if available -->
          <img v-if="post.images && post.images.length > 0"
               :src="coverImageSrc"
               alt="post cover"
               loading="lazy"
               referrerpolicy="no-referrer" />

          <!-- Fallback for video without custom cover -->
          <div v-else-if="post.video" class="video-placeholder">
            <span>Preview Video</span>
          </div>

          <!-- Video Indicator (Bilibili/Main Video) -->
          <div v-if="post.video" class="video-indicator">
            <el-icon><CaretRight /></el-icon>
          </div>
        </template>

        <!-- Pinned Indicator -->
        <div v-if="post.pinned" class="pinned-indicator">
           {{ $t('daily.pinned') }}
        </div>
      </div>
    </div>

    <div class="content-container">
      <h3 class="title">{{ post.title }}</h3>

      <div v-if="expanded && post.content" class="full-content">
        <p class="text-content">{{ post.content }}</p>
      </div>
      <!-- Show content ONLY if it's a text-only post (no image/video) and collapsed -->
      <p v-if="(!post.images?.length && !post.video) && post.content && !expanded" class="excerpt">{{ post.content }}</p>

      <div class="meta">
        <span class="date">{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay, Star, CaretRight, ArrowLeft, ArrowRight, Close, ArrowDown, RefreshRight } from '@element-plus/icons-vue'
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

import { dailyData, type Post } from '@/data/dailyData';
import muteIcon from '@/assets/buttons/mute.svg';
import unmuteIcon from '@/assets/buttons/unmute.svg';

const props = defineProps<{
  post: Post,
  expanded?: boolean
}>()

// Viewer State
const viewerShow = ref(false);
const viewerIndex = ref(0);
const viewerIsPlaying = ref(false);
const viewerVideoRef = ref<any[] | any>(null);
let viewerLiveTimer: ReturnType<typeof setTimeout> | null = null;
const viewerLiveIconExpanded = ref(false);
const liveIconExpanded = ref(false);

// Live Photo global audio control
const isLiveMuted = ref(true);

const toggleLiveMute = () => {
  isLiveMuted.value = !isLiveMuted.value;
};

// Check if post has any media
const hasMedia = computed(() => {
  return (props.post.images && props.post.images.length > 0) || !!props.post.video;
});

// Preview List for el-image
const previewList = computed(() => {
  if (!props.post.images) return [];
  return props.post.images.map(img => img.thumbnail || img.image);
});

// Slider Logic
const currentImageIndex = ref(0);
const liveVideoRef = ref<any>(null); // 使用 any 避免 TS 按严格数组推断导致单例分支被判定为 never
const isPlayingLive = ref(false);
let livePhotoTimer: ReturnType<typeof setTimeout> | null = null;

// 懒加载控制判断（只渲染当前、前后一张共 3 张）
const shouldRenderMedia = (index: number) => {
  return Math.abs(index - currentImageIndex.value) <= 1;
};

const shouldRenderViewerMedia = (index: number) => {
  return Math.abs(index - viewerIndex.value) <= 1;
};

// Helper to get current image source (for single preview fallback)
const currentImageSrc = computed(() => {
  if (!props.post.images || !props.post.images.length) return '';
  const item = props.post.images[currentImageIndex.value];
  return item?.thumbnail || item?.image || '';
});

// Helper to check if current item is Live Photo
const isCurrentLivePhoto = computed(() => {
  if (!props.post.images || !props.post.images.length) return false;
  return !!props.post.images[currentImageIndex.value]?.video;
});



// Helper for single Live Photo (non-slider mode)
const isSingleLivePhoto = computed(() => {
  if (props.post.images && props.post.images.length === 1) {
    return !!props.post.images[0].video;
  }
  return false;
});

const singleLivePhotoData = computed(() => {
  if (isSingleLivePhoto.value && props.post.images) {
    const item = props.post.images[0];
    return { cover: item.thumbnail || item.image, video: item.video || '' };
  }
  return { cover: '', video: '' };
});

const coverImageSrc = computed(() => {
  if (!props.post.images || !props.post.images.length) return '';
  const item = props.post.images[0];
  return item?.thumbnail || item?.image || '';
});

const playLivePhoto = () => {
  if (!(isCurrentLivePhoto.value || isSingleLivePhoto.value)) return;

  if (livePhotoTimer) clearTimeout(livePhotoTimer);

  // 0.5s delay before playing
  livePhotoTimer = setTimeout(() => {
    isPlayingLive.value = true;
    nextTick(() => {
       // 因 v-for 生成的是数组，我们要找到当前那个视频元素
       let targetVideo: HTMLVideoElement | null = null;
       if (Array.isArray(liveVideoRef.value)) {
          // 由于 v-if 懒加载，数组可能包含 null 或者是 DOM，提取真实的视频元素进行播放
          const activeVideos = liveVideoRef.value.filter(v => v !== null);
          if (activeVideos.length > 0) {
             targetVideo = activeVideos[0]; // 由于只有 current index 才会赋予 v-show true, 这也可以，或者是我们不需要找特定的，让它们去播
          }
       } else {
          targetVideo = liveVideoRef.value; // 对于单张图片情况可能还不是数组
       }
       if (targetVideo) {
         targetVideo.play().catch(e => console.log('Autoplay blocked', e));
       }
    });
  }, 500);
};

const stopLivePhoto = () => {
  if (livePhotoTimer) clearTimeout(livePhotoTimer);

  if (Array.isArray(liveVideoRef.value)) {
    liveVideoRef.value.forEach(v => {
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    });
  } else if (liveVideoRef.value) {
    liveVideoRef.value.pause();
    liveVideoRef.value.currentTime = 0;
  }

  isPlayingLive.value = false;
  liveIconExpanded.value = false; // Close menu when stopped or finished
};

const toggleLiveIcon = () => {
  liveIconExpanded.value = !liveIconExpanded.value;
};

const replayLivePhoto = () => {
  playLivePhoto();
  liveIconExpanded.value = false;
};

const handleMediaClick = (e: MouseEvent) => {
  if (props.expanded) {
    e.stopPropagation();

    // 1. If playing on card, stop it
    if (isPlayingLive.value) {
      stopLivePhoto();
    }

    // 2. Open viewer at current index
    viewerIndex.value = currentImageIndex.value;
    viewerShow.value = true;

    // 3. Start viewer playback logic
    playViewerLive();
  }
};

const closeViewer = () => {
  // Sync back the index so the card shows the last seen image in viewer
  currentImageIndex.value = viewerIndex.value;
  viewerShow.value = false;
  viewerLiveIconExpanded.value = false;
  stopViewerLive();
  isLiveMuted.value = true; // 关闭查看器也重置为静音
};

const playViewerLive = () => {
  stopViewerLive();
  if (!isViewerLivePhoto.value) return;

  viewerLiveTimer = setTimeout(() => {
    viewerIsPlaying.value = true;
    nextTick(() => {
      let targetVideo: HTMLVideoElement | null = null;
      if (Array.isArray(viewerVideoRef.value)) {
         const activeVideos = viewerVideoRef.value.filter(v => v !== null);
         if (activeVideos.length > 0) targetVideo = activeVideos[0];
      } else {
         targetVideo = viewerVideoRef.value;
      }
      if (targetVideo) {
        targetVideo.play().catch(e => console.log('Viewer autoplay blocked', e));
      }
    });
  }, 500);
};

const stopViewerLive = () => {
  if (viewerLiveTimer) clearTimeout(viewerLiveTimer);

  if (Array.isArray(viewerVideoRef.value)) {
    viewerVideoRef.value.forEach((v: any) => {
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    });
  } else if (viewerVideoRef.value) {
    (viewerVideoRef.value as any).pause();
    (viewerVideoRef.value as any).currentTime = 0;
  }

  viewerIsPlaying.value = false;
  viewerLiveIconExpanded.value = false;
};

const toggleViewerLiveIcon = () => {
  viewerLiveIconExpanded.value = !viewerLiveIconExpanded.value;
};

const replayViewerLivePhoto = () => {
  playViewerLive();
  viewerLiveIconExpanded.value = false;
};

const nextViewerImage = () => {
  if (props.post.images && viewerIndex.value < props.post.images.length - 1) {
    viewerIndex.value++;
    viewerLiveIconExpanded.value = false;
    playViewerLive();
  }
};

const prevViewerImage = () => {
  if (viewerIndex.value > 0) {
    viewerIndex.value--;
    viewerLiveIconExpanded.value = false;
    playViewerLive();
  }
};

const isViewerLivePhoto = computed(() => {
  if (!props.post.images || !props.post.images.length) return false;
  return !!props.post.images[viewerIndex.value]?.video;
});

// Keyboard Support
const handleKeydown = (e: KeyboardEvent) => {
  if (!viewerShow.value) return;
  if (e.key === 'Escape') closeViewer();
  if (e.key === 'ArrowRight') nextViewerImage();
  if (e.key === 'ArrowLeft') prevViewerImage();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);

  // If mounted in expanded state (e.g. in Modal), set body class and autoplay
  if (props.expanded) {
    document.body.classList.add('modal-open');
    if (isCurrentLivePhoto.value || isSingleLivePhoto.value) {
      playLivePhoto();
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (props.expanded) {
    document.body.classList.remove('modal-open');
  }
});



const onLiveVideoEnded = () => {
  isPlayingLive.value = false;
  if (Array.isArray(liveVideoRef.value)) {
     liveVideoRef.value.forEach((v: any) => { if (v) v.currentTime = 0; });
  } else if (liveVideoRef.value) {
     (liveVideoRef.value as any).currentTime = 0;
  }
};

// Watch for slide changes to reset and maybe auto-play logic
watch(currentImageIndex, () => {
  stopLivePhoto(); // Stop previous
  if (isCurrentLivePhoto.value && props.expanded) {
    playLivePhoto(); // Start new if Live
  }
});

// Watch for expanded state to start auto-play if first slide is Live
watch(() => props.expanded, (newVal) => {
  if (newVal) {
    document.body.classList.add('modal-open');
    isLiveMuted.value = true; // 重置为默认静音
    if (isCurrentLivePhoto.value || isSingleLivePhoto.value) {
      playLivePhoto();
    }
  } else {
    document.body.classList.remove('modal-open');
    stopLivePhoto();
    isLiveMuted.value = true; // 关闭卡片时重置静音状态
  }
});

const nextImage = () => {
  if (props.post.images && currentImageIndex.value < props.post.images.length - 1) {
    currentImageIndex.value++;
  }
};

const prevImage = () => {
  if (props.post.images && currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

// ---- 触摸滑动：展开模式轮播 ----
const SWIPE_THRESHOLD = 50; // 触发切换的最小滑动距离
const swipeStartX = ref(0);
const swipeDeltaX = ref(0);
const isSwiping = ref(false);

const onSwipeStart = (e: TouchEvent) => {
  swipeStartX.value = e.touches[0].clientX;
  swipeDeltaX.value = 0;
  isSwiping.value = true;
};

const onSwipeMove = (e: TouchEvent) => {
  if (!isSwiping.value) return;
  const dx = e.touches[0].clientX - swipeStartX.value;

  // 如果产生了实际滑动且正在播放Live图，立即停止播放
  if (Math.abs(dx) > 5 && isPlayingLive.value) {
     stopLivePhoto();
  }

  // 边界阻尼：到达首张右滑或末张左滑时，位移衰减
  const atStart = currentImageIndex.value === 0 && dx > 0;
  const atEnd = props.post.images && currentImageIndex.value >= props.post.images.length - 1 && dx < 0;
  swipeDeltaX.value = (atStart || atEnd) ? dx * 0.25 : dx;
};

const onSwipeEnd = () => {
  if (!isSwiping.value) return;
  isSwiping.value = false;
  const dx = swipeDeltaX.value;
  if (Math.abs(dx) >= SWIPE_THRESHOLD) {
    if (dx < 0) {
      // 左滑 → 下一张
      if (isPlayingLive.value) stopLivePhoto();
      nextImage();
    } else {
      // 右滑 → 上一张
      if (isPlayingLive.value) stopLivePhoto();
      prevImage();
    }
  }
  swipeDeltaX.value = 0;
};

// ---- 触摸滑动：全屏查看器 ----
const viewerSwipeStartX = ref(0);
const viewerSwipeDeltaX = ref(0);
const viewerIsSwiping = ref(false);

const onViewerSwipeStart = (e: TouchEvent) => {
  viewerSwipeStartX.value = e.touches[0].clientX;
  viewerSwipeDeltaX.value = 0;
  viewerIsSwiping.value = true;
};

const onViewerSwipeMove = (e: TouchEvent) => {
  if (!viewerIsSwiping.value) return;
  const dx = e.touches[0].clientX - viewerSwipeStartX.value;

  if (Math.abs(dx) > 5 && viewerIsPlaying.value) {
     stopViewerLive();
  }

  const atStart = viewerIndex.value === 0 && dx > 0;
  const atEnd = props.post.images && viewerIndex.value >= props.post.images.length - 1 && dx < 0;
  viewerSwipeDeltaX.value = (atStart || atEnd) ? dx * 0.25 : dx;
};

const onViewerSwipeEnd = () => {
  if (!viewerIsSwiping.value) return;
  viewerIsSwiping.value = false;
  const dx = viewerSwipeDeltaX.value;
  if (Math.abs(dx) >= SWIPE_THRESHOLD) {
    if (dx < 0) {
      if (viewerIsPlaying.value) stopViewerLive();
      nextViewerImage();
    } else {
      if (viewerIsPlaying.value) stopViewerLive();
      prevViewerImage();
    }
  }
  viewerSwipeDeltaX.value = 0;
};

// Bilibili Logic
const bilibiliSrc = computed(() => {
  if (!props.post.video) return '';

  // Extract BVID from URL (e.g., https://www.bilibili.com/video/BV1v63xz3EwX/...)
  const match = props.post.video.match(/BV[a-zA-Z0-9]+/);
  if (match) {
    const bvid = match[0];
    return `//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`;
  }
  return '';
});

const isBilibili = computed(() => {
  return props.post.video && (props.post.video.includes('bilibili.com') || props.post.video.includes('BV'));
});

// Date Formatting Logic
const formattedDate = computed(() => {
  if (props.expanded) {
    return props.post.date; // Returns full "2025-07-03 17:30" (24h)
  }
  // Returns only "2025-07-03" (YYYY-MM-DD)
  // Assuming date format in data is "YYYY-MM-DD HH:mm"
  return props.post.date.split(' ')[0];
});
</script>

<style scoped lang="less">
.daily-card {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px; /* Increased border radius for Little Red Book style */
  overflow: hidden;
  break-inside: avoid;
  /* margin-bottom: 20px;  <-- Removed for flex gap */
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease-out;
  cursor: pointer;

  /* Layout adjusted for JS masonry */
  width: 100%;
  position: relative;



  &:not(.is-expanded):hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-accent-primary);

    .title {
      color: var(--color-accent-primary);
    }
  }

  &.is-expanded {
    margin-bottom: 0;
    box-shadow: none;
    border: none;
    border-radius: 0; /* Let the modal container handle the rounding */
    cursor: default;
    height: 100%;
    display: flex;
    flex-direction: column;

    .media-container {
      flex-shrink: 0;
      max-height: 50vh;
      overflow: hidden;
      background-color: #000;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        object-fit: contain;
        max-height: 50vh;
        width: 100%;
      }
    }

    .content-container {
      flex-grow: 1;
      overflow-y: auto;
    }

    .pinned-indicator {
      display: none; /* Hide when expanded or adjust position if needed */
    }

    .pinned-indicator {
      display: none; /* Hide when expanded or adjust position if needed */
    }
  }
}

.media-container {
  width: 100%;
  position: relative;
  min-height: 200px; /* Ensure height for video placeholder */
  background-color: var(--color-surface);

  /* Video Player Container */
  .video-player-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;

    .bilibili-iframe {
      width: 100%;
      height: 100%;
      min-height: 400px; /* Give it some height */
    }

    .video-player-sim {
      width: 100%;
      height: 100%;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .playing-icon {
        font-size: 3rem;
        margin-bottom: 10px;
        animation: pulse 2s infinite;
      }
    }
  }

  /* Slider */
  .image-slider {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden; /* 隐藏轨道外的内容 */

    .slider-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform;
      touch-action: pan-y;

      &.is-swiping {
        transition: none;
      }
    }

    .slider-item {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;

      .lazy-placeholder {
        width: 100%;
        height: 100%;
        background-color: transparent;
      }

      /* Ensure cursor is zoom-in when expanded to indicate preview */
      .is-expanded & {
        cursor: zoom-in;
      }
    }

    .slider-image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .slider-counter {
      position: absolute;
      top: 15px;
      right: 15px; /* Moved to right */
      background-color: rgba(255,255,255,0.1);
      color: #fff;
      padding: 4px 10px;
      border-radius: 20px; /* Capsule shape */
      font-size: 0.8rem;
      backdrop-filter: blur(4px);
      z-index: 10;
    }

    .slider-audio-btn {
      position: absolute;
      bottom: 15px;
      right: 15px;
      width: 28px;
      height: 28px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s;
      backdrop-filter: blur(4px);

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }

      .audio-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
      }
    }

    .slider-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.7);
      }

      &.prev { left: 15px; }
      &.next { right: 15px; }

      .el-icon {
        font-size: 1.2rem;
      }
    }
  }

  /* Preview / Collapsed */
  .media-preview {
    position: relative;
    width: 100%;

    .single-audio-btn {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 28px;
      height: 28px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s;
      backdrop-filter: blur(4px);

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }

      .audio-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
      }
    }

    img {
      width: 100%;
      height: auto;
      max-height: 450px; /* Limit max height for very tall images */
      object-fit: cover; /* Crop if necessary to maintain aspect ratio */
      display: block;
    }

    /* Target the container in preview mode */
    & {
       .is-expanded & {
          cursor: zoom-in;
       }
    }

    .video-placeholder {
      width: 100%;
      aspect-ratio: 16/9;
      background-color: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-text-secondary);
    }

    .video-indicator {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(2px);
      border-radius: 50%; /* Circle or rounded square? Triangle implies shape... keep it simple wrapper */
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;

      .el-icon {
        font-size: 14px;
        margin-left: 2px; /* Visual balance for triangle */
      }
    }
  }
}

.content-container {
  padding: 16px;

  .no-media & {
    padding-top: 18px;
  }
}

.title {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: var(--color-text-primary);
  line-height: 1.4;
  font-weight: 600;
  transition: color 0.2s;
  font-family: var(--font-family-base);
}

.excerpt {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 2 lines as requested */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.full-content {
  .text-content {
    font-size: 1rem;
    color: var(--color-text-primary);
    line-height: 1.8;
    margin-bottom: 20px;
    white-space: pre-wrap;
  }
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

.pinned-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  height: 24px;
  background-color: var(--color-accent-primary); /* Use primary color */
  border-radius: 12px;
  padding: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  font-size: 0.8rem;
  font-weight: bold;


  .pinned-indicator {
    display: none; /* Hide when expanded or adjust position if needed */
  }
}

.live-photo-container {
  position: relative;
  width: 100%;
  height: 100%;

  .live-cover {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .live-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
}

.live-icon-wrapper {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: auto; /* Enable clicks */

  &.in-viewer {
    position: absolute; /* Re-declare absolute to be safe, though wrapper is absolute */
    top: 50px;
    left: 105px;
    z-index: 3150; /* Higher than viewer controls if needed, overlay is 3000, controls 3100 */
  }

  /* Mobile adjustment to avoid overlap with Close Button (top-left) in Expanded Card mode */
  /* Close button in Daily.vue is left: 15px, width: 44px (~60px edge). */
  /* We check if card is expanded first */
  .daily-card.is-expanded & {
    @media (max-width: 800px) {
      left: 70px;
      top: 25px;
    }
  }
}

.live-icon-badge {
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  padding: 5px 6px; /* Adjusted from 6px 14px */
  border-radius: 20px;
  font-size: 0.8rem; /* Adjusted from 0.85rem */
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.95);
    transform: scale(1.02);
  }

  /* When expanded, maybe change style? */
  &.is-expanded {
    background-color: #fff;
  }

  .live-icon-symbol {
    font-size: 1.05rem; /* Adjusted from 1.1rem */
    line-height: 1;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .live-arrow {
    font-size: 0.8rem;
    transition: transform 0.3s ease;

    &.is-rotated {
      transform: rotate(180deg);
    }
  }

  /* .in-viewer styles moved to .live-icon-wrapper */
}

.live-menu {
  margin-top: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 20px; /* Capsule shape */
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: slideDown 0.2s ease-out;

  &:hover {
    background-color: #fff;
    transform: translateY(1px);
    color: var(--color-accent-primary, #000);
  }

  .el-icon {
    font-size: 1rem;
  }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom Viewer Styles */
.custom-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.viewer-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.viewer-track-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.viewer-media-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  touch-action: pan-y;
  user-select: none;

  &.is-swiping {
    transition: none;
  }
}

.viewer-slide-item {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .lazy-placeholder {
    width: 100%;
    height: 100%;
    background: transparent;
  }

  .viewer-image, .viewer-video {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: 100vh;
    object-fit: contain;
    display: block;
  }

  .viewer-live-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .viewer-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
}

.viewer-close-btn {
  position: absolute;
  top: 40px;
  left: 40px; /* Moved to left */
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3100;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
}

.viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3100;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.prev { left: 40px; }
  &.next { right: 40px; }

  @media (max-width: 768px) {
    width: 42px;
    height: 42px;
    font-size: 18px;

    &.prev { left: 10px; }
    &.next { right: 10px; }
  }
}

.viewer-counter {
  position: absolute;
  top: 40px;
  right: 40px; /* Moved to right */
  left: auto;
  transform: none;
  color: #fff;
  font-size: 0.9rem; /* Smaller font */
  font-weight: 500;
  background: rgba(255,255,255,0.1);
  padding: 2px 10px; /* Smaller padding */
  border-radius: 20px;
  backdrop-filter: blur(4px);
  z-index: 3100;
}

.viewer-audio-btn {
  position: absolute;
  bottom: 40px;
  right: 40px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3100;
  transition: all 0.3s;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .audio-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    bottom: 50px;
    right: 30px;
    width: 32px;
    height: 32px;

    .audio-icon {
      width: 16px;
      height: 16px;
    }
  }
}

/* Audio toggle transition */
.audio-fade-enter-active,
.audio-fade-leave-active {
  transition: opacity 0.3s ease, clip-path 0.3s ease;
  will-change: clip-path, opacity;
}

.audio-fade-enter-from {
  clip-path: inset(0 0 100% 0); /* Bottom hidden, reveals from top */
  opacity: 0;
}
.audio-fade-enter-to {
  clip-path: inset(0 0 0 0);
  opacity: 1;
}

.audio-fade-leave-from {
  clip-path: inset(0 0 0 0);
  opacity: 1;
}
.audio-fade-leave-to {
  clip-path: inset(100% 0 0 0); /* Top hidden, shrinks towards bottom */
  opacity: 0;
}

.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}
</style>
