import { request } from './apiClient';

export interface ChallengeResponse {
    id: string;
    targetXp: number;
    targetDays: number;
    currentXp: number;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
}

export const challengeService = {
    createChallenge: async (targetXp: number, targetDays: number): Promise<ChallengeResponse> => {
        return request<ChallengeResponse>('/api/challenges', {
            method: 'POST',
            body: JSON.stringify({ targetXp, targetDays })
        });
    },

    getCurrentChallenge: async (): Promise<ChallengeResponse | null> => {
        try {
            return await request<ChallengeResponse>('/api/challenges/current');
        } catch (error) {
            return null;
        }
    }
};
