import React, { useState } from 'react';
import { useRadix } from '../services/radixService';
import { Button } from '../components/Button';

export const Settings: React.FC = () => {
  const { userState, settings, updateSettings } = useRadix();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for form
  const [tcQuorum, setTcQuorum] = useState(settings.tcQuorum);
  const [rfpQuorum, setRfpQuorum] = useState(settings.rfpQuorum);

  if (!userState.isConnected) {
    return (
      <div className="text-center py-20 text-neutral-500">
        Please connect your wallet to view settings.
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings({ tcQuorum, rfpQuorum });
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-light text-neutral-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-neutral-500">Manage your preferences and configuration.</p>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
           <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Profile</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs uppercase text-neutral-500 font-semibold mb-1">Connected Account</label>
               <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-950 p-2 rounded-sm border border-neutral-200 dark:border-neutral-800">
                 {userState.address}
               </div>
             </div>
             <div>
               <label className="block text-xs uppercase text-neutral-500 font-semibold mb-1">Role</label>
               <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-950 p-2 rounded-sm border border-neutral-200 dark:border-neutral-800">
                 {userState.isAdmin ? 'Admin (Council Member)' : 'Community Voter'}
               </div>
             </div>
             <div>
               <label className="block text-xs uppercase text-neutral-500 font-semibold mb-1">Voting Power</label>
               <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
                 {userState.lsuBalance.toLocaleString()} LSU
               </div>
             </div>
           </div>
        </section>

        {/* Admin Settings */}
        {userState.isAdmin && (
          <section className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Governance Configuration</h2>
              <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">Admin Only</span>
            </div>
            
            <p className="text-sm text-neutral-500 mb-6">
              Update the default Quorum requirements for new proposals. These changes will not affect active proposals.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Temperature Check (TC) Quorum
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tcQuorum}
                    onChange={(e) => setTcQuorum(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 p-2 pr-12 text-neutral-900 dark:text-white focus:ring-1 focus:ring-neutral-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-sm text-neutral-500">LSU</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Request for Proposal (RFP) Quorum
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rfpQuorum}
                    onChange={(e) => setRfpQuorum(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 p-2 pr-12 text-neutral-900 dark:text-white focus:ring-1 focus:ring-neutral-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-sm text-neutral-500">LSU</span>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} isLoading={isSaving}>
                   Update Configuration
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};