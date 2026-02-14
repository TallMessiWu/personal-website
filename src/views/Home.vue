<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <div class="code-line">
            <span class="keyword">console</span>.<span class="method">log</span>(<span class="string">"Hello, World!"</span>);
          </div>
          <h1 class="hero-title">
            Creative <span class="highlight">Developer</span> & <br>
            Content <span class="highlight">Creator</span>
          </h1>
          <p class="hero-subtitle">Exploring the boundary between code and art.</p>

          <div class="cta-group">
            <button class="btn btn-primary" @click="$router.push('/portfolio')">View Work</button>
            <button class="btn btn-secondary" @click="$router.push('/about')">Contact Me</button>
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
  <span class="property">name</span>: <span class="string">'TallMessiwu'</span>,
  <span class="property">role</span>: <span class="string">'Developer'</span>,
  <span class="property">skills</span>: [
    <span class="string">'Vue.js'</span>,
    <span class="string">'TypeScript'</span>,
    <span class="string">'Design'</span>
  ],
  <span class="property">status</span>: <span class="string">'Coding...'</span>
};</code></pre>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quotes Section (Refactored as "Comments") -->
    <section class="quotes-section">
      <div class="quote-card">
        <div class="quote-content">
          <span class="comment-prefix">// </span>
          <span class="quote-text">"Hardships often prepare ordinary people for an extraordinary destiny."</span>
        </div>
        <div class="quote-author">
           <span class="author-tag">@CS_Lewis</span>
        </div>
      </div>

      <div class="quote-card">
        <div class="quote-content">
          <span class="comment-prefix">// </span>
          <span class="quote-text">"This is absolute fire!"</span>
        </div>
        <div class="quote-author">
           <span class="author-tag">@Me</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('nav.home')} | ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: 'Welcome to the personal website of TallMessiwu. Explore my portfolio, daily life, and creative projects.'
    }
  ]
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
  min-height: 80vh;
  margin-bottom: 60px;
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
        background-color: rgba(255,255,255,0.05);
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
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 60px 0;
  flex-wrap: wrap;
}

.quote-card {
  background-color: var(--color-quote-bg); /* Surface color */
  padding: 30px;
  border-radius: 6px;
  border-left: 3px solid var(--color-accent-tertiary);
  width: 100%;
  max-width: 500px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    background-color: #2a2d2e;
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
    }
  }

  .quote-author {
    display: flex;
    justify-content: flex-end;

    .author-tag {
      background-color: rgba(255,255,255,0.1);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
  }
}
</style>
