<template>
  <div class="footer-container">
    <div class="footer-content">
      <div class="social-links">
        <a href="https://space.bilibili.com/10648168" target="_blank" class="social-item" title="Bilibili">
          <img src="@/assets/social_media_icons/bilibili.svg" alt="Bilibili" class="social-icon" />
        </a>
        <a href="https://www.douyin.com/user/MS4wLjABAAAAFFxO6T_aOrvOqoQXG8Fwv5wXOnSaAPFzQDEJVN_QLhQ" target="_blank" class="social-item" title="Douyin">
          <img src="@/assets/social_media_icons/douyin.svg" alt="Douyin" class="social-icon" />
        </a>
        <a href="https://www.xiaohongshu.com/user/profile/5f410e55000000000101e908" target="_blank" class="social-item" title="Xiaohongshu">
          <img src="@/assets/social_media_icons/xiaohongshu.svg" alt="Xiaohongshu" class="social-icon" />
        </a>
        <a href="https://weibo.com/u/5901045669" target="_blank" class="social-item" title="Weibo">
          <img src="@/assets/social_media_icons/weibo.svg" alt="Weibo" class="social-icon" />
        </a>
        <a href="https://gitee.com/tallmessiwu" target="_blank" class="social-item" title="Gitee">
          <img src="@/assets/social_media_icons/gitee.svg" alt="Gitee" class="social-icon" />
        </a>
        <a href="https://www.instagram.com/tallmessiwu/" target="_blank" class="social-item" title="Instagram">
          <img src="@/assets/social_media_icons/instagram.png" alt="Instagram" class="social-icon instagram-icon" />
        </a>
        <a href="https://github.com/TallMessiWu" target="_blank" class="social-item" title="GitHub">
          <img src="@/assets/social_media_icons/github.svg" alt="GitHub" class="social-icon" />
        </a>
      </div>
      <p class="copyright">{{ t('footer.rights') }}</p>
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
    }
  }
}

.copyright {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-family: var(--font-family-base);
}
</style>
