![中文](https://img.shields.io/badge/语言-中文-red) [![English](https://img.shields.io/badge/Lang-English-blue)](./GUIDE.en.md)

# 日常 数据填写指南

本文档说明了如何配置 `src/data/dailyData.ts` 中的动态内容。

## 数据结构

`dailyData` 是一个 `Post` 类型的数组。每个对象包含以下字段：

### 核心属性

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `number` | 是 | 唯一标识符，递增即可。 |
| `title` | `string` | 是 | 动态标题。 |
| `content` | `string` | 否 | 动态正文，支持使用 `\n` 换行。 |
| `date` | `string` | 是 | 发布日期，格式需为 `YYYY-MM-DD HH:mm`。 |
| `pinned` | `boolean` | 否 | 是否置顶。置顶内容会显示在列表最前面。 |

### 媒体属性

#### `images` (图片数组)
`images` 字段是一个包含多个 `ImageItem` 的对象数组：

- `image`: **原图 (高清)**。用于全屏 Viewer 展示。
- `thumbnail`: **缩略图 (低清)**。用于瀑布流卡片和模态框预览。*强烈建议提供以优化加载速度。*
- `video`: **Live Photo 视频链接**。若提供，该图片将作为 Live Photo 处理，在详情页自动播放。

#### `video` (外部视频)
- `video`: 用于 Bilibili 等外部视频链接。目前支持自动识别并嵌入 B站 BVID。

---

## 示例配置

### 1. 纯标题 (Title Only)
```typescript
{
  id: 1,
  title: '今日心情：晴',
  date: '2024-02-19 09:00'
}
```

### 2. 纯文字 (Text Only)
```typescript
{
  id: 2,
  title: '读书笔记',
  content: '今天读了《黑客与画家》，感悟良多。\n世界在变，但创造力永恒。',
  date: '2024-02-19 10:30'
}
```

### 3. 单张图片 (Single Image)
```typescript
{
  id: 3,
  title: '午后咖啡',
  images: [
    {
      image: '/assets/daily/coffee-hd.jpg',
      thumbnail: '/assets/daily/coffee-thumb.jpg'
    }
  ],
  date: '2024-02-19 14:00'
}
```

### 4. 多张图片 (Multiple Images)
```typescript
{
  id: 4,
  title: '周末扫街',
  images: [
    { image: '/assets/daily/street-1.jpg', thumbnail: '/assets/daily/street-1-t.jpg' },
    { image: '/assets/daily/street-2.jpg', thumbnail: '/assets/daily/street-2-t.jpg' },
    { image: '/assets/daily/street-3.jpg', thumbnail: '/assets/daily/street-3-t.jpg' }
  ],
  date: '2024-02-19 16:30'
}
```

### 5. 多张图包含 Live Photo
```typescript
{
  id: 5,
  title: '洱海日落',
  images: [
    {
      image: '/assets/daily/sunset-static.jpg',
      thumbnail: '/assets/daily/sunset-static-t.jpg'
    },
    {
      image: '/assets/daily/sunset-live.jpg',
      thumbnail: '/assets/daily/sunset-live-t.jpg',
      video: '/assets/daily/sunset-live.mov' // Live Photo 视频
    }
  ],
  date: '2024-02-19 18:20'
}
```

### 6. Bilibili 视频
```typescript
{
  id: 6,
  title: '推荐一个超赞的视频',
  content: '这个视频讲得非常透彻。',
  video: 'https://www.bilibili.com/video/BV1v63xz3EwX/',
  images: [{ image: '/assets/daily/video-cover.jpg' }], // B站视频建议手动配一个封面图
  date: '2024-02-19 20:00'
}
```
