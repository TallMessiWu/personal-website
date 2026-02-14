<template>
  <div class="portfolio-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('portfolio.title') }}</h1>
      <div class="filter-tabs">
        <span
          v-for="cat in categories"
          :key="cat.value"
          class="filter-item"
          :class="{ active: selectedCategory === cat.value }"
          @click="selectedCategory = cat.value"
        >
          {{ cat.label }}
        </span>
      </div>
    </div>

    <transition-group name="list" tag="div" class="portfolio-grid">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="portfolio-item"
      >
        <div class="image-wrapper">
          <img :src="item.image" :alt="item.title" loading="lazy" />
          <div class="overlay">
            <h3 class="item-title">{{ item.title }}</h3>
            <span class="view-btn">{{ t('portfolio.viewBtn') }}</span>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';

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

const categories = computed(() => [
  { label: t('portfolio.filter.all'), value: 'All' }, // Changed 'all' to 'All' to match selectedCategory
  { label: t('portfolio.filter.video'), value: 'video' },
  { label: t('portfolio.filter.photo'), value: 'photo' },
  { label: t('portfolio.filter.code'), value: 'code' }
]);

const selectedCategory = ref('All');


const items = ref([
  { id: 1, title: 'Ancient Town', category: 'photo', image: 'https://placehold.co/600x400/1e1e1e/333.png?text=Ancient+Town&font=roboto' },
  { id: 2, title: 'Personal Website v1.0', category: 'code', image: 'https://placehold.co/600x400/1e1e1e/333.png?text=Website&font=roboto' },
  { id: 3, title: 'City Night VLOG', category: 'video', image: 'https://placehold.co/600x400/1e1e1e/333.png?text=Vlog&font=roboto' },
  { id: 4, title: 'Portrait Photography', category: 'photo', image: 'https://placehold.co/600x800/1e1e1e/333.png?text=Portrait&font=roboto' },
  { id: 5, title: 'Open Source Lib', category: 'code', image: 'https://placehold.co/600x400/1e1e1e/333.png?text=Library&font=roboto' },
  { id: 6, title: 'Travel Record', category: 'video', image: 'https://placehold.co/600x400/1e1e1e/333.png?text=Travel&font=roboto' },
]);

const filteredItems = computed(() => {
  if (selectedCategory.value === 'All') return items.value;
  return items.value.filter(item => item.category === selectedCategory.value);
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
}

.page-title {
  font-size: 2.5rem;
  color: var(--color-text-primary);
  font-weight: 700;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  background-color: var(--color-surface);
  padding: 5px;
  border-radius: 6px;
  border: 1px solid var(--color-border);

  .filter-item {
    cursor: pointer;
    font-size: 1rem;
    padding: 8px 20px;
    border-radius: 4px;
    transition: all 0.2s;
    color: var(--color-text-secondary);
    font-family: var(--font-family-base);

    &:hover {
      color: var(--color-text-primary);
      background-color: var(--color-surface-hover);
    }

    &.active {
      color: #fff;
      background-color: var(--color-accent-primary);
    }
  }
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
    border-radius: 6px;
    border: 1px solid var(--color-border);
    background-color: var(--color-surface);
    height: 250px;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
      opacity: 0.8;
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
      gap: 15px;
      backdrop-filter: blur(2px);
    }

    &:hover {
      border-color: var(--color-accent-primary);

      img {
        transform: scale(1.1);
        opacity: 0.4;
      }

      .overlay {
        opacity: 1;
      }
    }
  }
}

.item-title {
  font-size: 1.2rem;
  color: #fff;
  font-weight: 600;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.portfolio-item:hover .item-title {
  transform: translateY(0);
}

.view-btn {
  padding: 8px 20px;
  border: 1px solid var(--color-accent-primary);
  color: var(--color-accent-primary);
  border-radius: 4px; /* Slightly grounded */
  font-size: 0.9rem;
  transition: all 0.3s;
  background-color: rgba(0, 0, 0, 0.5);
  transform: translateY(20px);
  transition: all 0.3s ease 0.1s; /* Delay */

  &:hover {
    background-color: var(--color-accent-primary);
    color: #fff;
  }
}

.portfolio-item:hover .view-btn {
  transform: translateY(0);
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
