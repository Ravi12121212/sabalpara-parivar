import { api } from './client';

export interface NotificationDto {
  id?: string;
  _id?: string;
  text?: string;
  imageUrl?: string;
  createdAt?: string;
}

export const notifications = {
  async list(): Promise<NotificationDto[]> {
    const { data } = await api.get('/notifications');
    return data;
  },
  async create(input: { text?: string; imageUrl?: string }): Promise<NotificationDto> {
    const { data } = await api.post('/notifications', input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
  async upload(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/notifications/upload', fd);
    if (data?.error) throw new Error(data.error);
    return data.url as string;
  },
};
