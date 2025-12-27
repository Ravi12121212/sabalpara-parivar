import { api } from './client';

export interface GalleryItemDto {
  id?: string;
  _id?: string;
  imageUrl: string;
  title?: string;
  createdAt?: string;
}

export const gallery = {
  async list(q?: string): Promise<GalleryItemDto[]> {
    const { data } = await api.get('/gallery', { params: q ? { q } : undefined });
    return data;
  },
  async create(input: { imageUrl: string; title?: string }): Promise<GalleryItemDto> {
    const { data } = await api.post('/gallery', input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/gallery/${id}`);
  },
  async upload(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/gallery/upload', fd);
    if (data?.error) throw new Error(data.error);
    return data.url as string;
  },
  async uploadMany(files: File[]): Promise<string[]> {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    const { data } = await api.post('/gallery/upload-many', fd);
    if (data?.error) throw new Error(data.error);
    return (data.items || []).map((i: any) => i.url);
  },
  async bulkCreate(items: { imageUrl: string; title?: string }[]): Promise<GalleryItemDto[]> {
    const { data } = await api.post('/gallery/bulk', { items });
    return data as GalleryItemDto[];
  }
};
