<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <div class="code-line">
            <span class="keyword">console</span>.<span class="method">log</span>(<span class="string">"{{ t('home.console.hello') }}"</span>);
          </div>
          <h1 class="hero-title">
            {{ t('home.hero.title_prefix') }} <span class="highlight">{{ t('home.hero.developer') }}</span> & <br>
            {{ t('home.hero.content_creator_prefix') }} <span class="highlight">{{ t('home.hero.content_creator_highlight') }}</span>
          </h1>
          <p class="hero-subtitle">{{ t('home.hero.subtitle') }}</p>

          <div class="cta-group">
            <button class="btn btn-primary" @click="$router.push('/portfolio')">{{ t('home.hero.view_work') }}</button>
            <button class="btn btn-secondary" @click="$router.push('/about')">{{ t('home.hero.contact_me') }}</button>
          </div>
        </div>

        <div class="hero-visual">
          <div class="code-window">
             <div class="window-header">
               <span class="dot red"></span>
               <span class="dot yellow"></span>
               <span class="dot green"></span>
             </div>
             <div class="window-body">
               <pre><code><span class="keyword">const</span> <span class="variable">profile</span> <span class="operator">=</span> {
  <span class="string">"{{ t('home.code.keys.name') }}"</span>: <span class="string">"{{ t('home.code.name') }}"</span>,
  <span class="string">"{{ t('home.code.keys.role') }}"</span>: <span class="string">"{{ t('home.code.role') }}"</span>,
  <span class="string">"{{ t('home.code.keys.focus') }}"</span>: [
    <span class="string">"{{ codeFocus[0] }}"</span>,
    <span class="string">"{{ codeFocus[1] }}"</span>,
    <span class="string">"{{ codeFocus[2] }}"</span>
  ],
  <span class="string">"{{ t('home.code.keys.status') }}"</span>: <span class="string">"{{ t('home.code.status') }}"</span>
};</code></pre>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Focus Areas Section -->
    <section class="focus-section">
      <div class="section-heading">
        <span class="heading-eyebrow">{{ t('home.focus.title') }}</span>
        <h2 class="heading-title">{{ t('home.focus.subtitle') }}</h2>
      </div>
      <div class="focus-grid">
        <div
          v-for="(item, idx) in tm('home.focus.items')"
          :key="idx"
          class="focus-card"
        >
          <span class="focus-tag">{{ item.tag }}</span>
          <h3 class="focus-title">{{ item.title }}</h3>
          <p class="focus-desc">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Highlight Stats Section -->
    <section class="stats-section">
      <div class="section-heading">
        <span class="heading-eyebrow">{{ t('home.stats.title') }}</span>
      </div>
      <div class="stats-grid">
        <div
          v-for="(item, idx) in tm('home.stats.items')"
          :key="idx"
          class="stat-card"
        >
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-hint">// {{ item.hint }}</div>
        </div>
      </div>
    </section>

    <!-- Featured Projects Section -->
    <section class="projects-section">
      <div class="section-heading with-action">
        <span class="heading-eyebrow">{{ t('home.projects.title') }}</span>
        <a class="heading-action" @click.prevent="$router.push('/portfolio')" href="#">
          {{ t('home.projects.more') }} →
        </a>
      </div>
      <div class="projects-grid">
        <a
          v-for="(item, idx) in tm('home.projects.items')"
          :key="idx"
          :href="item.link"
          target="_blank"
          rel="noopener"
          class="project-card"
        >
          <div class="project-card-header">
            <span class="project-bullet"></span>
            <span class="project-stack">{{ item.stack }}</span>
          </div>
          <h3 class="project-name">{{ item.name }}</h3>
          <p class="project-desc">{{ item.desc }}</p>
          <span class="project-link">View on GitHub →</span>
        </a>
      </div>
    </section>

    <!-- Quotes Section (Refactored as "Comments") -->
    <section class="quotes-section">
      <div class="quote-card" v-for="(quote, index) in tm('home.quotes')" :key="index">
        <div class="quote-content">
          <span class="comment-prefix">// </span>
          <span class="quote-text">"{{ quote.text }}"</span>
        </div>
        <div class="quote-author">
           <span class="author-tag">{{ t(`home.quotes[${index}].author`) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';

const { t, tm } = useI18n();

const codeFocus = computed(() => tm('home.code.focus') as string[]);

useHead({
  title: computed(() => `${t('nav.home')} | ${t('app.title')}`)
})
</script>

<style scoped lang="less">
.home-container {
  min-height: 100vh;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  margin-bottom: 40px;
}

/* ========= 通用 section 标题 ========= */
.section-heading {
  margin-bottom: 36px;

  &.with-action {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 12px;
  }

  .heading-eyebrow {
    display: inline-block;
    font-family: var(--font-family-code);
    color: var(--color-text-tertiary);
    font-size: 0.95rem;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }

  .heading-title {
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.25;
  }

  .heading-action {
    font-family: var(--font-family-code);
    font-size: 0.95rem;
    color: var(--color-accent-primary);
    cursor: pointer;
    text-decoration: none;
    transition: var(--transition-fast);

    &:hover {
      transform: translateX(2px);
      text-decoration: none;
      color: lighten(#007acc, 10%);
    }
  }
}

/* ========= Focus Areas ========= */
.focus-section {
  padding: 50px 0;
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.focus-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 28px 24px;
  position: relative;
  transition: var(--transition-normal);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 0;
    background: var(--color-accent-primary);
    transition: height 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);

    &::before {
      height: 100%;
    }

    .focus-tag {
      color: var(--color-accent-primary);
    }
  }

  .focus-tag {
    display: inline-block;
    font-family: var(--font-family-code);
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    margin-bottom: 14px;
    letter-spacing: 1px;
    transition: var(--transition-fast);
  }

  .focus-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 10px 0;
    line-height: 1.35;
  }

  .focus-desc {
    font-size: 0.92rem;
    color: var(--color-text-secondary);
    line-height: 1.65;
    margin: 0;
  }
}

/* ========= Highlight Stats ========= */
.stats-section {
  padding: 50px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: var(--color-quote-bg);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent-primary);
  border-radius: 4px;
  padding: 24px 20px;
  transition: var(--transition-normal);

  &:hover {
    transform: translateY(-3px);
    border-color: var(--color-keyword);
    border-left-color: var(--color-keyword);
    background: var(--color-surface-hover);
    box-shadow: var(--shadow-md);

    .stat-value {
      color: var(--color-keyword);
      transform: translateX(2px);
    }
  }

  .stat-value {
    font-family: var(--font-family-code);
    font-size: 2.2rem;
    font-weight: 800;
    color: var(--color-accent-primary);
    line-height: 1;
    margin-bottom: 10px;
    transition: color 0.3s ease, transform 0.3s ease;
  }

  .stat-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 6px;
  }

  .stat-hint {
    font-family: var(--font-family-code);
    font-size: 0.78rem;
    color: var(--color-text-tertiary);
    line-height: 1.4;
  }
}

/* ========= Featured Projects ========= */
.projects-section {
  padding: 50px 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.project-card {
  display: flex;
  flex-direction: column;
  background: var(--color-code-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 24px;
  text-decoration: none;
  transition: var(--transition-normal);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);
    text-decoration: none;

    .project-link {
      color: var(--color-accent-primary);
      transform: translateX(4px);
    }

    .project-bullet {
      opacity: 1;
      transform: scale(1.15);
    }
  }

  .project-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .project-bullet {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-accent-primary);
    opacity: 0.55;
    transition: opacity 0.3s ease, transform 0.3s ease;
    flex-shrink: 0;
  }

  .project-stack {
    font-family: var(--font-family-code);
    font-size: 0.78rem;
    color: var(--color-text-secondary);
    letter-spacing: 0.4px;
  }

  .project-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 10px 0;
    line-height: 1.3;
  }

  .project-desc {
    font-size: 0.88rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0 0 18px 0;
    flex: 1;
  }

  .project-link {
    font-family: var(--font-family-code);
    font-size: 0.85rem;
    color: var(--color-accent-primary);
    transition: var(--transition-fast);
  }
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 60px;

  @media (max-width: 900px) {
    flex-direction: column-reverse;
    gap: 50px;
    text-align: center;
  }
}

.hero-text {
  flex: 1;

  .code-line {
    font-family: var(--font-family-code);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    padding: 10px 15px;
    background-color: var(--color-code-bg);
    border: 1px solid #333;
    border-radius: 4px;
    display: inline-block;

    .keyword { color: var(--color-keyword); } /* console - logic/variable/keyword depending on theme */
    .method { color: var(--color-accent-quaternary); } /* log - method */
    .string { color: var(--color-accent-secondary); }
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 20px;
    color: var(--color-text-primary);

    .highlight {
      color: var(--color-accent-primary);
      position: relative;
      display: inline-block;

      &::after {
        content: '';
        position: absolute;
        bottom: 5px;
        left: 0;
        width: 100%;
        height: 8px;
        background-color: rgba(0, 122, 204, 0.2);
        z-index: -1;
      }
    }
  }

  .hero-subtitle {
     font-size: 1.2rem;
     color: var(--color-text-secondary);
     margin-bottom: 40px;
  }

  .cta-group {
    display: flex;
    gap: 20px;

    @media (max-width: 900px) {
      justify-content: center;
    }
  }

  .btn {
    padding: 12px 30px;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    &-primary {
      background-color: var(--color-accent-primary);
      color: #fff;

      &:hover {
        background-color: lighten(#007acc, 5%);
        transform: translateY(-2px);
      }
    }

    &-secondary {
      background-color: transparent;
      border: 1px solid var(--color-text-secondary);
      color: var(--color-text-primary);


      &:hover {
        border-color: var(--color-text-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }
    }
  }
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;

  .code-window {
    width: 100%;
    max-width: 450px;
    background-color: var(--color-code-bg);
    border: 1px solid #333;
    border-radius: 8px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    overflow: hidden;

    .window-header {
      background-color: var(--color-window-header);
      padding: 10px 15px;
      display: flex;
      gap: 8px;
      border-bottom: 1px solid #333;

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;

        &.red { background-color: #ff5f56; }
        &.yellow { background-color: #ffbd2e; }
        &.green { background-color: #27c93f; }
      }
    }

    .window-body {
      padding: 24px;
      font-family: var(--font-family-code);
      font-size: 0.95rem;
      line-height: 1.6;
      color: #d4d4d4;

      .keyword { color: var(--color-keyword); }
      .variable { color: var(--color-text-primary); } /* Variable name usually plain text color or light blue in dark */
      .operator { color: var(--color-text-primary); }
      .property { color: var(--color-text-primary); } /* Object keys often light blue in dark, but plain in light */
      .string { color: var(--color-accent-secondary); }
    }
  }
}

.quotes-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 60px 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.quote-card {
  background-color: var(--color-quote-bg); /* Surface color */
  padding: 30px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent-primary);
  transition: var(--transition-normal);
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-3px);
    background-color: var(--color-surface-hover);
    border-color: var(--color-keyword);
    border-left-color: var(--color-keyword);
    box-shadow: var(--shadow-md);

    .quote-text {
      color: var(--color-text-secondary);
    }
  }

  .quote-content {
    display: flex;
    margin-bottom: 15px;

    .comment-prefix {
      color: var(--color-text-tertiary);
      margin-right: 10px;
      user-select: none;
    }

    .quote-text {
      color: var(--color-text-tertiary); /* Comment Color */
      font-family: var(--font-family-code);
      font-style: italic;
      font-size: 1.05rem;
      transition: color 0.3s ease;
    }
  }

  .quote-author {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;

    .author-tag {
      background-color: rgba(255,255,255,0.1);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
  }
}

@media (max-width: 767px) {
  .hero-section {
    min-height: auto;
    padding-top: 40px;
    margin-bottom: 40px;
  }

  .hero-content {
    flex-direction: column-reverse;
    gap: 40px;
  }

  .hero-text {
    width: 100%;
    text-align: center;

    .hero-title {
      font-size: 2rem;
    }
  }

  .hero-visual {
    width: 100%;

    .code-window {
      max-width: 100%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);

      .window-body {
        padding: 16px;
        font-size: 0.85rem;
      }
    }
  }

  .quotes-section {
    padding: 30px 0;
  }
}
</style>
