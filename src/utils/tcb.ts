import cloudbase from '@cloudbase/js-sdk';

const envId = 'personal-website-7fwdtxlf7d9abbe';

// 初始化 CloudBase
const app = cloudbase.init({
  env: envId
});

const auth = app.auth();

/**
 * 确保已登录（使用匿名登录）
 */
export const ensureAuth = async () => {
  const loginState = await auth.getLoginState();
  if (!loginState) {
    // 尝试不同的登录方法以兼容 SDK 版本
    if (typeof (auth as any).signInAnonymously === 'function') {
        await (auth as any).signInAnonymously();
    } else {
        await (auth as any).anonymousAuthProvider().signIn();
    }
  }
};

// 获取数据库引用
export const db = app.database();

export default app;
