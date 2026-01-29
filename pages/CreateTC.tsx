import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRadix } from '../services/radixService';
import { Button } from '../components/Button';
import { VoteOption, Proposal } from '../types';

// Reusing the simple parser logic for consistency
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

export const CreateTC: React.FC = () => {
  const navigate = useNavigate();
  const { userState, createProposal, settings } = useRadix();
  const [step, setStep] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rfcLink, setRfcLink] = useState('');
  const [options, setOptions] = useState<string[]>(['For', 'Against', 'Abstain']);
  const [newOption, setNewOption] = useState('');

  // Redirect if not connected
  if (!userState.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-light mb-4 text-neutral-900 dark:text-white">Access Restricted</h2>
        <p className="text-neutral-500 mb-6">You must connect your Radix wallet to create a proposal.</p>
      </div>
    );
  }

  // --- Helpers ---

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const insertMarkdown = (char: string, wrap = false) => {
    const textarea = document.getElementById('desc-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = '';
    if (wrap) {
      replacement = `${char}${selected}${char}`;
    } else {
      // For links
      if (char === 'link') {
        replacement = `[${selected || 'link text'}](url)`;
      } else {
        replacement = `${char} ${selected}`;
      }
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setDescription(newText);
    
    // Defer focus restore
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const validate = () => {
    return title.trim() !== '' && description.trim() !== '' && rfcLink.trim() !== '' && options.length >= 2;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newProposal: Proposal = {
        id: `tc-${Date.now()}`,
        type: 'TC', // or dynamic if we want to allow user to pick type
        title: title,
        description: description,
        rfcLink: rfcLink,
        authorAddress: userState.address || '',
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days default
        status: 'Active',
        quorumRequired: settings.tcQuorum, // Use global setting
        totalVotingPower: 0,
        votesFor: 0, 
        votesAgainst: 0,
        votesAbstain: 0,
        options: options.map(label => ({
          id: label,
          label,
          voteCount: 0
        }))
      };

      await createProposal(newProposal);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Views ---

  if (step === 'PREVIEW') {
    return (
      <div className="space-y-8">
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
            <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Preview Mode</span>
                <h2 className="text-lg font-medium">Review your proposal</h2>
            </div>
            <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('EDIT')}>Edit</Button>
                <Button onClick={handleSubmit} isLoading={isSubmitting}>Publish Proposal</Button>
            </div>
        </div>

        {/* Preview Content Reusing Styles from Detail Page */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-neutral-900 dark:text-white leading-tight">{title}</h1>
                    <div className="mt-2 text-sm text-neutral-500 font-mono">Author: {userState.address}</div>
                </div>
                <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
                    <MarkdownText text={description} />
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-sm font-semibold block mb-1">External Discussion</span>
                    <a href={rfcLink} className="text-neutral-600 dark:text-neutral-400 underline break-all">{rfcLink}</a>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Voting Options</h3>
                    <div className="space-y-2">
                        {options.map((opt, idx) => (
                            <div key={idx} className="p-3 border border-neutral-200 dark:border-neutral-700 text-sm">
                                {opt}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="max-w-none">
      <div className="mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-light text-neutral-900 dark:text-white">Create Proposal</h1>
        <p className="mt-2 text-neutral-500">Initiate a community vote. All fields marked with * are mandatory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Proposal Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-3 text-neutral-900 dark:text-white focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 outline-none transition-colors"
                    placeholder="e.g., Increase Validator Set Size"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Description <span className="text-red-500">*</span>
                </label>
                {/* Markdown Toolbar */}
                <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => insertMarkdown('**', true)} className="px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors text-neutral-700 dark:text-neutral-300">Bold</button>
                    <button type="button" onClick={() => insertMarkdown('_', true)} className="px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors text-neutral-700 dark:text-neutral-300">Italic</button>
                    <button type="button" onClick={() => insertMarkdown('link')} className="px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors text-neutral-700 dark:text-neutral-300">Link</button>
                </div>
                <textarea
                    id="desc-editor"
                    required
                    rows={12}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-3 text-neutral-900 dark:text-white focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 outline-none transition-colors font-mono text-sm"
                    placeholder="Describe your proposal clearly... Markdown supported."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    RFC Link (RadixTalk) <span className="text-red-500">*</span>
                </label>
                <input
                    type="url"
                    required
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-3 text-neutral-900 dark:text-white focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 outline-none transition-colors"
                    placeholder="https://radixtalk.com/t/..."
                    value={rfcLink}
                    onChange={e => setRfcLink(e.target.value)}
                />
                <p className="mt-1 text-xs text-neutral-500">
                    Discussion must be active on RadixTalk before creating a proposal.
                </p>
            </div>
        </div>

        {/* Sidebar: Options */}
        <div className="space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Voting Options</h3>
                <p className="text-xs text-neutral-500 mb-4">Define the choices voters can select. Minimum 2 options required.</p>
                
                <div className="space-y-3 mb-4">
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 border border-neutral-200 dark:border-neutral-700 text-sm">
                            <span className="text-neutral-700 dark:text-neutral-300">{opt}</span>
                            <button 
                                onClick={() => handleRemoveOption(idx)}
                                className="text-neutral-400 hover:text-red-500 transition-colors"
                                aria-label="Remove option"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-2 text-sm outline-none text-neutral-900 dark:text-white focus:border-neutral-500 transition-colors"
                        placeholder="New Option"
                        value={newOption}
                        onChange={e => setNewOption(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                    />
                    <Button onClick={handleAddOption} variant="secondary" size="sm" type="button">Add</Button>
                </div>
            </div>

            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className="mb-4 text-xs text-neutral-500">
                   Quorum Required: {settings.tcQuorum.toLocaleString()} LSU
                </div>
                <Button 
                    className="w-full" 
                    onClick={() => setStep('PREVIEW')} 
                    disabled={!validate()}
                >
                    Preview Proposal
                </Button>
                {!validate() && (
                    <p className="text-center text-xs text-red-500 mt-2">Please fill all mandatory fields and ensure at least 2 options.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};