<template>
  <div class="daily-card" :class="{ 'is-expanded': expanded }" ref="cardRef">
    <div class="media-container" v-if="post.image || post.video || (post.images && post.images.length)">
      <!-- 1. Video Expanded Mode: Auto-play simulation -->
      <div v-if="post.video && expanded" class="video-player-sim">
        <el-icon class="playing-icon"><VideoPlay /></el-icon>
        <span>Playing Video...</span>
      </div>

      <!-- 2. Multi-Image Expanded Mode: Slider -->
      <div v-else-if="post.images && post.images.length > 1 && expanded" class="image-slider">
        <img :src="post.images[currentImageIndex]" alt="post image" class="slider-image" />

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

      <!-- 3. Default / Collapsed Mode -->
      <div v-else class="media-preview">
        <!-- Show image (custom cover or main image) -->
        <img v-if="post.image" :src="post.image" alt="post cover" loading="lazy" />

        <!-- Fallback for video without custom cover -->
        <div v-else-if="post.video" class="video-placeholder">
          <span>Preview Video</span>
        </div>

        <!-- Video Indicator (Overlay) -->
        <div v-if="post.video" class="video-indicator">
          <el-icon><CaretRight /></el-icon>
        </div>

        <!-- Pinned Indicator -->
        <div v-if="post.pinned" class="pinned-indicator">
           {{ $t('daily.pinned') }}
        </div>

        <!-- Multiple Images Indicator (Optional for collapsed state, can add later if requested) -->
      </div>
    </div>

    <div class="content-container">
      <h3 class="title">{{ post.title }}</h3>

      <div v-if="expanded" class="full-content">
        <p class="text-content">{{ post.content || post.excerpt }}</p>
      </div>
      <!-- Show excerpt ONLY if it's a text-only post (no image/video) and collapsed, AND it has content -->
      <p v-if="(!post.image && !post.video && !post.images) && (post.content || post.excerpt)" class="excerpt">{{ post.content || post.excerpt }}</p>

      <div class="meta">
        <span class="date">{{ post.date }}</span>
        <div class="actions">
           <el-icon><Star /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay, Star, CaretRight, ArrowLeft, ArrowRight, Location } from '@element-plus/icons-vue'
import { ref } from 'vue';

const props = defineProps<{
  post: {
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    image?: string;
    images?: string[];
    video?: string;
    date: string;
    pinned?: boolean;
  },
  expanded?: boolean
}>()

// Slider Logic
const currentImageIndex = ref(0);

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

  /* Video Player Sim */
  .video-player-sim {
    width: 100%;
    height: 100%;
    min-height: 300px;
    background-color: #000;
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
      left: 15px;
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

  .actions {
    cursor: pointer;
    transition: color 0.2s;
    &:hover {
      color: var(--color-accent-quaternary);
    }
  }
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


}
</style>
