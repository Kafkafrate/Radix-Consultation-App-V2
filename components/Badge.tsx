import React from 'react';
import { ProposalStatus, ProposalType } from '../types';

export const StatusBadge: React.FC<{ status: ProposalStatus }> = ({ status }) => {
  const styles: Record<ProposalStatus, string> = {
    Active: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black",
    Passed: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
    Pending: "bg-amber-400 text-black border border-amber-500",
    Closed: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    Failed: "bg-red-600 text-white dark:bg-red-500",
    Executed: "bg-purple-600 text-white dark:bg-purple-500",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-sm ${styles[status] || styles.Closed}`}>
      {status}
    </span>
  );
};

export const TypeBadge: React.FC<{ type: ProposalType }> = ({ type }) => {
  return (
    <span className={`px-2 py-0.5 text-xs font-bold border rounded-sm ${type === 'RFP' ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100' : 'border-neutral-400 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400'}`}>
      {type}
    </span>
  );
};
