import { Proposal } from './types';

// Radix Network Config
export const RADIX_NETWORK_ID = 2; // Stokenet
export const DAPP_DEFINITION_ADDRESS = "account_tdx_2_1234567890abcdef..."; // Placeholder
export const ADMIN_BADGE_ADDRESS = "resource_tdx_2_adminbadge..."; // Placeholder

// Mock Data for Demo
export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'tc-001',
    type: 'TC',
    title: 'TC: Increase Validator Set Size',
    description: 'A proposal to increase the active validator set from 100 to 125 to improve decentralization.',
    rfcLink: 'https://radixtalk.com/t/rfc-validator-increase',
    authorAddress: 'account_tdx_2_...abc',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days left
    status: 'Active',
    quorumRequired: 1000000,
    totalVotingPower: 550000,
    votesFor: 350000,
    votesAgainst: 150000,
    votesAbstain: 50000,
  },
  {
    id: 'tc-002',
    type: 'TC',
    title: 'TC: Marketing Budget Q3',
    description: 'Allocate 500k XRD for Q3 marketing initiatives focusing on developer adoption.',
    rfcLink: 'https://radixtalk.com',
    authorAddress: 'account_tdx_2_...xyz',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    deadline: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'Passed',
    quorumRequired: 1000000,
    totalVotingPower: 2600000,
    votesFor: 2000000,
    votesAgainst: 500000,
    votesAbstain: 100000,
  },
  {
    id: 'rfp-001',
    type: 'RFP',
    title: 'RFP: Marketing Budget Q3 Implementation',
    description: 'Select the primary agency to handle the Q3 marketing budget approved in TC-002.',
    sourceTcId: 'tc-002',
    authorAddress: 'account_tdx_2_...admin',
    createdAt: new Date(Date.now()).toISOString(),
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'Active',
    quorumRequired: 1000000,
    totalVotingPower: 120000,
    options: [
      { id: 'opt-1', label: 'Agency Alpha', voteCount: 45000 },
      { id: 'opt-2', label: 'Beta Creative', voteCount: 75000 },
      { id: 'opt-3', label: 'Gamma Growth', voteCount: 0 },
    ],
  },
  {
    id: 'tc-003',
    type: 'TC',
    title: 'TC: Update Protocol Fees',
    description: 'Adjust the network transaction fees to account for recent price changes.',
    rfcLink: 'https://radixtalk.com',
    authorAddress: 'account_tdx_2_...def',
    createdAt: new Date(Date.now() + 86400000).toISOString(), // Future
    deadline: new Date(Date.now() + 86400000 * 8).toISOString(),
    status: 'Pending',
    quorumRequired: 1500000,
    totalVotingPower: 0,
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
  },
  {
    id: 'tc-004',
    type: 'TC',
    title: 'TC: Community Grant Program 2024',
    description: 'Establish a new grant program for community-led events.',
    rfcLink: 'https://radixtalk.com',
    authorAddress: 'account_tdx_2_...ghi',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    deadline: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'Closed',
    quorumRequired: 1000000,
    totalVotingPower: 400000,
    votesFor: 200000,
    votesAgainst: 200000,
    votesAbstain: 0,
  }
];
