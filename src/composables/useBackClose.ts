/**
 * 移动端返回按钮拦截 composable（最终版）
 *
 * 1. 模块顶层注册 popstate 监听器（先于 vue-router）
 * 2. activate() 仅压栈 + 记住当前 history position
 * 3. popstate 时根据 position 判断方向：
 *    - 后退（position 减小）→ 拦截，关闭栈顶模态，forward() 恢复位置
 *    - 前进（position 增大）→ 不拦截，清空模态栈，让 vue-router 正常导航
 * 4. deactivate()（手动关闭）仅弹栈
 */
import { onUnmounted } from 'vue'

const closeStack: (() => void)[] = []
let skipCount = 0
// 首个模态打开时的 history position，用于判断 popstate 方向
let positionOnActivate: number | undefined

// ⚠️ 模块顶层注册：ES 模块评估顺序保证先于 vue-router
window.addEventListener('popstate', (event: PopStateEvent) => {
  // 跳过 forward() 产生的 popstate
  if (skipCount > 0) {
    skipCount--
    event.stopImmediatePropagation()
    return
  }

  // 无模态层时不拦截
  if (closeStack.length === 0) return

  // 通过 vue-router 存储在 history.state 中的 position 判断导航方向
  const newPos = history.state?.position as number | undefined
  const isBack = positionOnActivate !== undefined
    && newPos !== undefined
    && newPos < positionOnActivate

  if (isBack) {
    // 后退 → 拦截，关闭栈顶模态并恢复位置
    event.stopImmediatePropagation()
    const topClose = closeStack.pop()!
    topClose()
    // forward() 回到原位，skipCount 跳过其 popstate
    skipCount++
    history.forward()
    // 所有模态关闭后重置
    if (closeStack.length === 0) positionOnActivate = undefined
  } else {
    // 前进或其他导航 → 关闭所有模态，让 vue-router 正常处理
    const pending = [...closeStack]
    closeStack.length = 0
    positionOnActivate = undefined
    pending.forEach(close => close())
  }
})

export function useBackClose(onClose: () => void) {
  let active = false

  /** 打开模态时调用 */
  function activate() {
    if (active) return
    active = true
    // 首个模态打开时记录 position
    if (closeStack.length === 0) {
      positionOnActivate = history.state?.position as number | undefined
    }
    closeStack.push(onClose)
  }

  /** 手动关闭时调用 */
  function deactivate() {
    if (!active) return
    active = false
    const idx = closeStack.lastIndexOf(onClose)
    if (idx !== -1) closeStack.splice(idx, 1)
    if (closeStack.length === 0) positionOnActivate = undefined
  }

  /** 组件卸载时清理 */
  onUnmounted(() => {
    if (active) {
      active = false
      const idx = closeStack.lastIndexOf(onClose)
      if (idx !== -1) closeStack.splice(idx, 1)
      if (closeStack.length === 0) positionOnActivate = undefined
    }
  })

  return { activate, deactivate }
}
