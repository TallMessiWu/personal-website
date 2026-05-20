import app, { db, ensureAuth } from '@/utils/tcb';
import type { Post, ImageItem } from '@/data/dailyData';

export interface Collection {
  _id: string;
  name: string;
  thumbnail: string;
  posts: string[];
  latestPostDate: string;
  pinned: boolean;
  description?: string;
}

export interface CollectionDisplay {
  _id: string;
  name: string;
  thumbnail: string;
  postCount: number;
  latestPostDate: string;
  pinned: boolean;
  description?: string;
}

const isFileId = (path: string | undefined): boolean => {
  if (!path) return false;
  return path.startsWith('cloud://');
};

/**
 * 批量将 fileId 转为临时 URL，带重试以应对 SDK 冷启动
 */
const resolveFileIds = async (fileIds: string[]): Promise<Map<string, string>> => {
  const fileMap = new Map<string, string>();
  if (fileIds.length === 0) return fileMap;

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
      if (fileMap.size > 0 && attempt >= 1) return fileMap;
    } catch {
      // SDK 冷启动，重试
    }
  }
  return fileMap;
};

export const fetchCollectionsFromCloud = async (): Promise<CollectionDisplay[]> => {
  try {
    await ensureAuth();

    const res = await db.collection('collections')
      .limit(100)
      .get();

    if (!res.data || res.data.length === 0) return [];

    const collections = res.data as Collection[];

    // 收集需要 fallback 封面的合集（thumbnail 为空）
    const needFallback = collections.filter(c => !c.thumbnail);

    const postIdsToQuery = new Set<string>();
    needFallback.forEach(c => {
      c.posts.forEach(pid => postIdsToQuery.add(pid));
    });

    // 批量查询这些 posts（用于 fallback 封面）
    let postsMap = new Map<string, Post>();
    if (postIdsToQuery.size > 0) {
      const postIds = Array.from(postIdsToQuery);
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

    // 为无封面的合集寻找 fallback
    const fallbackThumbnails = new Map<string, string>();
    needFallback.forEach(c => {
      for (const pid of c.posts) {
        const post = postsMap.get(pid);
        if (!post) continue;

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

    // 收集所有需要解析的 fileId
    const fileIdSet = new Set<string>();
    collections.forEach(c => {
      const thumb = c.thumbnail || fallbackThumbnails.get(c._id) || '';
      if (isFileId(thumb)) fileIdSet.add(thumb);
    });

    // 批量解析 fileId → 临时 URL
    const fileMap = await resolveFileIds(Array.from(fileIdSet));

    // 组装展示数据
    const displayList: CollectionDisplay[] = collections.map(c => {
      let thumbnail = c.thumbnail || fallbackThumbnails.get(c._id) || '';
      if (isFileId(thumbnail)) {
        thumbnail = fileMap.get(thumbnail) || '';
      }

      return {
        _id: c._id,
        name: c.name,
        thumbnail,
        postCount: c.posts.length,
        latestPostDate: c.latestPostDate,
        pinned: c.pinned,
        description: c.description,
      };
    });

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

export const fetchPostsByCollectionId = async (collectionId: string): Promise<Post[]> => {
  try {
    await ensureAuth();

    const collRes = await db.collection('collections').doc(collectionId).get();
    let postsIds: string[] = [];

    if (collRes.data && collRes.data.length > 0) {
      const coll = (Array.isArray(collRes.data) ? collRes.data[0] : collRes.data) as Collection;
      postsIds = coll.posts || [];
    } else {
      const collResById = await db.collection('collections').where({ _id: collectionId }).get();
      if (collResById.data && collResById.data.length > 0) {
        postsIds = (collResById.data[0] as Collection).posts || [];
      }
    }

    if (postsIds.length === 0) return [];

    const _ = db.command;
    const postRes = await db.collection('posts')
      .where({ _id: _.in(postsIds) })
      .limit(500)
      .get();

    if (!postRes.data || postRes.data.length === 0) return [];

    const rawPosts = postRes.data as Post[];

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
