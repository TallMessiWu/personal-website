import app, { db, ensureAuth } from '@/utils/tcb';

export type ImageItem = { image: string; thumbnail?: string; video?: string };

export interface Post {
  _id: string; // 云数据库自动生成的唯一标识符
  title: string;
  content?: string;
  images?: ImageItem[]; // Optional for text-only posts
  video?: string; // Still used for Bilibili links for now
  date: string;
  pinned?: boolean;
}

/**
 * 判断是否为腾讯云存储 fileid
 */
const isFileId = (path: string | undefined): boolean => {
  if (!path) return false;
  return path.startsWith('cloud://');
};

/**
 * 从云开发数据库拉取所有日常动态数据
 */
export const fetchPostsFromCloud = async (): Promise<Post[]> => {
  try {
    // 确保在查询前已进行匿名登录
    await ensureAuth();

    const res = await db.collection('posts')
      .orderBy('date', 'desc')
      .limit(100)
      .get();

    if (res.data && res.data.length > 0) {
      const posts = res.data as Post[];

      // 提取所有需要解析的 fileId
      const fileIdSet = new Set<string>();
      posts.forEach((post: Post) => {
        if (post.images) {
          post.images.forEach(img => {
            if (isFileId(img.image)) fileIdSet.add(img.image);
            if (isFileId(img.thumbnail)) fileIdSet.add(img.thumbnail!);
            if (isFileId(img.video)) fileIdSet.add(img.video!);
          });
        }
        if (isFileId(post.video)) fileIdSet.add(post.video!);
      });

      const fileIds = Array.from(fileIdSet);
      if (fileIds.length > 0) {
        // 批量获取临时链接
        const res = await app.getTempFileURL({
          fileList: fileIds
        });

        const fileList = res.fileList || [];
        const fileMap = new Map<string, string>();
        fileList.forEach((item: any) => {
          if (item.tempFileURL) {
            fileMap.set(item.fileID, item.tempFileURL);
          }
        });

        // 替换 fileId 为真实链接
        posts.forEach((post: Post) => {
          if (post.images) {
            post.images.forEach(img => {
              if (isFileId(img.image)) img.image = fileMap.get(img.image) || img.image;
              if (isFileId(img.thumbnail)) img.thumbnail = fileMap.get(img.thumbnail!) || img.thumbnail;
              if (isFileId(img.video)) img.video = fileMap.get(img.video!) || img.video;
            });
          }
          if (isFileId(post.video)) post.video = fileMap.get(post.video!) || post.video;
        });
      }

      return posts;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch posts from CloudBase:', error);
    return [];
  }
};

// 保留此导出用于类型兼容，但内容为空，实际数据通过 fetchPostsFromCloud 获取
export const dailyData: Post[] = [];
