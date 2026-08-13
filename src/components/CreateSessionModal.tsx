import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, GraduationCap, Sparkles, Clock, Coins, Plus } from 'lucide-react';
import type { SkillSession, SessionType, SkillLevel } from '../types';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSession: (newSession: Omit<SkillSession, 'id' | 'createdAt' | 'status'>) => void;
  connectedAddress: string;
}

const CATEGORIES = [
  'Web3 & Smart Contracts',
  'Frontend & UI/UX',
  'Python & Data Science',
  'DeFi & Algorithmic Trading',
  'Cybersecurity'
];

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmitSession,
  connectedAddress,
}) => {
  const [type, setType] = useState<SessionType>('OFFER');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [feeXlm, setFeeXlm] = useState<number>(20);
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Stellar', 'Mentorship']);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive skill session title.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a brief description of what will be taught/learned.');
      return;
    }
    if (feeXlm <= 0) {
      setErrorMsg('Escrow Fee must be greater than 0 XLM.');
      return;
    }

    setErrorMsg('');
    onSubmitSession({
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      durationMinutes,
      feeXlm,
      creatorAddress: connectedAddress || 'GA7Q3Z8X9K2P4M6W1V5T9L0N3E7C4B2A8D9F0E1C',
      creatorName: connectedAddress ? `Stellar User (${connectedAddress.slice(0, 4)}...)` : 'Anonymous Cyber Mentor',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      level,
      tags: tags.length > 0 ? tags : ['SkillFlow', category.split(' ')[0]],
    });

    // Reset fields & close
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#060911]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0d1322] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Title & Cyber Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white font-tech">
                Post Skill Session
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Create a verifiable mentorship session powered by Stellar Testnet escrow contracts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Offer to Teach vs Request to Learn Segment Switch */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-tech">
                Session Type
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('OFFER')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-xs transition-all font-tech ${
                    type === 'OFFER'
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Offer to Teach
                </button>
                <button
                  type="button"
                  onClick={() => setType('REQUEST')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-xs transition-all font-tech ${
                    type === 'REQUEST'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                      : 'text-slate-400 hover:text-purple-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Request to Learn
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                Skill Title *
              </label>
              <input
                type="text"
                placeholder='e.g., "Python Intro", "CSS Layouts", "Soroban Smart Contracts"'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
              />
              
              {/* Quick suggestion buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Python Intro', 'CSS Layouts', 'Soroban Rust', 'DeFi Arbitrage'].map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => setTitle(sug)}
                    className="text-[10px] px-2 py-1 rounded bg-slate-900 text-cyan-400/80 hover:text-cyan-300 border border-slate-800"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium bg-[#080c16]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Target Skill Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SkillLevel)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium bg-[#080c16]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Duration & Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Duration (Minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium bg-[#080c16]"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes (2 Hours)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                  Escrow Fee (XLM) *
                </label>
                <div className="relative">
                  <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={feeXlm}
                    onChange={(e) => setFeeXlm(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-bold text-cyan-300"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                Description & Agenda *
              </label>
              <textarea
                rows={3}
                placeholder="Explain what skills will be covered, prerequisites, or session outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                Tags (Press Enter or Add)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. React, Tailwind, Stellar"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-sm uppercase tracking-wider font-tech shadow-xl shadow-cyan-500/20 transition-all duration-200"
              >
                Publish Skill Session to Stellar Testnet
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
