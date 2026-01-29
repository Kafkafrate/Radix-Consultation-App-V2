import React from 'react';

// Domain Types

export type VoteType = 'For' | 'Against' | 'Abstain';

export type ProposalStatus = 'Active' | 'Passed' | 'Failed' | 'Executed' | 'Pending' | 'Closed';

export type ProposalType = 'TC' | 'RFP';

export interface VoteOption {
  id: string;
  label: string;
  voteCount: number; // In LSU power
}

export interface Proposal {
  id: string;
  type: ProposalType;
  title: string;
  description: string;
  rfcLink?: string;
  authorAddress: string;
  createdAt: string;
  deadline: string;
  status: ProposalStatus;
  
  // Voting Data
  quorumRequired: number;
  totalVotingPower: number; // Total LSU participating
  
  // For Temperature Checks
  votesFor?: number;
  votesAgainst?: number;
  votesAbstain?: number;

  // For RFPs
  options?: VoteOption[];
  sourceTcId?: string; // If promoted from a TC
}

export interface UserState {
  isConnected: boolean;
  address: string | null;
  isAdmin: boolean; // Holds Owner Badge
  lsuBalance: number; // Voting power
  votes: Record<string, string>; // Map proposalId -> optionId
}

export interface GlobalSettings {
  tcQuorum: number;
  rfpQuorum: number;
}