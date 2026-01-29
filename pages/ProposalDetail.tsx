import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Proposal } from '../types';
import { StatusBadge, TypeBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { useRadix } from '../services/radixService';

// Helper Icon
const CheckMark = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Simple Markdown Parser Component
const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  const parseLine = (line: string, lineIdx: number) => {
    // Regex matches **bold**, _italic_, or [link](url)
    const parts = line.split(/(\*\*.*?\*\*|_.+?_|\[.*?\]\(.*?\))/g);
    return (
      <div key={lineIdx} className="mb-2 last:mb-0 min-h-[1.5em] break-words">
         {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
               return <strong key={i} className="font-bold text-neutral-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
               return <em key={i} className="italic">{part.slice(1, -1)}</em>;
            }
            const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
            if (linkMatch) {
               return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{linkMatch[1]}</a>;
            }
            return <span key={i}>{part}</span>;
         })}
      </div>
    );
  };

  return <div>{text.split('\n').map(parseLine)}</div>;
};

export const ProposalDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userState, proposals, submitVote, promoteToRFP } = useRadix();
  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  
  // Voting State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Promotion State
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteStart, setPromoteStart] = useState('');
  const [promoteEnd, setPromoteEnd] = useState('');

  // Check if user has already voted from global state
  const previousVote = id ? userState.votes[id] : null;

  useEffect(() => {
    const found = proposals.find(p => p.id === id);
    setProposal(found ? { ...found } : undefined);
    
    // Reset local success state when id changes
    setVoteSuccess(false);
    setSelectedOption(null);
    setIsPromoting(false);
    
    // Default promote dates (Start now, End in 7 days)
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const toLocalISO = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };
    setPromoteStart(toLocalISO(now));
    setPromoteEnd(toLocalISO(future));

  }, [id, proposals]);

  if (!proposal) {
    return <div className="text-center py-20 text-neutral-500">Proposal not found.</div>;
  }

  const handleVote = async () => {
    if(!selectedOption) return;
    setIsVoting(true);
    setVoteSuccess(false);

    try {
      await submitVote(proposal.id, selectedOption);
      setVoteSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVoting(false);
    }
  };

  const handleConfirmPromote = async () => {
    if(proposal.type !== 'TC' || !promoteStart || !promoteEnd) return;
    setIsVoting(true);
    // Passing hardcoded options for MVP as per initial design
    await promoteToRFP(proposal.id, ['Option A', 'Option B', 'Option C'], promoteStart, promoteEnd);
    setIsVoting(false);
    navigate('/');
  };

  const isQuorumMet = proposal.totalVotingPower >= proposal.quorumRequired;
  
  // Determine which results view to show
  const hasCustomOptions = proposal.options && proposal.options.length > 0;
  const isStandardTC = proposal.type === 'TC' && !hasCustomOptions;

  const baseOptionStyle = "w-full flex items-center justify-between px-4 py-3 text-sm transition-all duration-200 border";
  const unselectedStyle = "bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50";
  const selectedStyle = "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black";
  const disabledStyle = "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 cursor-not-allowed";

  const userHasVoted = !!previousVote;

  // Resolve the label for the previous vote
  const votedOptionLabel = hasCustomOptions && previousVote 
    ? proposal.options?.find(o => o.id === previousVote)?.label 
    : previousVote;

  // Fallback if label not found (e.g. for simple 'For'/'Against' stored as strings)
  const displayVote = votedOptionLabel || previousVote?.replace(/^opt-/, '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Left Column: Content */}
      <div className="lg:col-span-2 space-y-8">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div className="flex gap-3 mb-4">
             <StatusBadge status={proposal.status} />
             <TypeBadge type={proposal.type} />
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-neutral-900 dark:text-white leading-tight">
            {proposal.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-500 font-mono">
            <span>ID: {proposal.id}</span>
            <span>Author: {proposal.authorAddress.substring(0,6)}...</span>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
           <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Description</h3>
           <MarkdownText text={proposal.description} />
        </div>

        {proposal.rfcLink && (
           <div className="bg-neutral-100 dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800">
             <span className="text-sm font-semibold text-neutral-900 dark:text-white block mb-1">External Discussion</span>
             <a href={proposal.rfcLink} target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:underline text-sm break-all">
               {proposal.rfcLink}
             </a>
           </div>
        )}
      </div>

      {/* Right Column: Voting & Stats */}
      <div className="space-y-6">
        
        {/* Tally Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
           <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">Current Results</h3>

           {isStandardTC ? (
             <TCResults 
                votesFor={proposal.votesFor || 0} 
                votesAgainst={proposal.votesAgainst || 0} 
                votesAbstain={proposal.votesAbstain || 0}
                total={proposal.totalVotingPower}
             />
           ) : hasCustomOptions ? (
             <RFPResults options={proposal.options!} />
           ) : (
             <div className="text-sm text-neutral-500">No voting data available</div>
           )}

           {/* Quorum Section */}
           <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Quorum Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${isQuorumMet ? 'text-emerald-500' : 'text-neutral-500'}`}>
                  {isQuorumMet ? 'MET' : 'NOT MET'}
                </span>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-lg font-mono font-medium text-neutral-900 dark:text-white leading-none">
                    {proposal.totalVotingPower.toLocaleString()} LSU
                  </div>
                  <div className="text-xs text-neutral-500 uppercase mt-1">Participating</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500 mb-0.5">Target:</div>
                  <div className="font-mono text-sm text-neutral-400">
                    {proposal.quorumRequired.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 mt-3 overflow-hidden rounded-full">
                 <div 
                   className={`h-full transition-all duration-500 ${proposal.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-600'}`} 
                   style={{ width: `${Math.min((proposal.totalVotingPower / proposal.quorumRequired) * 100, 100)}%` }} 
                 />
              </div>
           </div>
        </div>

        {/* Action Card */}
        <div className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-6">
           {proposal.status === 'Active' && userState.isConnected ? (
             <div className="space-y-4">
               <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                 {userHasVoted ? 'Your Vote' : 'Cast your Vote'}
               </h3>
               
               {/* Success Notification (Transient) */}
               {voteSuccess && (
                 <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-sm flex items-center animate-pulse">
                    <span className="mr-2">✓</span> Vote submitted successfully.
                 </div>
               )}

               {/* Persistent Voted State */}
               {!voteSuccess && userHasVoted && (
                 <div className="mb-4 p-3 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-neutral-300 dark:bg-neutral-600 rounded flex items-center justify-center text-neutral-700 dark:text-neutral-200 text-xs font-bold font-serif">
                       i
                    </div>
                    <div>
                        You have already voted: <span className="font-semibold text-neutral-900 dark:text-white ml-1">{displayVote}</span>
                    </div>
                 </div>
               )}

               {isStandardTC ? (
                 <div className="flex flex-col gap-3">
                   {['For', 'Against', 'Abstain'].map((opt) => {
                       const isSelected = selectedOption === opt || previousVote === opt;
                       const isDisabled = userHasVoted || voteSuccess;
                       return (
                         <button 
                           key={opt}
                           onClick={() => !isDisabled && setSelectedOption(opt)}
                           disabled={isDisabled}
                           className={`${baseOptionStyle} ${isSelected ? selectedStyle : (isDisabled ? disabledStyle : unselectedStyle)} ${isSelected ? 'font-medium' : ''}`}
                         >
                           <span>{opt.toUpperCase()}</span>
                           {isSelected && <CheckMark />}
                         </button>
                       );
                   })}
                 </div>
               ) : (
                 <div className="flex flex-col gap-3">
                    {proposal.options?.map(opt => {
                       const isSelected = selectedOption === opt.id || previousVote === opt.id;
                       const isDisabled = userHasVoted || voteSuccess;
                       return (
                        <button
                          key={opt.id}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && setSelectedOption(opt.id)}
                          className={`${baseOptionStyle} ${isSelected ? selectedStyle : (isDisabled ? disabledStyle : unselectedStyle)}`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <CheckMark />}
                        </button>
                      );
                    })}
                 </div>
               )}

               {!userHasVoted && (
                 <>
                   <Button 
                      disabled={!selectedOption || voteSuccess} 
                      isLoading={isVoting}
                      onClick={handleVote}
                      className={`w-full mt-4 ${selectedOption && !voteSuccess ? '!bg-emerald-600 !text-white !hover:bg-emerald-700 dark:!bg-emerald-600 dark:!text-white dark:!hover:bg-emerald-500 border-transparent' : ''}`}
                   >
                     Sign Transaction
                   </Button>
                   <p className="text-xs text-neutral-500 text-center mt-2">
                     Your voting power: {userState.lsuBalance.toLocaleString()} LSU
                   </p>
                 </>
               )}
             </div>
           ) : !userState.isConnected ? (
              <div className="text-center">
                <p className="text-sm text-neutral-500 mb-4">Connect wallet to vote.</p>
              </div>
           ) : (
             <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-900">
               <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                 {proposal.status === 'Pending' ? 'Voting Soon' : 'Voting Closed'}
               </span>
             </div>
           )}

           {/* Admin Promotion Action */}
           {userState.isAdmin && proposal.status === 'Passed' && proposal.type === 'TC' && (
             <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
               <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Admin Controls</h4>
               
               {!isPromoting ? (
                 <>
                   <p className="text-xs text-neutral-500 mb-4">This TC has passed. You can upgrade it to an RFP.</p>
                   <Button onClick={() => setIsPromoting(true)} variant="outline" className="w-full">
                     Promote to RFP
                   </Button>
                 </>
               ) : (
                 <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/50 p-4 border border-neutral-200 dark:border-neutral-700 rounded-sm">
                   <div className="space-y-2">
                     <label className="block text-xs font-semibold text-neutral-500">RFP Start Date</label>
                     <input 
                       type="datetime-local" 
                       value={promoteStart} 
                       onChange={e => setPromoteStart(e.target.value)} 
                       className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 p-2 text-sm rounded-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-500"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="block text-xs font-semibold text-neutral-500">RFP Closing Date</label>
                     <input 
                       type="datetime-local" 
                       value={promoteEnd} 
                       onChange={e => setPromoteEnd(e.target.value)} 
                       className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 p-2 text-sm rounded-sm text-neutral-900 dark:text-white outline-none focus:border-neutral-500"
                     />
                   </div>
                   <div className="flex gap-2 pt-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsPromoting(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleConfirmPromote} isLoading={isVoting} className="flex-1">
                        Confirm
                      </Button>
                   </div>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// Sub-components for results (Unchanged logic, just keeping structure)

const TCResults = ({ votesFor, votesAgainst, votesAbstain, total }: { votesFor: number, votesAgainst: number, votesAbstain: number, total: number }) => {
  const forPct = total > 0 ? (votesFor / total) * 100 : 0;
  const againstPct = total > 0 ? (votesAgainst / total) * 100 : 0;
  const abstainPct = total > 0 ? (votesAbstain / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-neutral-900 dark:text-white">For</span>
          <span className="text-neutral-500">{votesFor.toLocaleString()} LSU ({forPct.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2">
           <div className="bg-neutral-800 dark:bg-neutral-200 h-full" style={{ width: `${forPct}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-neutral-900 dark:text-white">Against</span>
          <span className="text-neutral-500">{votesAgainst.toLocaleString()} LSU ({againstPct.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2">
           <div className="bg-neutral-400 dark:bg-neutral-600 h-full" style={{ width: `${againstPct}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-neutral-900 dark:text-white">Abstain</span>
          <span className="text-neutral-500">{votesAbstain.toLocaleString()} LSU ({abstainPct.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2">
           <div className="bg-neutral-200 dark:bg-neutral-700 h-full" style={{ width: `${abstainPct}%` }} />
        </div>
      </div>
    </div>
  );
};

const RFPResults = ({ options }: { options: any[] }) => {
  const totalVotes = options.reduce((acc, curr) => acc + curr.voteCount, 0);

  return (
    <div className="space-y-6">
      {options.map((opt) => {
        const pct = totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0;
        return (
          <div key={opt.id}>
             <div className="flex justify-between text-sm mb-2">
               <span className="font-medium text-neutral-900 dark:text-white">{opt.label}</span>
               <span className="text-neutral-500">{opt.voteCount.toLocaleString()} LSU ({pct.toFixed(1)}%)</span>
             </div>
             <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2">
               <div className="bg-neutral-700 dark:bg-neutral-300 h-full" style={{ width: `${pct}%` }} />
             </div>
          </div>
        );
      })}
    </div>
  );
};