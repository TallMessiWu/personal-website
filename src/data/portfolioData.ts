import app, { db, ensureAuth } from '@/utils/tcb';

// 云数据库 posts 表中的 Post 类型（复用 dailyData 的定义）
import type { Post, ImageItem } from '@/data/dailyData';

export interface Collection {
  _id: string;
  name: string;
  thumbnail: string;       // 可能为空字符串
  posts: string[];          // post _id 数组
  latestPostDate: string;   // "YYYY-MM-DD HH:mm"
  pinned: boolean;
}

/** 展示用的合集（thumbnail 已解析为可用 URL） */
export interface CollectionDisplay {
  _id: string;
  name: string;
  thumbnail: string;  // 解析后的封面 URL
  postCount: number;
  latestPostDate: string;
  pinned: boolean;
}

/**
 * 判断是否为腾讯云存储 fileId
 */
const isFileId = (path: string | undefined): boolean => {
  if (!path) return false;
  return path.startsWith('cloud://');
};

/**
 * 批量将 fileId 转为临时 URL
 */
const resolveFileIds = async (fileIds: string[]): Promise<Map<string, string>> => {
  const fileMap = new Map<string, string>();
  if (fileIds.length === 0) return fileMap;

  const res = await app.getTempFileURL({ fileList: fileIds });
  const fileList = res.fileList || [];
  fileList.forEach((item: any) => {
    if (item.tempFileURL) {
      fileMap.set(item.fileID, item.tempFileURL);
    }
  });
  return fileMap;
};

/**
 * 从云数据库拉取合集列表，并处理封面 fallback 和 fileId 解析
 */
export const fetchCollectionsFromCloud = async (): Promise<CollectionDisplay[]> => {
  try {
    await ensureAuth();

    // 1. 拉取所有 collections
    const res = await db.collection('collections')
      .limit(100)
      .get();

    if (!res.data || res.data.length === 0) return [];

    const collections = res.data as Collection[];

    // 2. 收集需要 fallback 封面的合集（thumbnail 为空）
    const needFallback = collections.filter(c => !c.thumbnail);

    // 收集所有需要查询的 post _id（去重）
    const postIdsToQuery = new Set<string>();
    needFallback.forEach(c => {
      c.posts.forEach(pid => postIdsToQuery.add(pid));
    });

    // 3. 批量查询这些 posts（用于 fallback 封面）
    let postsMap = new Map<string, Post>();
    if (postIdsToQuery.size > 0) {
      const postIds = Array.from(postIdsToQuery);
      // 云数据库 where in 限制 500，这里一般不会超
      const _ = db.command;
      const postRes = await db.collection('posts')
        .where({ _id: _.in(postIds) })
        .limit(500)
        .get();

      if (postRes.data) {
        (postRes.data as Post[]).forEach(p => {
          postsMap.set(p._id, p);
        });
      }
    }

    // 4. 为无封面的合集寻找 fallback
    const fallbackThumbnails = new Map<string, string>();
    needFallback.forEach(c => {
      for (const pid of c.posts) {
        const post = postsMap.get(pid);
        if (!post) continue;

        // 优先 thumbnail，再 image
        if (post.images && post.images.length > 0) {
          for (const img of post.images) {
            if (img.thumbnail) {
              fallbackThumbnails.set(c._id, img.thumbnail);
              return;
            }
            if (img.image) {
              fallbackThumbnails.set(c._id, img.image);
              return;
            }
          }
        }
      }
    });

    // 5. 收集所有需要解析的 fileId
    const fileIdSet = new Set<string>();
    collections.forEach(c => {
      const thumb = c.thumbnail || fallbackThumbnails.get(c._id) || '';
      if (isFileId(thumb)) fileIdSet.add(thumb);
    });

    // 6. 批量解析 fileId → 临时 URL
    const fileMap = await resolveFileIds(Array.from(fileIdSet));

    // 7. 组装展示数据
    const displayList: CollectionDisplay[] = collections.map(c => {
      let thumbnail = c.thumbnail || fallbackThumbnails.get(c._id) || '';
      if (isFileId(thumbnail)) {
        thumbnail = fileMap.get(thumbnail) || thumbnail;
      }

      return {
        _id: c._id,
        name: c.name,
        thumbnail,
        postCount: c.posts.length,
        latestPostDate: c.latestPostDate,
        pinned: c.pinned,
      };
    });

    // 8. 排序：pinned 优先 → latestPostDate 降序
    displayList.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.latestPostDate).getTime() - new Date(a.latestPostDate).getTime();
    });

    return displayList;
  } catch (error) {
    console.error('Failed to fetch collections from CloudBase:', error);
    return [];
  }
};
