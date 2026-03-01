<template>
  <div class="footer-container">
    <div class="footer-content">
      <div class="social-links">
        <a href="https://space.bilibili.com/10648168" target="_blank" class="social-item" title="Bilibili">
          <img src="@/assets/social_media_icons/bilibili.svg" alt="Bilibili" class="social-icon" />
        </a>
        <a href="https://www.douyin.com/user/MS4wLjABAAAAFFxO6T_aOrvOqoQXG8Fwv5wXOnSaAPFzQDEJVN_QLhQ" target="_blank" class="social-item" title="Douyin">
          <img src="@/assets/social_media_icons/douyin.svg" alt="Douyin" class="social-icon douyin-icon" />
        </a>
        <a href="https://xhslink.com/m/3gbekZOrRlV" target="_blank" class="social-item" title="Xiaohongshu">
          <img src="@/assets/social_media_icons/xiaohongshu.svg" alt="Xiaohongshu" class="social-icon" />
        </a>
        <a href="https://weibo.com/u/5901045669" target="_blank" class="social-item" title="Weibo">
          <img src="@/assets/social_media_icons/weibo.svg" alt="Weibo" class="social-icon weibo-style" />
        </a>
        <a href="https://gitee.com/tallmessiwu" target="_blank" class="social-item" title="Gitee">
          <img src="@/assets/social_media_icons/gitee.svg" alt="Gitee" class="social-icon gitee-style" />
        </a>
        <a href="https://www.instagram.com/tallmessiwu/" target="_blank" class="social-item instagram-style" title="Instagram">
          <img src="@/assets/social_media_icons/instagram.png" alt="Instagram" class="social-icon instagram-icon" />
        </a>
        <a href="https://github.com/TallMessiWu" target="_blank" class="social-item" title="GitHub">
          <img src="@/assets/social_media_icons/github.svg" alt="GitHub" class="social-icon github-style" />
        </a>
      </div>
      <p class="copyright">{{ t('footer.rights') }}</p>
      <a class="icp-link" href="https://beian.miit.gov.cn/" target="_blank">苏ICP备2026009767号</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped lang="less">
.footer-container {
  width: 100%;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 2rem 0;
  margin-top: 4rem;
}

.footer-content {
  text-align: center;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;

  .social-item {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      filter: drop-shadow(0 0 8px rgba(0, 122, 204, 0.4));
      opacity: 0.8;
    }

    .social-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .instagram-icon {
      width: 35px;
      height: 35px;
      clip-path: circle(48% at center);
    }

    .douyin-icon {
      width: 28px;
      height: 28px;
    }
  }
  .weibo-style {
    background-color: #ffffff;
    border-radius: 50%;
    padding: 2px;
  }

  .gitee-style {
    background: radial-gradient(circle closest-side, #ffffff 85%, transparent 85%);
    border-radius: 50%;
  }

  .instagram-style {
    background: radial-gradient(circle closest-side, #ffffff 60%, transparent 60.5%);
    border-radius: 50%;
  }

  .github-style {
    background: radial-gradient(circle closest-side, #ffffff 88%, transparent 85%);
    border-radius: 50%;
    filter: invert(1);
  }
}

.copyright {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-family: var(--font-family-base);
  margin-bottom: 0.5rem;
}

.icp-link {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    text-decoration: underline;
  }
}
</style>

<style lang="less">
/* 全局样式覆盖，确保优先级 */
[data-theme='light'] .footer-container .social-links .weibo-style {
  background-color: transparent !important;
  padding: 0 !important;
}

[data-theme='light'] .footer-container .social-links .github-style {
  filter: none !important;
}
</style>
