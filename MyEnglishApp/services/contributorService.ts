import { request } from './apiClient';

export interface ContributorRequestDto {
  id: number;
  userId: string;
  username: string;
  email: string;
  certificateUrl: string;
  note: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback: string;
  createdAt: string;
  updatedAt: string;
}

export const submitContributorRequest = (certificateUrl: string, note: string) => {
  return request<ContributorRequestDto>('/api/learner/contributor/request', {
    method: 'POST',
    body: JSON.stringify({ certificateUrl, note })
  });
};

export const getCurrentContributorRequest = () => {
  return request<ContributorRequestDto | null>('/api/learner/contributor/request/current');
};

// Admin endpoints
export const getAllContributorRequests = () => {
  return request<ContributorRequestDto[]>('/api/admin/contributor/requests');
};

export const reviewContributorRequest = (id: number, approve: boolean, feedback: string) => {
  return request<ContributorRequestDto>(`/api/admin/contributor/requests/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ approve, feedback })
  });
};
