![中文](https://img.shields.io/badge/语言-中文-red) [![English](https://img.shields.io/badge/Lang-English-blue)](./GUIDE.en.md)

# 云数据库数据录入指南

本文档说明了腾讯云开发 (CloudBase) 数据库中 `posts` 集合（用于日常动态）及 `collections` 集合（用于作品集展示）的数据结构规范。**请在云开发控制台或后台管理系统中根据本规范录入数据。**

## 1. `posts` 集合 (日常动态)

集合中的每个文档（Document）包含以下字段：

### 核心属性

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `_id` | `string` | 是 | 唯一标识符。云数据库自动生成，无需手动填写。 |
| `title` | `string` | 是 | 动态标题。 |
| `content` | `string` | 否 | 动态正文，支持使用 `\n` 换行。 |
| `date` | `string` | 是 | 发布日期，格式需为 `YYYY-MM-DD HH:mm`。 |
| `pinned` | `boolean` | 否 | 是否置顶。置顶内容会显示在列表最前面。 |

### 媒体属性

#### `images` (图片数组)
`images` 字段是一个包含多个 `ImageItem` 的对象数组：

- `image`: **原图 (高清)**。用于全屏 Viewer 展示。可以是云存储 `cloud://` 协议链接或外部 http 链接。
- `thumbnail`: **缩略图 (低清)**。用于瀑布流卡片和模态框预览。*强烈建议提供以优化加载速度。*
- `video`: **Live Photo 视频链接**。若提供，该图片将作为 Live Photo 处理，在详情页自动播放。

#### `video` (外部视频)
- `video`: 用于 Bilibili 等外部视频链接。目前支持自动识别并嵌入 B站 BVID。

---

### `posts` 示例配置

#### 1. 纯标题 (Title Only)
```typescript
{
  title: '今日心情：晴',
  date: '2024-02-19 09:00'
}
```

#### 2. 纯文字 (Text Only)
```typescript
{
  title: '读书笔记',
  content: '今天读了《黑客与画家》，感悟良多。\n世界在变，但创造力永恒。',
  date: '2024-02-19 10:30'
}
```

#### 3. 单张图片 (Single Image)
```typescript
{
  title: '午后咖啡',
  images: [
    {
      image: 'cloud://your-env-id.ext/assets/daily/coffee-hd.jpg',
      thumbnail: 'cloud://your-env-id.ext/assets/daily/coffee-thumb.jpg'
    }
  ],
  date: '2024-02-19 14:00'
}
```

#### 4. 多张图片包含 Live Photo
```typescript
{
  title: '洱海日落',
  images: [
    {
      image: 'cloud://your-env-id.ext/assets/daily/sunset-static.jpg',
      thumbnail: 'cloud://your-env-id.ext/assets/daily/sunset-static-t.jpg'
    },
    {
      image: 'cloud://your-env-id.ext/assets/daily/sunset-live.jpg',
      thumbnail: 'cloud://your-env-id.ext/assets/daily/sunset-live-t.jpg',
      video: 'cloud://your-env-id.ext/assets/daily/sunset-live.mov' // Live Photo 视频
    }
  ],
  date: '2024-02-19 18:20'
}
```

#### 5. Bilibili 视频
```typescript
{
  title: '推荐一个超赞的视频',
  content: '这个视频讲得非常透彻。',
  video: 'https://www.bilibili.com/video/BV1v63xz3EwX/',
  images: [{ image: 'cloud://your-env-id.ext/assets/daily/video-cover.jpg' }], // B站视频建议手动配一个封面图
  date: '2024-02-19 20:00'
}
```

---

## 2. `collections` 集合 (作品集)

集合中的每个文档包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `_id` | `string` | 是 | 唯一标识符。云数据库自动生成，无需手动填写。 |
| `name` | `string` | 是 | 作品集名称。 |
| `thumbnail` | `string` | 否 | 封面图链接 (云存储 ID 或外链)。若留空，则系统会自动从 `posts` 中的第一个带图片的 Post 里截取。 |
| `posts` | `string[]` | 是 | 该作品集包含的 `posts` 的 `_id` 集合。 |
| `latestPostDate` | `string` | 是 | 最近更新的日期，格式需为 `YYYY-MM-DD HH:mm`。 |
| `pinned` | `boolean` | 否 | 是否置顶。 |

### `collections` 示例配置

```typescript
{
  name: '川西旅拍 2024',
  thumbnail: '', // 留空则自动 fallback 到它包含的帖子的图片
  posts: [
    'fcc24a0d66c1b35b0028e37e57c61cd6',
    '342cb25d66c1b38f00223df40ccbb186'
  ],
  latestPostDate: '2024-05-12 10:00',
  pinned: true
}
```
