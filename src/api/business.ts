import { api } from './client';

export interface BusinessSummary { name: string }
export interface BusinessUsersResponse { business: string; users: Array<{ id: string; name?: string|null; village?: string|null; email?: string|null; phone?: string|null }> }

export const business = {
  async list(): Promise<BusinessSummary[]> {
    const { data } = await api.get('/profile/businesses');
    const arr: string[] = (data?.businesses || []) as any;
    return arr.map((name: string) => ({ name }));
  },
  async users(name: string): Promise<BusinessUsersResponse> {
    const { data } = await api.get(`/profile/businesses/${encodeURIComponent(name)}`);
    return data as BusinessUsersResponse;
  }
};
