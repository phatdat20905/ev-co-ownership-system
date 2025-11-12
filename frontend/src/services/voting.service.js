// src/services/voting.service.js
import apiClient from './api/interceptors.js';
import { useVotingStore } from '../stores/useVotingStore';

class VotingService {
  /**
   * Get all votes for a group
   */
  async getGroupVotes(groupId, params = {}) {
    const response = await apiClient.get(`/user/votes/group/${groupId}`, { params });
    if (response.success) {
      useVotingStore.getState().setVotes(response.data);
    }
    return response;
  }

  /**
   * Get vote by ID
   */
  async getVote(voteId) {
    const response = await apiClient.get(`/user/votes/${voteId}`);
    if (response.success) {
      useVotingStore.getState().setCurrentVote(response.data);
    }
    return response;
  }

  /**
   * Create new vote
   */
  async createVote(groupId, voteData) {
    const response = await apiClient.post(`/user/votes/group/${groupId}`, voteData);
    if (response.success) {
      useVotingStore.getState().addVote(response.data);
    }
    return response;
  }

  /**
   * Cast vote on an option
   */
  async castVote(voteId, optionId) {
    const response = await apiClient.post(`/user/votes/${voteId}/cast`, { optionId });
    if (response.success) {
      useVotingStore.getState().castVote(voteId, optionId);
    }
    return response;
  }

  /**
   * Close a vote
   */
  async closeVote(voteId) {
    const response = await apiClient.post(`/user/votes/${voteId}/close`);
    if (response.success) {
      useVotingStore.getState().updateVote(voteId, { status: 'closed' });
    }
    return response;
  }

  /**
   * Delete vote
   */
  async deleteVote(voteId) {
    const response = await apiClient.delete(`/user/votes/${voteId}`);
    if (response.success) {
      useVotingStore.getState().removeVote(voteId);
    }
    return response;
  }

  /**
   * Get vote results
   */
  async getVoteResults(voteId) {
    const response = await apiClient.get(`/user/votes/${voteId}/results`);
    return response;
  }

  /**
   * Get my voting history
   */
  async getMyVotes() {
    const response = await apiClient.get('/user/votes/my-votes');
    if (response.success) {
      useVotingStore.getState().setMyVotes(response.data);
    }
    return response;
  }

  /**
   * Check if user has voted
   */
  async hasVoted(voteId) {
    const response = await apiClient.get(`/user/votes/${voteId}/has-voted`);
    return response;
  }
}

export default new VotingService();
