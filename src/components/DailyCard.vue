<template>
  <div class="daily-card" :class="{ 'is-expanded': expanded }" ref="cardRef">
    <div class="media-container" v-if="post.image || post.video">
      <img v-if="post.image" :src="post.image" alt="post image" loading="lazy" />

      <div v-else-if="post.video" class="video-wrapper">
         <template v-if="post.video === 'placeholder' || !expanded">
            <div class="video-placeholder">
              <el-icon class="play-icon"><VideoPlay /></el-icon>
              <span>Preview Video</span>
            </div>
         </template>
         <template v-else>
            <!-- Real video player would go here, simulating with a colored box or iframe for now -->
             <div class="video-player-sim">
                <el-icon class="playing-icon"><VideoPlay /></el-icon>
                <span>Playing Video...</span>
             </div>
         </template>
      </div>
    </div>

    <div class="content-container">
      <h3 class="title">{{ post.title }}</h3>

      <div v-if="expanded" class="full-content">
        <p class="text-content">{{ post.content || post.excerpt }}</p>
      </div>
      <p v-else class="excerpt">{{ post.excerpt }}</p>

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
import { VideoPlay, Star } from '@element-plus/icons-vue'

defineProps<{
  post: {
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    image?: string;
    video?: string;
    date: string;
  },
  expanded?: boolean
}>()
</script>

<style scoped lang="less">
.daily-card {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px; /* Slightly sharper corners for VSCode look */
  overflow: hidden;
  break-inside: avoid;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease-out;
  cursor: pointer;

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
    cursor: default;
    height: 100%;
    display: flex;
    flex-direction: column;

    .media-container {
      flex-shrink: 0;
      max-height: 50vh;
      overflow: hidden;

      img {
        object-fit: contain;
        max-height: 50vh;
        background-color: #000;
      }
    }

    .content-container {
      flex-grow: 1;
      overflow-y: auto;
    }
  }
}

.media-container {
  width: 100%;
  position: relative;

  img {
    width: 100%;
    height: auto;
    display: block;
  }

  .video-placeholder, .video-player-sim {
    width: 100%;
    aspect-ratio: 16/9;
    background-color: #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
  }

  .video-player-sim {
    background-color: #000;
    color: #fff;

    .playing-icon {
      font-size: 3rem;
      margin-bottom: 10px;
      animation: pulse 2s infinite;
    }
  }

  .play-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    opacity: 0.8;
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
  -webkit-line-clamp: 3;
  line-clamp: 3;
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
  border-top: 1px solid rgba(255, 255, 255, 0.05); /* Very subtle separator */
  padding-top: 12px;

  .actions {
    cursor: pointer;
    transition: color 0.2s;
    &:hover {
      color: var(--color-accent-quaternary); /* Yellow highlight for stars */
    }
  }
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
