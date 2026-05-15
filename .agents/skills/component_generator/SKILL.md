---
name: component_generator
description: 按照项目规范自动生成 Vue 3 组件模板（script setup + TS + Less）。
---

# Vue 组件脚手架 (component_generator)

此 Skill 用于快速创建符合项目规范的新组件。

## 核心职责
1.  **标准化模板**: 使用 `script setup`, `TypeScript`, 和 `Less (scoped)`。
2.  **默认结构**: 包含 `props`, `emits` 声明和基础的 CSS 类名。
3.  **自动关联**: 生成组件后，提醒用户在需要的地方引入。

## 执行步骤

### 1. 收集信息
询问（或从上下文推断）：
-   **组件名称**: 大驼峰命名（例如：`UserCard`）。
-   **放置路径**: 默认为 `src/components/`。
-   **主要功能**: 功能简述，以便添加注释。

### 2. 生成文件
根据以下模板生成对应的 `.vue` 文件：

```vue
<script setup lang="ts">
/**
 * [组件名称]
 * [功能简述]
 */

// Props 定义
const props = defineProps<{
  // 示例: title: string
}>()

// Emits 定义
const emit = defineEmits<{
  // 示例: (e: 'change', id: number): void
}>()
</script>

<template>
  <div class="[短横线风格命名]-container">
    <!-- 组件内容 -->
  </div>
</template>

<style scoped lang="less">
.[短横线风格命名]-container {
  // 基础样式
}
</style>
```

### 3. 后续处理
-   检查是否需要添加国际化 Key（结合 `i18n_helper`）。
-   提醒用户组件已创建并准备好被导入。

## 注意事项
-   组件命名必须具有语义化。
-   坚持 KISS 原则，不要在模板中添加过多的预设逻辑。
