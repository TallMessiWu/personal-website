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

/**
 * 根据合集 ID 获取其包含的所有 Post
 */
export const fetchPostsByCollectionId = async (collectionId: string): Promise<Post[]> => {
  try {
    await ensureAuth();

    // 1. 获取合集详情
    const collRes = await db.collection('collections').doc(collectionId).get();
    let postsIds: string[] = [];

    if (collRes.data && collRes.data.length > 0) {
      // 兼容 list 获取和 doc 获取的差异
      const coll = (Array.isArray(collRes.data) ? collRes.data[0] : collRes.data) as Collection;
      postsIds = coll.posts || [];
    } else {
      // 尝试通过 where 查询（防止 docId 与 _id 不一致的情况）
      const collResById = await db.collection('collections').where({ _id: collectionId }).get();
      if (collResById.data && collResById.data.length > 0) {
        postsIds = (collResById.data[0] as Collection).posts || [];
      }
    }

    if (postsIds.length === 0) return [];

    // 2. 批量获取 posts
    const _ = db.command;
    const postRes = await db.collection('posts')
      .where({
        _id: _.in(postsIds)
      })
      .limit(500)
      .get();

    if (!postRes.data || postRes.data.length === 0) return [];

    const rawPosts = postRes.data as Post[];

    // 3. 处理作品中的 fileId (封面图、图片列表等)
    const fileIdSet = new Set<string>();
    rawPosts.forEach(p => {
      if (p.images) {
        p.images.forEach(img => {
          if (img.image && isFileId(img.image)) fileIdSet.add(img.image);
          if (img.thumbnail && isFileId(img.thumbnail)) fileIdSet.add(img.thumbnail);
        });
      }
    });

    const fileMap = await resolveFileIds(Array.from(fileIdSet));

    return rawPosts.map(p => {
       if (p.images) {
         p.images = p.images.map(img => ({
           ...img,
           image: isFileId(img.image) ? fileMap.get(img.image!) || img.image : img.image,
           thumbnail: isFileId(img.thumbnail) ? fileMap.get(img.thumbnail!) || img.thumbnail : img.thumbnail
         }));
       }
       return p;
    });
  } catch (error) {
    console.error('Failed to fetch posts by collectionId:', error);
    return [];
  }
};
