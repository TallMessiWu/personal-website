import app, { db, ensureAuth } from '@/utils/tcb';

export type ImageItem = { image: string; thumbnail?: string; video?: string };

export interface Post {
  _id: string;
  title: string;
  content?: string;
  images?: ImageItem[];
  video?: string;
  date: string;
  pinned?: boolean;
}

const isFileId = (path: string | undefined): boolean => {
  if (!path) return false;
  return path.startsWith('cloud://');
};

export const fetchPostsFromCloud = async (): Promise<Post[]> => {
  try {
    await ensureAuth();

    const res = await db.collection('posts')
      .orderBy('date', 'desc')
      .limit(100)
      .get();

    if (res.data && res.data.length > 0) {
      const posts = res.data as Post[];

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
        const fileMap = new Map<string, string>();
        for (let attempt = 0; attempt < 4; attempt++) {
          if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
          try {
            const res = await app.getTempFileURL({ fileList: fileIds });
            const fileList = res.fileList || [];
            fileMap.clear();
            fileList.forEach((item: any) => {
              if (item.tempFileURL) {
                fileMap.set(item.fileID, item.tempFileURL);
              }
            });
            if (fileMap.size > 0 && attempt >= 1) break;
          } catch {
            // SDK 冷启动，重试
          }
        }

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

export const dailyData: Post[] = [];
