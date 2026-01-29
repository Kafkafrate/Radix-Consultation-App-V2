import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserState, Proposal, GlobalSettings } from '../types';
import { MOCK_PROPOSALS } from '../constants';

interface RadixContextType {
  userState: UserState;
  settings: GlobalSettings;
  proposals: Proposal[];
  connect: () => void;
  disconnect: () => void;
  toggleAdminMode: () => void;
  submitVote: (proposalId: string, option: string) => Promise<void>;
  createProposal: (proposal: Proposal) => Promise<void>;
  promoteToRFP: (tcId: string, options: string[], startDate: string, endDate: string) => Promise<void>;
  updateSettings: (newSettings: GlobalSettings) => Promise<void>;
}

const RadixContext = createContext<RadixContextType | undefined>(undefined);

export const RadixProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userState, setUserState] = useState<UserState>({
    isConnected: false,
    address: null,
    isAdmin: false,
    lsuBalance: 0,
    votes: {},
  });

  const [settings, setSettings] = useState<GlobalSettings>({
    tcQuorum: 1000000,
    rfpQuorum: 1000000,
  });

  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);

  // Simulate RDT initialization
  useEffect(() => {
    const saved = localStorage.getItem('radix_session');
    if (saved) {
      setUserState(JSON.parse(saved));
    }
  }, []);

  // Persist session changes
  useEffect(() => {
    if (userState.isConnected) {
      localStorage.setItem('radix_session', JSON.stringify(userState));
    }
  }, [userState]);

  const connect = () => {
    setTimeout(() => {
      const newState: UserState = {
        isConnected: true,
        address: 'account_tdx_2_123...mock',
        isAdmin: false,
        lsuBalance: 50000,
        votes: {},
      };
      setUserState(newState);
      localStorage.setItem('radix_session', JSON.stringify(newState));
    }, 500);
  };

  const disconnect = () => {
    const newState: UserState = {
      isConnected: false,
      address: null,
      isAdmin: false,
      lsuBalance: 0,
      votes: {},
    };
    setUserState(newState);
    localStorage.removeItem('radix_session');
  };

  const toggleAdminMode = () => {
    setUserState(prev => ({ ...prev, isAdmin: !prev.isAdmin }));
  };

  const updateSettings = async (newSettings: GlobalSettings) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSettings(newSettings);
        resolve();
      }, 500);
    });
  };

  const submitVote = async (proposalId: string, option: string) => {
    return new Promise<void>((resolve) => {
      console.log(`Building transaction manifest for vote on ${proposalId} choice: ${option}`);
      setTimeout(() => {
        // Update Proposal Stats
        setProposals(prev => prev.map(p => {
          if (p.id !== proposalId) return p;
          
          const power = userState.lsuBalance;
          let updated = { ...p };
          updated.totalVotingPower = (updated.totalVotingPower || 0) + power;

          if (updated.type === 'TC' && !updated.options) {
             if (option === 'For') updated.votesFor = (updated.votesFor || 0) + power;
             if (option === 'Against') updated.votesAgainst = (updated.votesAgainst || 0) + power;
             if (option === 'Abstain') updated.votesAbstain = (updated.votesAbstain || 0) + power;
          } else if (updated.options) {
             updated.options = updated.options.map(opt => 
                opt.id === option 
                ? { ...opt, voteCount: opt.voteCount + power }
                : opt
             );
          }
          return updated;
        }));

        // Update User State (Record Vote)
        setUserState(prev => ({
          ...prev,
          votes: { ...prev.votes, [proposalId]: option }
        }));

        resolve();
      }, 1500); 
    });
  };

  const createProposal = async (proposal: Proposal) => {
     return new Promise<void>((resolve) => {
      console.log(`Building transaction for New Proposal: ${proposal.title}`);
      // Ensure the proposal uses the current settings for Quorum
      const proposalWithSettings = {
        ...proposal,
        quorumRequired: proposal.type === 'TC' ? settings.tcQuorum : settings.rfpQuorum
      };
      setTimeout(() => {
        setProposals(prev => [proposalWithSettings, ...prev]);
        resolve();
      }, 1500);
    });
  };

  const promoteToRFP = async (tcId: string, options: string[], startDate: string, endDate: string) => {
      return new Promise<void>((resolve) => {
      console.log(`Promoting ${tcId} to RFP with options: ${options.join(', ')}`);
      
      const tc = proposals.find(p => p.id === tcId);
      if (!tc) { resolve(); return; }

      // Determine status based on start date
      const status = new Date(startDate) > new Date() ? 'Pending' : 'Active';

      const newRfp: Proposal = {
        id: `rfp-${Date.now()}`,
        type: 'RFP',
        title: `RFP: ${tc.title.replace('TC: ', '')}`,
        description: tc.description, // Inherit description
        rfcLink: tc.rfcLink,
        authorAddress: userState.address || 'admin',
        createdAt: new Date(startDate).toISOString(), 
        deadline: new Date(endDate).toISOString(),
        status: status,
        quorumRequired: settings.rfpQuorum,
        totalVotingPower: 0,
        sourceTcId: tc.id,
        options: options.map((lbl, idx) => ({ id: `opt-${idx}`, label: lbl, voteCount: 0 }))
      };

      setTimeout(() => {
        setProposals(prev => [newRfp, ...prev]);
        resolve();
      }, 1500);
    });
  };

  return (
    <RadixContext.Provider value={{ 
      userState, 
      settings,
      proposals,
      connect, 
      disconnect, 
      toggleAdminMode,
      submitVote,
      createProposal,
      promoteToRFP,
      updateSettings
    }}>
      {children}
    </RadixContext.Provider>
  );
};

export const useRadix = () => {
  const context = useContext(RadixContext);
  if (!context) {
    throw new Error('useRadix must be used within a RadixProvider');
  }
  return context;
};