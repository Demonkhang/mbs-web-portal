import { fetchApi } from './api-client';
import { NewsItem } from '@mbs/types';

export const postsService = {
  async getPosts(params?: { category?: string; page?: number }): Promise<NewsItem[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await fetchApi<NewsItem[]>(`/posts?${query}`);
    } catch {
      return [];
    }
  },

  async getPostBySlug(slug: string): Promise<NewsItem | null> {
    try {
      return await fetchApi<NewsItem>(`/posts/${slug}`);
    } catch {
      return null;
    }
  },
};
