<template>
  <div class="header-container">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo-container" @click="router.push('/home')">
        <img class="logo" src="@/assets/logo.png" alt="logo"/>
        <span class="logo-text text-code">&lt;{{ t('app.title') }} /&gt;</span>
      </div>

      <!-- Navigation -->
      <nav class="nav-links">
        <router-link to="/home" class="nav-item" active-class="active">{{ t('nav.home') }}</router-link>
        <router-link to="/daily" class="nav-item" active-class="active">{{ t('nav.daily') }}</router-link>
        <router-link to="/portfolio" class="nav-item" active-class="active">{{ t('nav.portfolio') }}</router-link>
        <router-link to="/about" class="nav-item" active-class="active">{{ t('nav.about') }}</router-link>

        <!-- Theme Toggle -->
        <div class="theme-toggle" @click="toggleTheme" :title="isDark ? t('theme.light') : t('theme.dark')">
             <el-icon :class="['bulb-icon', { 'is-lit': !isDark }]"><CustomBulb /></el-icon>
        </div>

        <!-- Language Switcher (Toggle) -->
        <div class="lang-toggle" @click="toggleLanguage" :title="t('language.switch')">
          <span class="lang-text">{{ locale === 'zh' ? '中文' : 'En' }}</span>
          <el-icon class="loop-icon"><Refresh /></el-icon>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, h, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Refresh } from '@element-plus/icons-vue';

const router = useRouter();
const { t, locale } = useI18n();
// Initialize theme from localStorage or system preference
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('user-theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const isDark = ref(getInitialTheme());

// Custom Lightbulb Icon Component
const CustomBulb = {
  name: 'CustomBulb',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '1em',
      height: '1em'
    }, [
      h('path', {
        d: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.93 12.37 7 11.24 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.24-.93 3.37-2.15 4.1z'
      })
    ]);
  }
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  const theme = isDark.value ? 'dark' : 'light';
  if (isDark.value) {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  localStorage.setItem('user-theme', theme);
};

const toggleLanguage = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh';
  localStorage.setItem('user-locale', locale.value);
};

// Update browser title when locale changes
watch(locale, () => {
  document.title = t('app.title');
}, { immediate: true });

onMounted(() => {
  updateTheme();
});
</script>

<style scoped lang="less">
.header-container {
  width: 100%;
  height: 60px; /* Reduced height slightly for a sleeker look */
  background-color: var(--color-header-bg); /* Use new variable */
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  .logo {
    height: 32px;
    width: auto;
  }

  .logo-text {
    font-size: 1.2rem;
    color: var(--color-accent-primary);
    font-weight: 600;
    letter-spacing: 0.5px;
    font-family: 'Fira Code', monospace; /* Ensure consistent font for logo */
  }

}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;

  .nav-item {
    font-size: 0.95rem;
    color: var(--color-text-secondary);
    position: relative;
    padding: 6px 0;
    font-family: var(--font-family-base);
    font-weight: 500;
    transition: color 0.2s ease;

    /* Indicator line (like active tab in VSCode) */
    &::after {
      content: '';
      position: absolute;
      bottom: -18px; /* Push to bottom of header */
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--color-accent-primary);
      transform: scaleX(0);
      opacity: 0;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    &:hover {
      color: var(--color-text-primary);
      text-decoration: none;

      &::after {
        transform: scaleX(1);
        opacity: 0.4;
      }
    }

    &.active {
      color: var(--color-text-primary);

      &::after {
        transform: scaleX(1);
        opacity: 1;
      }
    }
  }
}

.theme-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--color-text-secondary);

  &:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .bulb-icon {
    font-size: 1.3rem;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &.is-lit {
      color: #ffb142; /* Bright yellow/orange for lit state */
      filter: drop-shadow(0 0 8px #ffb142);
      transform: scale(1.1);
    }
  }
}

.lang-toggle {
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px; /* Small gap between text and icon */
  color: var(--color-text-secondary);
  transition: color 0.2s;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-surface-hover);
  }

  .lang-text {
    font-size: 0.95rem;
    font-weight: 500;
    user-select: none;
  }

  .loop-icon {
    font-size: 0.8rem; /* Correct "small loop icon" */
    margin-top: 2px; /* Slight alignment adjustment */
  }
}

@media (max-width: 768px) {
  .nav-links {
    gap: 20px;

    .nav-item {
      font-size: 0.9rem;
    }
  }
}
</style>
