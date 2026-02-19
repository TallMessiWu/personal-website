import { db, ensureAuth } from '@/utils/tcb';

export type ImageItem = { image: string; thumbnail?: string; video?: string };

export interface Post {
  id: string | number; // 兼容数据库 _id (string) 和 旧版 id (number)
  title: string;
  content?: string;
  images?: ImageItem[]; // Optional for text-only posts
  video?: string; // Still used for Bilibili links for now
  date: string;
  pinned?: boolean;
}

/**
 * 从云开发数据库拉取所有日常动态数据
 */
export const fetchPostsFromCloud = async (): Promise<Post[]> => {
  try {
    // 确保在查询前已进行匿名登录
    await ensureAuth();

    const res = await db.collection('posts')
      .limit(100) // 默认拉取前100条，后续可配合分页
      .get();

    if (res.data) {
      return res.data.map((item: any) => ({
        ...item,
        id: item._id || item.id // 优先使用云数据库的 _id 作为唯一标识
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch posts from CloudBase:', error);
    return [];
  }
};

// 保留此导出用于类型兼容，但内容为空，实际数据通过 fetchPostsFromCloud 获取
export const dailyData: Post[] = [];
