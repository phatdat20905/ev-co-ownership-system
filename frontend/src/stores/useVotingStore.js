// src/stores/useVotingStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVotingStore = create(
  persist(
    (set, get) => ({
      // State
      votes: [],
      currentVote: null,
      myVotes: [],
      loading: false,
      error: null,

      // Actions
      setVotes: (votes) => set({ votes }),
      
      setCurrentVote: (vote) => set({ currentVote: vote }),
      
      setMyVotes: (myVotes) => set({ myVotes }),
      
      addVote: (vote) => set((state) => ({
        votes: [vote, ...state.votes]
      })),
      
      updateVote: (voteId, updates) => set((state) => ({
        votes: state.votes.map(v => 
          v.id === voteId ? { ...v, ...updates } : v
        ),
        currentVote: state.currentVote?.id === voteId
          ? { ...state.currentVote, ...updates }
          : state.currentVote
      })),
      
      removeVote: (voteId) => set((state) => ({
        votes: state.votes.filter(v => v.id !== voteId),
        currentVote: state.currentVote?.id === voteId ? null : state.currentVote
      })),
      
      castVote: (voteId, optionId) => set((state) => {
        const updatedVotes = state.votes.map(v => {
          if (v.id === voteId) {
            return {
              ...v,
              hasVoted: true,
              myChoice: optionId
            };
          }
          return v;
        });
        
        return {
          votes: updatedVotes,
          myVotes: [...state.myVotes, { voteId, optionId, votedAt: new Date() }]
        };
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        votes: [],
        currentVote: null,
        myVotes: [],
        loading: false,
        error: null
      })
    }),
    {
      name: 'voting-storage',
      partialize: (state) => ({
        votes: state.votes,
        myVotes: state.myVotes
      })
    }
  )
);
