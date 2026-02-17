export type ImageItem = { image: string; video?: string };

export interface Post {
  id: number;
  title: string;
  content?: string;
  images?: ImageItem[]; // Optional for text-only posts
  video?: string; // Still used for Bilibili links for now
  date: string;
  pinned?: boolean;
}

export const dailyData: Post[] = [
  {
    id: 0,
    title: '秋天的第一杯咖啡',
    images: [{ image: 'https://placehold.co/500x700/6f4e37/fff.png?text=Coffee&font=roboto' }],
    date: '2023-09-28 14:30'
  },
  {
    id: 1,
    title: '新入手的机械键盘',
    content: '终于拔草了这款种草很久的机械键盘。红轴的手感轻盈，声音不大，很适合在办公室使用。换了套复古配色的键帽，颜值爆表。\n\n工欲善其事，必先利其器。好的工具确实能提升幸福感。',
    images: [{ image: 'https://placehold.co/600x400/333333/eee.png?text=Keyboard&font=roboto' }],
    date: '2023-10-01 10:15'
  },
  {
    id: 2,
    title: '极简生活',
    date: '2023-10-05 09:00'
  },
  {
    id: 3,
    title: '一个短暂的想法',
    content: '',
    date: '2023-10-08 23:45'
  },
  {
    id: 4,
    title: '雨天随想',
    content: '下雨天总是能让人静下来思考。听着窗外的雨声，心情变得平和。思考一下未来的规划，或者单纯的发发呆，都是一种享受。\n\n雨后的空气很清新，泥土的味道让人放松。希望明天是个好天气。',
    date: '2023-10-10 16:20'
  },
  {
    id: 5,
    title: '美味的晚餐尝试',
    content: '尝试了一个新菜谱——红烧肉。虽然卖相一般，颜色不够红亮，但味道超赞，肥而不腻。做饭就像编程，步骤是算法，火候是参数，调料是配置。\n\n下次试试糖醋排骨，争取视觉效果也能跟上。',
    images: [{ image: 'https://placehold.co/600x600/1e1e1e/333.png?text=Food&font=roboto' }],
    date: '2023-10-12 19:30'
  },
  {
    id: 6,
    title: '读书笔记：《黑客与画家》',
    content: '读了《黑客与画家》，对创造力的观点感触很深。保罗·格雷厄姆认为黑客和画家都是创作者。我们都需要通过不断的尝试和修正，来在这个世界上创造优秀的作品。\n\n书中还谈到了财富、设计和品味，给了我很多技术之外的视角。强烈推荐给每一位程序员。',
    images: [{ image: 'https://placehold.co/600x800/1e1e1e/333.png?text=Book&font=roboto' }],
    date: '2023-10-15 21:00'
  },
  {
    id: 7,
    title: '吉他练习：晴天',
    content: '练习《晴天》很久了，终于录了一个满意的版本。周杰伦的这首歌充满了青春的回忆。指弹的编配很有挑战性，特别是泛音部分。\n\n录了个视频记录一下。虽然不完美，但是很满足。音乐让人忘却烦恼，专注于当下的美好。',
    video: 'placeholder',
    // Video with custom cover
    images: [{ image: 'https://placehold.co/600x400/5e3a2a/fff.png?text=Guitar+Cover&font=roboto' }],
    date: '2023-10-18 20:45',
    pinned: true
  },
  {
    id: 8,
    title: '代码重构心得',
    content: '重构了核心模块，代码现在感觉优雅多了。之前逻辑混乱的地方，现在井井有条。虽然花了不少时间，但看到效率提升 30%，一切都值了。\n\n写代码就像写诗，结构是韵律，逻辑是意境。完美的代码是程序员的浪漫。',
    date: '2023-10-20 15:50'
  },
  {
    id: 9,
    title: '周末摄影扫街',
    content: '趁着周末阳光正好，带着相机去了老城区。石板路 and 斑驳的墙壁诉说着历史的故事。拍了很多照片，记录下这一刻的心情。\n\n远离城市的喧嚣，只有鸟鸣 and 微风。在河边的茶馆坐了一个下午，看着人来人往，时间仿佛变慢了。',
    // Multiple images example
    images: [
      { image: 'https://placehold.co/600x400/1e1e1e/333.png?text=Photo+1&font=roboto' },
      { image: 'https://placehold.co/600x400/2a2a2a/444.png?text=Photo+2&font=roboto' },
      { image: 'https://placehold.co/600x400/333333/555.png?text=Photo+3&font=roboto' },
      { image: 'https://placehold.co/600x800/444444/666.png?text=Vertical+Photo&font=roboto' }
    ],
    date: '2023-10-21 11:45'
  },
  {
    id: 10,
    title: '我的 2023 年度总结',
    content: '这一年，经历了许多挑战与成长，是时候停下来回顾一下了。从技术的精进到生活的感悟，每一个瞬间都值得铭记。\n\n感谢所有遇到的朋友，感谢努力的自己。期待 2024 会更好！恐',
    images: [{ image: 'https://placehold.co/600x400/1e1e1e/333.png?text=2023+Summary&font=roboto' }],
    date: '2023-12-31 23:59',
    pinned: true
  },
  {
    id: 11,
    title: 'B站视频分享',
    content: '这是我看过的一个非常意思的视频，推荐给大家！',
    video: 'https://www.bilibili.com/video/BV1v63xz3EwX/?spm_id_from=333.1387.0.0&vd_source=ece2e89ce7a7116890ea60f8bfe56da4',
    // Cover image fetched from Bilibili API (Proxied to bypass 403)
    images: [{ image: 'https://images.weserv.nl/?url=i1.hdslb.com/bfs/archive/2b451fc1ea064694f2ab3003b3e25bf6ee7c977b.jpg' }],
    date: '2025-07-03 17:30'
  },
  {
    id: 12,
    title: 'Live Photo 测试',
    content: '这是一条包含普通图片和 Live Photo 的动态。Live Photo 应该会在左上角显示图标，并且支持自动播放。',
    images: [
      { image: 'https://placehold.co/600x800/1e1e1e/333.png?text=Static+Image+1' },
      {
        image: 'https://placehold.co/600x800/2a2a2a/444.png?text=Live+Photo+Cover',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4'
      },
      { image: 'https://placehold.co/600x800/333333/555.png?text=Static+Image+2' }
    ],
    date: '2025-07-04 10:00'
  },
  {
    id: 13,
    title: 'Live Photo 测试2',
    content: '这是一条包含普通图片和 Live Photo 的动态。Live Photo 应该会在左上角显示图标，并且支持自动播放。',
    images: [
      {
        image: 'https://placehold.co/600x800/2a2a2a/444.png?text=Live+Photo+Cover',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4'
      },
      { image: 'https://placehold.co/600x800/333333/555.png?text=Static+Image+2' }
    ],
    date: '2025-07-04 10:00'
  }
];
