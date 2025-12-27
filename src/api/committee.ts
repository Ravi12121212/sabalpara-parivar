import { api } from './client';

export interface CommitteeDto { id: string; name: string; createdAt?: string; members: { memberName: string; post: string; imageUrl?: string; contactNumber?: string; addedAt?: string }[] }
export interface AddMemberInput { memberName: string; post: string; imageUrl?: string; contactNumber?: string }
export interface UpdateMemberInput { memberName: string; post: string; imageUrl?: string; contactNumber?: string }
export interface CreateCommitteeInput { name: string }

export const committees = {
  list: async (): Promise<CommitteeDto[]> => {
    const { data } = await api.get('/committees');
    return data;
  },
  create: async (payload: CreateCommitteeInput): Promise<CommitteeDto> => {
    try {
      const { data } = await api.post('/committees', payload);
      return data;
    } catch (e: any) {
      // Bubble a user-friendly error if committee already exists
      if (e?.response?.status === 409) {
        throw new Error(e.response?.data?.message || 'Committee already exists');
      }
      throw e;
    }
  },
  addMember: async (id: string, payload: AddMemberInput): Promise<CommitteeDto> => {
    const { data } = await api.post(`/committees/${id}/members`, payload);
    return data;
  },
  updateMember: async (id: string, index: number, payload: UpdateMemberInput): Promise<CommitteeDto> => {
    const { data } = await api.patch(`/committees/${id}/members/${index}`, payload);
    return data;
  },
  removeMember: async (id: string, index: number): Promise<CommitteeDto> => {
    const { data } = await api.delete(`/committees/${id}/members/${index}`);
    return data;
  },
};
