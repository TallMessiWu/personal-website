<template>
  <div class="daily-card" :class="{ 'is-expanded': expanded, 'no-media': !hasMedia }" ref="cardRef">
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
        <!-- Image/Video Renderer -->
        <div class="slider-item" @click="handleMediaClick">
          <template v-if="isCurrentLivePhoto">
             <!-- Live Photo Container -->
             <div class="live-photo-container">
               <!-- Cover Image -->
               <img v-show="!isPlayingLive" :src="currentLivePhoto.cover" alt="live photo cover" class="slider-image live-cover" />

               <!-- Video -->
               <video v-show="isPlayingLive"
                      ref="liveVideoRef"
                      :src="currentLivePhoto.video"
                      class="slider-image live-video"
                      muted
                      playsinline
                      @ended="onLiveVideoEnded"
               ></video>

               <!-- Live Icon overlay -->
               <div class="live-icon-badge">
                 <div class="live-icon-symbol">◎</div>
                 <span>LIVE</span>
               </div>
             </div>
          </template>
          <template v-else>
             <!-- Standard Image -->
             <img :src="currentImageSrc" alt="post image" class="slider-image" />
          </template>
        </div>

        <div class="slider-counter">
          {{ currentImageIndex + 1 }} / {{ post.images.length }}
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
             <img v-show="!isPlayingLive" :src="singleLivePhotoData.cover" alt="live photo cover" referrerpolicy="no-referrer" />
             <video v-show="isPlayingLive"
                    ref="liveVideoRef"
                    :src="singleLivePhotoData.video"
                    muted
                    playsinline
                    @ended="onLiveVideoEnded"
             ></video>
             <div class="live-icon-badge">
               <div class="live-icon-symbol">◎</div>
               <span>LIVE</span>
             </div>
           </div>
        </template>

        <!-- Case 2: Standard Image or Video Indicator -->
        <template v-else>
          <!-- Show first image if available -->
          <img v-if="post.images && post.images.length > 0"
               :src="post.images[0].image"
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
      <p v-if="(!post.images?.length && !post.video) && post.content" class="excerpt">{{ post.content }}</p>

      <div class="meta">
        <span class="date">{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay, Star, CaretRight, ArrowLeft, ArrowRight, Location } from '@element-plus/icons-vue'
import { ref, computed, watch, nextTick } from 'vue';

import { dailyData, type Post } from '@/data/dailyData';

const props = defineProps<{
  post: Post,
  expanded?: boolean
}>()

// Check if post has any media
const hasMedia = computed(() => {
  return (props.post.images && props.post.images.length > 0) || !!props.post.video;
});

// Slider Logic
const currentImageIndex = ref(0);
const liveVideoRef = ref<HTMLVideoElement | null>(null);
const isPlayingLive = ref(false);
let livePhotoTimer: ReturnType<typeof setTimeout> | null = null;

// Helper to get current image source
const currentImageSrc = computed(() => {
  if (!props.post.images || !props.post.images.length) return '';
  return props.post.images[currentImageIndex.value]?.image || '';
});

// Helper to check if current item is Live Photo
const isCurrentLivePhoto = computed(() => {
  if (!props.post.images || !props.post.images.length) return false;
  return !!props.post.images[currentImageIndex.value]?.video;
});

// Helper to get current Live Photo object
const currentLivePhoto = computed(() => {
  if (!props.post.images || !props.post.images.length) return { cover: '', video: '' };
  const item = props.post.images[currentImageIndex.value];
  return item ? { cover: item.image, video: item.video || '' } : { cover: '', video: '' };
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
    return { cover: props.post.images[0].image, video: props.post.images[0].video || '' };
  }
  return { cover: '', video: '' };
});

const playLivePhoto = () => {
  if (!(isCurrentLivePhoto.value || isSingleLivePhoto.value)) return;

  if (livePhotoTimer) clearTimeout(livePhotoTimer);

  // 1s delay before playing
  livePhotoTimer = setTimeout(() => {
    isPlayingLive.value = true;
    nextTick(() => {
      if (liveVideoRef.value) {
        liveVideoRef.value.play().catch(e => console.log('Autoplay blocked', e));
      }
    });
  }, 1000);
};

const stopLivePhoto = () => {
  if (livePhotoTimer) clearTimeout(livePhotoTimer);
  if (liveVideoRef.value) {
    liveVideoRef.value.pause();
    liveVideoRef.value.currentTime = 0;
  }
  isPlayingLive.value = false;
};

const handleMediaClick = (e: MouseEvent) => {
  if (props.expanded) {
    // Only handle Live Photo and stop propagation when expanded (in modal)
    e.stopPropagation();
    handleLivePhotoClick();
  }
  // When not expanded, let it bubble up to Daily.vue's openPost
};

const handleLivePhotoClick = () => {
  if (isCurrentLivePhoto.value || isSingleLivePhoto.value) {
    if (isPlayingLive.value) {
      // If already playing, maybe restart? Or do nothing? Requirement says "replay"
      if (liveVideoRef.value) {
        liveVideoRef.value.currentTime = 0;
        liveVideoRef.value.play();
      }
    } else {
      // Force play immediately without delay on click
      isPlayingLive.value = true;
      nextTick(() => {
         liveVideoRef.value?.play();
      });
    }
  }
};

const onLiveVideoEnded = () => {
  isPlayingLive.value = false;
  if (liveVideoRef.value) {
    liveVideoRef.value.currentTime = 0; // Reset to start
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
    if (isCurrentLivePhoto.value || isSingleLivePhoto.value) {
      playLivePhoto();
    }
  } else {
    stopLivePhoto();
  }
}, { immediate: true });

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
    display: flex;
    justify-content: center;
    align-items: center;

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
      background-color: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      backdrop-filter: blur(4px);
      z-index: 10;
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

    img {
      width: 100%;
      height: auto;
      max-height: 450px; /* Limit max height for very tall images */
      object-fit: cover; /* Crop if necessary to maintain aspect ratio */
      display: block;
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

  .live-cover,
  .live-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
}

.live-icon-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  backdrop-filter: blur(4px);
  pointer-events: none; /* Let click pass through to container */

  .live-icon-symbol {
    font-size: 1rem;
    line-height: 1;
    color: #333;
    /* Optional: pulsing effect for the concentric circles icon */
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
