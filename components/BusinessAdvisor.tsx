
import React, { useState, useEffect } from 'react';
import { generateBusinessAdvice } from '../services/geminiService';
import { BusinessSolution, SavedBusinessStrategy, UserProfile } from '../types';
import { db } from '../services/database';
import { Zap, TrendingUp, Lightbulb, Loader2, ArrowRight, Briefcase, Brain, History, Save, ChevronRight, Plus, GraduationCap } from 'lucide-react';

interface BusinessAdvisorProps {
  onBridge?: (topic: string) => void;
  user: UserProfile | null;
}

// Pass user from parent as a prop to resolve the missing db.auth.getSession functionality
export const BusinessAdvisor: React.FC<BusinessAdvisorProps> = ({ onBridge, user }) => {
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [solutions, setSolutions] = useState<BusinessSolution[] | null>(null);
  const [view, setView] = useState<'NEW' | 'HISTORY'>('NEW');
  const [history, setHistory] = useState<SavedBusinessStrategy[]>([]);

  // Load strategy history when user profile is available
  useEffect(() => {
    const loadData = async () => {
      if (user?.email) {
        const saved = await db.content.getStrategies(user.email);
        setHistory(saved);
      }
    };
    loadData();
  }, [user?.email, solutions, view]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !description) return;
    
    setLoading(true);
    setSolutions(null);
    try {
      const results = await generateBusinessAdvice(description, industry);
      setSolutions(results);
      
      // Auto-save strategy if user is logged in
      if (user?.email) {
        await db.content.saveStrategy(user.email, industry, description, results);
        const updated = await db.content.getStrategies(user.email);
        setHistory(updated);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (strategy: SavedBusinessStrategy) => {
    setIndustry(strategy.industry);
    setDescription(strategy.description);
    setSolutions(strategy.solutions);
    setView('NEW');
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'automation': return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'growth': return <TrendingUp className="w-6 h-6 text-green-400" />;
      default: return <Lightbulb className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="py-12 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="relative px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="text-left">
            <div className="flex items-center space-x-3 mb-2">
               <div className="inline-flex items-center justify-center p-2 bg-brand-500/10 rounded-lg">
                  <Briefcase className="w-6 h-6 text-brand-400" />
               </div>
               <h2 className="text-3xl font-display font-bold text-white">AI Business Architect</h2>
            </div>
            <p className="text-slate-400 max-w-xl text-sm">
              Strategic analysis engine. Generate new insights or review your enterprise history.
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
             <button 
                onClick={() => setView('NEW')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center transition-all ${view === 'NEW' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <Plus className="w-4 h-4 mr-2" />
                New Strategy
             </button>
             <button 
                onClick={() => setView('HISTORY')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center transition-all ${view === 'HISTORY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <History className="w-4 h-4 mr-2" />
                History ({history.length})
             </button>
          </div>
        </div>

        {view === 'NEW' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <form onSubmit={handleAnalyze} className="space-y-6 glass-panel p-6 rounded-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Retail, Healthcare, Logistics"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Business Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your current operations and challenges..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-brand-900/50 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Strategy</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Output Section */}
            <div className="lg:col-span-3">
              {!solutions && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl p-12">
                  <Brain className="w-16 h-16 mb-4 opacity-20" />
                  <p>Describe your business to begin</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                   <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   </div>
                   <p className="text-brand-400 font-medium">Constructing neural strategies...</p>
                </div>
              )}

              {solutions && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-white font-bold">Analysis Results</h3>
                     <span className="text-xs text-emerald-400 flex items-center"><Save className="w-3 h-3 mr-1"/> Auto-saved to Database</span>
                  </div>
                  {solutions.map((solution, idx) => (
                    <div 
                      key={idx} 
                      className="glass-panel p-6 rounded-xl border-l-4 border-l-brand-500 hover:bg-slate-800/50 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-slate-900 rounded-lg">
                            {getIcon(solution.iconType)}
                          </div>
                          <h3 className="text-xl font-bold text-white">{solution.title}</h3>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-400 border border-brand-500/30 px-2 py-1 rounded">
                          {solution.iconType}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-4 leading-relaxed">
                        {solution.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm font-medium text-emerald-400 bg-emerald-950/30 p-2 rounded-lg">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Impact: {solution.impact}
                        </div>
                        
                        {/* THE BRIDGE BUTTON */}
                        {onBridge && (
                            <button 
                                onClick={() => onBridge(solution.title)}
                                className="flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg hover:-translate-y-0.5"
                                title="Generate Training Course for this Strategy"
                            >
                                <GraduationCap className="w-3 h-3 mr-2" />
                                Train Team
                            </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* History View */
          <div className="animate-fade-in">
             {history.length === 0 ? (
               <div className="text-center py-24 text-slate-500">
                 <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                 <p>No saved strategies found in database.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {history.map((item) => (
                   <button 
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left hover:border-brand-500/50 transition-all group"
                   >
                     <div className="flex justify-between items-start mb-4">
                       <span className="text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20 px-2 py-1 rounded bg-brand-900/10">
                         {item.industry}
                       </span>
                       <span className="text-slate-500 text-xs">
                         {new Date(item.date).toLocaleDateString()}
                       </span>
                     </div>
                     <p className="text-slate-300 text-sm line-clamp-2 mb-4 h-10">
                       {item.description}
                     </p>
                     <div className="flex items-center text-brand-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                       View Strategies <ChevronRight className="w-4 h-4 ml-1" />
                     </div>
                   </button>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
