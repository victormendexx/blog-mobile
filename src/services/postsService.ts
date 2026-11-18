import { apiRequest } from './api';
import type { Post, PostInput } from '@/types';

export function listPosts(): Promise<Post[]> {
  return apiRequest<Post[]>({ url: '/posts' });
}

export function searchPosts(query: string): Promise<Post[]> {
  return apiRequest<Post[]>({ url: '/posts/search', params: { q: query } });
}

export function getPost(id: string): Promise<Post> {
  return apiRequest<Post>({ url: `/posts/${id}` });
}

export function createPost(data: PostInput): Promise<Post> {
  return apiRequest<Post>({ method: 'POST', url: '/posts', data });
}

export function updatePost(id: string, data: Partial<PostInput>): Promise<Post> {
  return apiRequest<Post>({ method: 'PUT', url: `/posts/${id}`, data });
}

export function deletePost(id: string): Promise<null> {
  return apiRequest<null>({ method: 'DELETE', url: `/posts/${id}` });
}
