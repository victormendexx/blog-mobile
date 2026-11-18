import { apiRequest } from './api';
import type { LoginResponse } from '@/types';

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>({
    method: 'POST',
    url: '/auth/login',
    data: { email, password },
  });
}
