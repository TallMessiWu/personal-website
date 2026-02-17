<template>
  <div class="header-container">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo-container" @click="router.push('/home')">
        <img class="logo" src="@/assets/logo.png" alt="logo"/>
        <span class="logo-text text-code">&lt;{{ t('app.title') }} /&gt;</span>
      </div>

      <!-- Navigation (Desktop) -->
      <nav class="nav-links desktop-nav">
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
          <span class="lang-text">{{ locale === 'zh' ? 'En' : '中文' }}</span>
          <el-icon class="loop-icon"><Refresh /></el-icon>
        </div>
      </nav>

      <!-- Hamburger Menu Button (Mobile) -->
      <!-- Hamburger Menu Button (Mobile) -->
      <div class="hamburger-btn" @click="toggleMobileMenu">
        <span class="bar top"></span>
        <span class="bar middle"></span>
        <span class="bar bottom"></span>
      </div>
    </div>

    <!-- Mobile Menu (Teleported to body to avoid z-index/positioning issues) -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="isMobileMenuOpen" class="mobile-nav-overlay" @click="closeMobileMenu"></div>
      </transition>

      <transition name="slide-right">
        <div v-if="isMobileMenuOpen" class="mobile-nav-drawer">
           <div class="drawer-header">
              <span class="drawer-title text-code">&lt;{{ t('nav.menu') }} /&gt;</span>
              <div class="drawer-close-btn" @click="closeMobileMenu">
                 <span class="bar top"></span>
                 <span class="bar bottom"></span>
              </div>
           </div>
           <div class="drawer-content">
              <router-link to="/home" class="mobile-nav-item" active-class="active">{{ t('nav.home') }}</router-link>
              <router-link to="/daily" class="mobile-nav-item" active-class="active">{{ t('nav.daily') }}</router-link>
              <router-link to="/portfolio" class="mobile-nav-item" active-class="active">{{ t('nav.portfolio') }}</router-link>
              <router-link to="/about" class="mobile-nav-item" active-class="active">{{ t('nav.about') }}</router-link>

              <div class="divider"></div>

              <div class="mobile-actions">
                <div class="action-item" @click="toggleTheme">
                   <span>{{ isDark ? t('theme.light') : t('theme.dark') }}</span>
                   <el-icon :class="['bulb-icon', { 'is-lit': !isDark }]"><CustomBulb /></el-icon>
                </div>
                <div class="action-item" @click="toggleLanguage">
                   <span>{{ locale === 'zh' ? 'Switch to English' : '切换到中文' }}</span>
                   <el-icon><Refresh /></el-icon>
                </div>
              </div>
           </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, h, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Refresh, Menu, Close } from '@element-plus/icons-vue';

const router = useRouter();
const { t, locale } = useI18n();

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

// Close menu when route changes
watch(
  () => router.currentRoute.value.fullPath,
  () => {
    closeMobileMenu();
  }
);

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



.hamburger-btn {
  display: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  .bar {
    display: block;
    width: 22px;
    height: 2px;
    background-color: var(--color-accent-primary); /* Theme Blue */
    border-radius: 3px;
    transition: all 0.3s ease;
  }

  &:hover {
    background-color: var(--color-surface-hover);

    .bar {
      background-color: var(--color-text-primary); /* Darker on hover */
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

/* Close Button in Drawer */
.drawer-close-btn {
  cursor: pointer;
  width: 28px; /* Slightly smaller container */
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: var(--color-text-secondary); /* Base color */

  .bar {
    position: absolute;
    display: block;
    width: 18px; /* Smaller X */
    height: 2px; /* Thinner */
    background-color: currentColor;
    border-radius: 3px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  }

  .bar.top {
    transform: rotate(45deg);
  }

  .bar.bottom {
    transform: rotate(-45deg);
  }

  &:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text-primary); /* Darker on hover */
    transform: rotate(90deg); /* Rotate effect on hover */
  }

  &:active {
     transform: rotate(90deg) scale(0.75); /* Distinct click squeeze */
     transition-duration: 0.1s;
  }
}

/* Mobile Menu Overlay */
.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
}

/* Mobile Menu Drawer */
.mobile-nav-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background-color: var(--color-surface);
  border-left: 1px solid var(--color-border);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 30px rgba(0,0,0,0.3);

  .drawer-header {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid var(--color-border);

    .drawer-title {
      font-size: 1.1rem;
      color: var(--color-accent-primary);
      font-weight: 600;
    }

    .close-btn {
      cursor: pointer;
      color: var(--color-text-secondary);
      padding: 4px;
      transition: color 0.2s;

      &:hover {
        color: var(--color-text-primary);
      }
    }
  }

  .drawer-content {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .mobile-nav-item {
      font-size: 1.1rem;
      color: var(--color-text-primary);
      padding: 12px 16px;
      border-radius: 6px;
      transition: background-color 0.2s;
      font-weight: 500;

      &:hover, &.active {
        background-color: var(--color-surface-hover);
        color: var(--color-accent-primary);
      }
    }

    .divider {
      height: 1px;
      background-color: var(--color-border);
      margin: 10px 0;
    }

    .mobile-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .action-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: all 0.2s;

        &:hover {
          background-color: var(--color-surface-hover);
          color: var(--color-text-primary);
        }

        .el-icon {
          font-size: 1.2rem;
        }
      }
    }
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .hamburger-btn {
    display: flex;
  }
}
</style>
