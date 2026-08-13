import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Clock, 
  Zap, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { SkillSession, FilterType } from '../types';

interface SessionGridProps {
  sessions: SkillSession[];
  onAcceptSession: (session: SkillSession) => void;
  onOpenCreateModal: () => void;
  connectedAddress: string;
}

const CATEGORIES = [
  'All',
  'Web3 & Smart Contracts',
  'Frontend & UI/UX',
  'Python & Data Science',
  'DeFi & Algorithmic Trading',
  'Cybersecurity'
];

export const SessionGrid: React.FC<SessionGridProps> = ({
  sessions,
  onAcceptSession,
  onOpenCreateModal,
  connectedAddress,
}) => {
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Type filter
      if (filterType === 'OFFER' && s.type !== 'OFFER') return false;
      if (filterType === 'REQUEST' && s.type !== 'REQUEST') return false;

      // Category filter
      if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;

      // Level filter
      if (selectedLevel !== 'ALL' && s.level !== selectedLevel) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        const matchesCreator = s.creatorName.toLowerCase().includes(q);
        const matchesCategory = s.category.toLowerCase().includes(q);
        const matchesTags = s.tags.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesDesc || matchesCreator || matchesCategory || matchesTags;
      }

      return true;
    });
  }, [sessions, filterType, selectedCategory, selectedLevel, searchQuery]);

  const formatAddress = (addr: string) => {
    if (!addr) return 'Stellar User';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <section className="w-full space-y-6">
      
      {/* AntiGravity Search & Filter Control Bar */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-5 shadow-2xl">
        
        {/* Top Segment Controls + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Offer / Request Type Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-950 border border-slate-800 self-start shadow-inner">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-tech ${
                filterType === 'ALL'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setFilterType('OFFER')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-tech flex items-center gap-2 ${
                filterType === 'OFFER'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Zap className="w-4 h-4" />
              Teach Offers ({sessions.filter((s) => s.type === 'OFFER').length})
            </button>
            <button
              onClick={() => setFilterType('REQUEST')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-tech flex items-center gap-2 ${
                filterType === 'REQUEST'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Learn Requests ({sessions.filter((s) => s.type === 'REQUEST').length})
            </button>
          </div>

          {/* Futuristic Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-cyan-400" />
            <input
              type="text"
              placeholder="Search by skill, title, tag or mentor address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-xs sm:text-sm font-medium placeholder-slate-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white font-tech"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-tech mr-1 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-tech ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid Status Header */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2 font-tech">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <p className="text-xs text-slate-300">
            Showing <span className="text-cyan-300 font-bold">{filteredSessions.length}</span> Verified Skill Transfer Opportunities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-400 font-tech uppercase font-bold">Difficulty Level:</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-tech"
          >
            <option value="ALL">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Dynamic Session Cards Grid */}
      {filteredSessions.length === 0 ? (
        <div className="py-20 text-center rounded-3xl glass-panel border border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-tech">No Skill Sessions Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 mb-6">
            Try adjusting your search criteria or create a new skill session on Stellar Testnet!
          </p>
          <button
            onClick={onOpenCreateModal}
            className="btn-shimmer px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider font-tech shadow-lg shadow-cyan-500/25 transition-all"
          >
            + Create Skill Session
          </button>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredSessions.map((session) => {
              const isOffer = session.type === 'OFFER';
              const isInEscrow = session.status === 'IN_ESCROW';
              const isCreator = connectedAddress && connectedAddress.toLowerCase() === session.creatorAddress.toLowerCase();

              return (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between ${
                    isOffer ? 'glass-card' : 'glass-card-violet'
                  }`}
                >
                  
                  {/* Top Card Section */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      
                      {/* Type Pill */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-tech ${
                          isOffer
                            ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-sm'
                            : 'bg-purple-500/15 border border-purple-400/40 text-purple-300 shadow-sm'
                        }`}
                      >
                        {isOffer ? (
                          <>
                            <Zap className="w-3 h-3 text-cyan-400" />
                            Offer to Teach
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3 h-3 text-purple-400" />
                            Request to Learn
                          </>
                        )}
                      </span>

                      {/* Level Badge */}
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-tech">
                        {session.level}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {session.title}
                    </h3>

                    {/* Category Label */}
                    <p className="text-[11px] text-cyan-400/90 font-mono mt-1 mb-3 font-tech font-bold">
                      {session.category}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-5 font-normal">
                      {session.description}
                    </p>

                    {/* Tag list */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {session.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md bg-slate-950 text-slate-400 border border-slate-800/80"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom / User Info & Action */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-4">
                    
                    {/* User Avatar + Address */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={session.creatorAvatar}
                          alt={session.creatorName}
                          className="w-8.5 h-8.5 rounded-full object-cover border border-cyan-500/40 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            {session.creatorName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-tech">
                            {formatAddress(session.creatorAddress)}
                          </p>
                        </div>
                      </div>

                      {/* Session Duration */}
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-tech font-bold">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{session.durationMinutes}m</span>
                      </div>
                    </div>

                    {/* Price Tag & Escrow Action */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      
                      {/* XLM Fee */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block font-tech">
                          Escrow Deposit
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-cyan-300 font-tech">
                            {session.feeXlm}
                          </span>
                          <span className="text-xs font-bold text-cyan-400">XLM</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isInEscrow ? (
                        <div className="flex flex-col items-end">
                          <span className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 font-tech">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                            Escrow Vaulted
                          </span>
                          {session.escrowTxHash && (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${session.escrowTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 mt-1 font-tech"
                            >
                              Tx Hash <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => onAcceptSession(session)}
                          disabled={Boolean(isCreator)}
                          className={`btn-shimmer px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider font-tech transition-all duration-300 flex items-center gap-1.5 shadow-lg ${
                            isCreator
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              : isOffer
                              ? 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5'
                          }`}
                        >
                          <span>{isCreator ? 'Your Session' : isOffer ? 'Lock Escrow & Book' : 'Offer to Teach'}</span>
                          {!isCreator && <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

    </section>
  );
};
