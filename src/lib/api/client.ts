import axios from 'axios';
import type {
  AdvertisementCreate,
  AdvertisementResponse,
  AttachmentResponse,
  Conversation,
  MessageResponse,
  SellerProfileResponse,
  UserResponse,
} from '../../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ??
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws-api`;
export const TOKEN_STORAGE_KEY = 'ktn_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('ktn:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export const apiClient = {
  register(payload: { full_name: string; email: string; password: string }) {
    return api.post<UserResponse>('/auth/register', payload);
  },
  login(payload: { username: string; password: string }) {
    const form = new FormData();
    form.append('username', payload.username);
    form.append('password', payload.password);
    return api.post<{ access_token: string; token_type: string }>('/auth/login', form);
  },
  me() {
    return api.get<UserResponse>('/users/me');
  },
  updateMe(payload: Pick<UserResponse, 'phone' | 'city'>) {
    return api.put<UserResponse>('/users/me', payload);
  },
  uploadAvatar(file: File) {
    const form = new FormData();
    form.append('avatar', file);
    return api.post<UserResponse>('/users/me/avatar', form);
  },
  async discover(params?: Record<string, string>) {
    try {
      return await api.get<AdvertisementResponse[]>('/ads/discover', { params });
    } catch (error) {
      if (axios.isAxiosError(error) && [404, 405, 422].includes(error.response?.status ?? 0)) {
        return api.get<AdvertisementResponse[]>('/ads', { params });
      }
      throw error;
    }
  },
  listAds(params?: Record<string, string>) {
    return api.get<AdvertisementResponse[]>('/ads', { params });
  },
  myAds() {
    return api.get<AdvertisementResponse[]>('/ads/my-ads');
  },
  getAd(id: number) {
    return api.get<AdvertisementResponse>(`/ads/${id}`);
  },
  createAd(payload: AdvertisementCreate) {
    return api.post<AdvertisementResponse>('/ads/', payload);
  },
  updateAd(id: number, payload: Partial<AdvertisementCreate>) {
    return api.put<AdvertisementResponse>(`/ads/${id}`, payload);
  },
  deleteAd(id: number) {
    return api.delete<void>(`/ads/${id}`);
  },
  uploadAdImages(id: number, files: File[]) {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    return api.post<AdvertisementResponse>(`/ads/${id}/images`, form);
  },
  seller(id: string) {
    return api.get<SellerProfileResponse>(`/users/${id}`);
  },
  conversations() {
    return api.get<Conversation[]>('/chat/conversations');
  },
  createConversation(targetUserId: string) {
    return api.post<Conversation>('/chat/conversations', null, {
      params: { target_user_id: targetUserId },
    });
  },
  messages(conversationId: number) {
    return api.get<MessageResponse[]>(`/chat/conversations/${conversationId}/messages`);
  },
  uploadChatAttachment(conversationId: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return api.post<AttachmentResponse>(`/chat/conversations/${conversationId}/attachments`, form);
  },
};

export function getApiErrorMessage(error: unknown, fallback = 'Bir hata oluştu. Lütfen tekrar deneyin.') {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
