import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-light text-neutral-900 dark:text-white">About Consultation v2</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Consultation v2 is a decentralized governance platform for the Radix ecosystem. 
          It enables the community to signal sentiment through Temperature Checks (TC) and decide on execution paths through Requests for Proposals (RFP).
        </p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-medium text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">
          How it Works
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">1. Temperature Check (TC)</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Any community member with a Radix wallet can propose a Temperature Check. This is a binary "For" or "Against" vote to gauge community sentiment on a specific idea or direction.
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-500 space-y-2 pl-2">
              <li>Requires 1M LSU Quorum.</li>
              <li>Must pass with >50% approval.</li>
              <li>Successful TCs may be upgraded to RFPs by the Council.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">2. Request for Proposal (RFP)</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              RFPs are created by the Council (Admins) based on successful Temperature Checks. They present specific implementation options for the community to choose from.
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-500 space-y-2 pl-2">
              <li>Multiple options available.</li>
              <li>The option with the most votes wins.</li>
              <li>Binding execution based on result.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-neutral-100 dark:bg-neutral-900 p-6 border border-neutral-200 dark:border-neutral-800 rounded-sm">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Voting Power</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Your voting power is determined by your Liquid Stake Unit (LSU) holdings. 
          1 LSU = 1 Vote. A snapshot of your balance is taken at the moment the proposal is created.
        </p>
      </div>
    </div>
  );
};