// Minimal voting service
import apiClient from './api/interceptors.js';

const VotingService = {
  async getVotes(groupId) {
    try {
      return await apiClient.get(`/groups/${groupId}/votes`);
    } catch (err) {
      console.warn('votingService.getVotes failed', err);
      throw err;
    }
  },
  async createVote(groupId, payload) {
    try {
      return await apiClient.post(`/groups/${groupId}/votes`, payload);
    } catch (err) {
      console.warn('votingService.createVote failed', err);
      throw err;
    }
  }
};

export default VotingService;
