import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, TypeBadge } from '../components/Badge';
import { useRadix } from '../services/radixService';
import { Proposal, ProposalType, ProposalStatus } from '../types';

export const Home: React.FC = () => {
  const { proposals } = useRadix();
  const [filterType, setFilterType] = useState<ProposalType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'Newest' | 'Oldest'>('Newest');

  const filteredProposals = useMemo(() => {
    let result = [...proposals];

    // Filter by Type
    if (filterType !== 'ALL') {
      result = result.filter(p => p.type === filterType);
    }

    // Filter by Status
    if (filterStatus !== 'ALL') {
      result = result.filter(p => p.status === filterStatus);
    }

    // Sort by Time (using createdAt)
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [filterType, filterStatus, sortOrder, proposals]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-light text-neutral-900 dark:text-white tracking-tight">
          Radix Governance Proposals
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-xl">
          Participate in the future of the Radix ecosystem. View active Temperature Checks and Requests for Proposals below.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap gap-3">
          {/* Type Filter */}
          <div className="relative">
             <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ProposalType | 'ALL')}
                className="appearance-none bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm px-4 py-2 pr-8 rounded-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-500 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
             >
                <option value="ALL">All Types</option>
                <option value="TC">Temperature Check</option>
                <option value="RFP">Request for Proposal</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
               <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
             <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ProposalStatus | 'ALL')}
                className="appearance-none bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm px-4 py-2 pr-8 rounded-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-500 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
             >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Passed">Passed</option>
                <option value="Closed">Closed</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
               <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
           <span className="text-xs text-neutral-500 uppercase font-medium">Sort by</span>
           <div className="relative">
              <select 
                 value={sortOrder}
                 onChange={(e) => setSortOrder(e.target.value as 'Newest' | 'Oldest')}
                 className="appearance-none bg-transparent text-sm font-medium text-neutral-900 dark:text-white pr-6 py-1 focus:outline-none cursor-pointer"
              >
                 <option value="Newest">Newest</option>
                 <option value="Oldest">Oldest</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-neutral-900 dark:text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
           </div>
        </div>
      </div>

      {/* Governance List */}
      <div className="grid gap-4">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        ) : (
          <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
            <p className="text-neutral-500">No proposals match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProposalCard: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  // Only calculate participation if Quorum > 0
  const participation = proposal.quorumRequired > 0 
    ? Math.round((proposal.totalVotingPower / proposal.quorumRequired) * 100) 
    : 0;
  
  const isHighParticipation = participation > 100;

  return (
    <Link 
      to={`/proposal/${proposal.id}`}
      className="block group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 p-6 shadow-sm"
    >
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={proposal.status} />
            <TypeBadge type={proposal.type} />
            <span className="text-xs text-neutral-500 font-mono">#{proposal.id}</span>
          </div>
          
          <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 group-hover:underline decoration-neutral-400 underline-offset-4">
            {proposal.title}
          </h3>
          
          <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">
            {proposal.description}
          </p>

          <div className="pt-2 flex items-center text-xs text-neutral-500 gap-4">
            <span>By {proposal.authorAddress.slice(0, 8)}...</span>
            <span>•</span>
            <span>Ends {new Date(proposal.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="md:w-48 flex md:flex-col justify-between md:justify-center gap-4 md:border-l border-neutral-100 dark:border-neutral-800 md:pl-6">
          <div>
            <div className="text-xs text-neutral-500 uppercase mb-1">Participation</div>
            <div className={`text-lg font-semibold ${isHighParticipation ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
              {participation}%
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 mt-2 overflow-hidden rounded-full">
              <div 
                className={`h-full ${proposal.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-600'}`}
                style={{ width: `${Math.min(participation, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="text-xs text-neutral-500 uppercase mb-1">Votes</div>
            <div className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
               {proposal.totalVotingPower.toLocaleString()} LSU
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};