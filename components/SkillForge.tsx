
import React, { useState, useEffect } from 'react';
import { generateStudyRoadmap, explainConcept, generateQuiz, generateFinalExam, getGroundedResources } from '../services/geminiService';
import { StudyPlan, ConceptExplanation, QuizQuestion, SavedStudyPlan, Certificate, UserProfile } from '../types';
import { db } from '../services/database';
import { BookOpen, Target, CheckCircle2, Loader2, Sparkles, X, Lightbulb, GraduationCap, BrainCircuit, Check, History, Plus, Medal, Video, ArrowRight, Shield, Globe, ExternalLink, ClipboardCheck, Award, RefreshCcw, Info, Trophy, ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react';

interface SkillForgeProps {
  onRegister?: (title: string, price: number, id: string) => void;
  refreshTrigger?: number;
  initialTopic?: string;
  user: UserProfile | null;
}

export const SkillForge: React.FC<SkillForgeProps> = ({ onRegister, refreshTrigger = 0, initialTopic = '', user }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<SavedStudyPlan | null>(null);
  const [view, setView] = useState<'NEW' | 'HISTORY' | 'CERTIFICATES_LIST' | 'CERTIFICATE'>('NEW');
  const [history, setHistory] = useState<SavedStudyPlan[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Concept/Resources State
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<ConceptExplanation | null>(null);
  const [groundedLinks, setGroundedLinks] = useState<{uri: string, title: string}[]>([]);
  const [groundingLoading, setGroundingLoading] = useState(false);
  
  // Quiz/Test State
  const [examLoading, setExamLoading] = useState(false);
  const [activeExam, setActiveExam] = useState<QuizQuestion[] | null>(null);
  const [examType, setExamType] = useState<'WEEKLY' | 'FINAL'>('WEEKLY');
  const [examWeek, setExamWeek] = useState<number | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult] = useState<{ score: number, total: number, passed: boolean, results: {q: string, correct: boolean}[] } | null>(null);

  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  // Unified Initialization and Session Restoration
  useEffect(() => {
    const initForge = async () => {
      // If we are in Guest mode or No user yet, just clear and return
      if (!user) {
        setIsRestoring(false);
        return;
      }
      
      try {
        setIsRestoring(true);
        const saved = await db.content.getPlans(user.email);
        setHistory(saved);
        
        if (initialTopic) {
          setTopic(initialTopic);
          setView('NEW');
        } else if (saved.length > 0 && !plan) {
          // Do not auto-select, let user choose from history
        }
      } catch (err) {
        console.error("MindGear Session Restoration Failed:", err);
      } finally {
        setIsRestoring(false);
      }
    };
    initForge();
  }, [user?.email, initialTopic]);

  // Sync history periodically or on trigger
  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        const saved = await db.content.getPlans(user.email);
        setHistory(saved);
      }
    };
    loadHistory();
  }, [user?.email, view, refreshTrigger, plan?.id]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true); setPlan(null); setExplanation(null);
    try {
      const result = await generateStudyRoadmap(topic, level);
      if (user) {
        const savedPlan = await db.content.savePlan(user.email, result);
        setPlan(savedPlan);
        setHistory(await db.content.getPlans(user.email));
      } else {
         setPlan({ ...result, id: 'guest-id', userId: 'guest', createdAt: new Date().toISOString(), completedWeeks: [] });
      }
    } catch (error) { 
        alert("Curriculum forging failed. Please check your neural link."); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleConceptClick = async (concept: string) => {
    setExplaining(true); setExplanation(null);
    setGroundedLinks([]);
    try { 
        const res = await explainConcept(concept, plan?.topic || topic); 
        setExplanation(res); 
        setGroundingLoading(true);
        const grounded = await getGroundedResources(concept, plan?.topic || topic);
        setGroundedLinks(grounded.links);
        setGroundingLoading(false);
    } catch (e) { setExplaining(false); }
  };

  const startExam = async (weekStep?: any) => {
    setExamLoading(true);
    setExamResult(null);
    setExamAnswers({});
    setCurrentQuestionIdx(0);
    setExamType(weekStep ? 'WEEKLY' : 'FINAL');
    setExamWeek(weekStep ? weekStep.week : null);
    
    try {
      let questions;
      if (weekStep) {
        questions = await generateQuiz(plan?.topic || topic, weekStep.title, weekStep.keyConcepts);
      } else if (plan) {
        questions = await generateFinalExam(plan.topic, plan.roadmap);
      }
      setActiveExam(questions);
    } catch (e) {
      alert("System overload. Assessment environment failed to stabilize.");
      setActiveExam(null);
    } finally {
      setExamLoading(false);
    }
  };

  const submitExam = () => {
    if (!activeExam) return;
    const results = activeExam.map((q, idx) => ({
      q: q.question,
      correct: examAnswers[idx] === q.correctAnswerIndex
    }));
    const score = results.filter(r => r.correct).length;
    // Final exam requires 80%, weekly 70%
    const passThreshold = examType === 'WEEKLY' ? 0.7 : 0.8;
    const passed = (score / activeExam.length) >= passThreshold;
    setExamResult({ score, total: activeExam.length, passed, results });
  };

  const handleFinishModule = async () => {
    if (!plan || !user) return;

    if (examType === 'WEEKLY' && examWeek !== null && examResult?.passed) {
      await toggleWeekCompletion(examWeek);
      setActiveExam(null);
      setExamResult(null);
    } else if (examType === 'FINAL' && examResult?.passed) {
      // Generate Certificate
      const newCertificate: Certificate = {
        id: crypto.randomUUID().slice(0, 8).toUpperCase(),
        studentName: user.name,
        courseName: plan.topic,
        issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        difficulty: plan.difficulty,
        signature: 'Mind is Gear Training'
      };

      try {
        await db.content.updateStudyProgress(user.email, plan.id, plan.completedWeeks || [], newCertificate);
        
        // Update local state
        const updatedPlan = { ...plan, certificate: newCertificate };
        setPlan(updatedPlan);
        setActiveCertificate(newCertificate);
        
        // Close modal and show certificate view
        setActiveExam(null);
        setExamResult(null);
        setView('CERTIFICATE');
      } catch (e) {
        console.error("Certificate Generation Failed", e);
        alert("Failed to issue certificate. Please contact admin.");
      }
    }
  };

  const toggleWeekCompletion = async (weekNum: number) => {
    if (!plan || !user) return;
    const completed = plan.completedWeeks || [];
    if (completed.includes(weekNum)) return;
    
    const newCompleted = [...completed, weekNum];

    const updatedPlan = { ...plan, completedWeeks: newCompleted };
    setPlan(updatedPlan);
    try { 
      await db.content.updateStudyProgress(user.email, plan.id, newCompleted, plan.certificate); 
    } catch (e) {
      console.error("Progress save failed:", e);
    }
  };

  // LOGIC FOR SEQUENTIAL PROGRESSION
  // Find the lowest week number that is NOT in completedWeeks.
  const nextRequiredWeek = plan?.roadmap
    .map(r => r.week)
    .sort((a, b) => a - b)
    .find(week => !(plan.completedWeeks || []).includes(week));
  
  // If nextRequiredWeek is undefined, it means all weeks are done.
  const isFinalUnlocked = plan && (!nextRequiredWeek && (plan.completedWeeks?.length === plan.roadmap.length));
  
  const progressPercentage = plan ? Math.round(((plan.completedWeeks?.length || 0) / plan.roadmap.length) * 100) : 0;

  if (isRestoring) {
    return (
      <div className="flex flex-col items-center justify-center py-48">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-brand-500 animate-spin" />
          <BrainCircuit className="w-6 h-6 text-brand-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-2xl font-display font-bold text-white mt-8">Loading Training Programs</h3>
        <p className="text-slate-500 mt-2 max-w-xs text-center">Retrieving your training history and progress.</p>
      </div>
    );
  }

  // --- CERTIFICATE VIEW ---
  if (view === 'CERTIFICATE' && activeCertificate) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-fade-in">
        <div className="flex gap-4 mb-8 no-print">
            <button onClick={() => setView('NEW')} className="flex items-center text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5 mr-1" /> Back to Academy
            </button>
            <button onClick={() => setView('CERTIFICATES_LIST')} className="flex items-center text-slate-400 hover:text-brand-400 transition-colors">
              <Medal className="w-4 h-4 mr-2" /> Certificate Wallet
            </button>
        </div>
        
        <div className="relative">
          {/* Printable Area */}
          <div id="printable-certificate" className="bg-[#fffdf5] text-slate-900 p-12 rounded-xl shadow-2xl relative overflow-hidden border-[16px] border-double border-slate-900">
            {/* Watermark/Decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 border-r-2 border-b-2 border-brand-500/20 rounded-br-[4rem]"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-l-2 border-t-2 border-brand-500/20 rounded-tl-[4rem]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-[30px] border-slate-100 rounded-full opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10 text-center flex flex-col items-center">
               <div className="w-20 h-20 mb-6 text-slate-900">
                  <BrainCircuit className="w-full h-full" />
               </div>
               
               <h1 className="text-5xl font-display font-bold text-slate-900 mb-2 uppercase tracking-tight">Certificate</h1>
               <h2 className="text-xl font-serif italic text-slate-500 mb-12">of Mastery Completion</h2>
               
               <p className="text-slate-600 text-lg mb-2">This is to certify that</p>
               <h3 className="text-4xl font-serif font-bold text-brand-700 mb-2 border-b-2 border-slate-200 pb-2 px-12 inline-block min-w-[300px]">
                 {activeCertificate.studentName}
               </h3>
               
               <p className="text-slate-600 text-lg mt-8 mb-2">Has successfully demonstrated proficiency in</p>
               <h4 className="text-3xl font-bold text-slate-900 mb-4">{activeCertificate.courseName}</h4>
               
               <p className="text-slate-500 max-w-lg mx-auto leading-relaxed mb-12">
                 Having completed the {activeCertificate.difficulty} level curriculum and passed the final comprehensive assessment with distinction.
               </p>
               
               <div className="flex justify-between w-full max-w-2xl mt-12 pt-8 border-t border-slate-200">
                  <div className="text-center">
                     <p className="font-serif font-bold text-lg text-slate-900">{activeCertificate.signature}</p>
                     <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Issuing Authority</p>
                  </div>
                  <div className="w-24 h-24 relative">
                     <div className="absolute inset-0 bg-brand-600 rounded-full opacity-10"></div>
                     <div className="absolute inset-2 border-2 border-brand-600 rounded-full flex items-center justify-center">
                        <Award className="w-10 h-10 text-brand-700" />
                     </div>
                  </div>
                  <div className="text-center">
                     <p className="font-mono font-bold text-lg text-slate-900">{activeCertificate.issueDate}</p>
                     <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Date Issued</p>
                     <p className="text-[10px] text-slate-300 mt-2 font-mono">ID: {activeCertificate.id}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-8 flex justify-center gap-4 no-print">
            <button onClick={() => window.print()} className="flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg">
              <Printer className="w-5 h-5 mr-2" /> Print Certificate
            </button>
            <button onClick={() => { setView('NEW'); setPlan(null); }} className="flex items-center px-6 py-3 border border-slate-700 text-slate-400 hover:text-white rounded-xl font-bold transition-all">
              Start New Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ACADEMY VIEW ---
  return (
    <div className="w-full relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 no-print">
        <div><span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-2 block">Client Development</span><h2 className="text-4xl font-display font-bold text-white">Training Programs</h2></div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
           <button onClick={() => setView('NEW')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center transition-all whitespace-nowrap ${view === 'NEW' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Plus className="w-4 h-4 mr-2" />New Program</button>
           <button onClick={() => setView('HISTORY')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center transition-all whitespace-nowrap ${view === 'HISTORY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><History className="w-4 h-4 mr-2" />Past Programs</button>
           <button onClick={() => setView('CERTIFICATES_LIST')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center transition-all whitespace-nowrap ${view === 'CERTIFICATES_LIST' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Medal className="w-4 h-4 mr-2" />Certificates</button>
        </div>
      </div>

      {view === 'NEW' && (
        <>
          <div className="max-w-4xl mx-auto mb-16 no-print">
            <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row items-center gap-4">
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What skill does your team need?" className="flex-grow bg-transparent border-none text-white text-lg placeholder-slate-500 focus:ring-0 outline-none px-4 py-4" />
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none cursor-pointer">
                <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
              </select>
              <button onClick={handleCreatePlan} disabled={loading || !topic} className="w-full md:w-auto bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <span className="flex items-center gap-2"><Sparkles className="w-5 h-5"/> Build Training Program</span>}
              </button>
            </div>
          </div>

          {plan && (
            <div className="max-w-5xl mx-auto animate-fade-in pb-24 no-print">
              <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-800 pb-4">
                <div><h3 className="text-3xl font-display font-bold text-white capitalize">{plan.topic}</h3><span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-brand-400 text-sm font-medium border border-slate-700 mt-2"><Target className="w-3 h-3 mr-2" />{plan.difficulty} Track</span></div>
                <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
                  <div className="flex items-center gap-4"><div className="text-right"><div className="text-sm text-slate-400 font-medium">Path Completion</div><div className="text-xl font-bold text-brand-400">{progressPercentage}%</div></div></div>
                  <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div></div>
                </div>
              </div>

              <div className="relative mb-16">
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 transform md:-translate-x-1/2"></div>
                <div className="space-y-12">
                  {plan.roadmap.map((step, idx) => {
                    const isDone = (plan.completedWeeks || []).includes(step.week);
                    
                    // Locked Logic: Locked if previous weeks aren't done.
                    // If step.week is 2, and nextRequiredWeek is 1, then this is locked.
                    // Effectively: Locked if step.week > (nextRequiredWeek or infinity if all done)
                    const effectiveLock = !isDone && (nextRequiredWeek !== undefined && step.week > nextRequiredWeek);

                    return (
                      <div key={idx} className={`relative flex flex-col md:flex-row gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''} ${effectiveLock ? 'opacity-40 grayscale' : ''}`}>
                        <div className={`absolute left-4 md:left-1/2 w-8 h-8 rounded-full border-4 border-slate-950 transform -translate-x-1/2 mt-6 z-10 flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-emerald-500' : effectiveLock ? 'bg-slate-700' : 'bg-brand-500 ring-4 ring-brand-500/20'}`}>
                           {isDone ? <Check className="w-4 h-4 text-white" /> : effectiveLock ? <Shield className="w-3 h-3 text-slate-400" /> : <BrainCircuit className="w-4 h-4 text-white" />}
                        </div>

                        <div className="ml-12 md:ml-0 md:w-1/2">
                          <div className={`p-6 rounded-2xl glass-panel border transition-all duration-500 relative ${isDone ? 'border-emerald-500/30 bg-emerald-950/10' : effectiveLock ? 'border-slate-800 bg-slate-900/50' : 'border-brand-500 bg-slate-900 shadow-xl'} ${idx % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                            <div className="flex items-center justify-between mb-4">
                              <span className={`font-bold text-xs tracking-wider uppercase px-2 py-0.5 rounded ${isDone ? 'text-emerald-400 bg-emerald-950/50' : 'text-brand-400 bg-brand-950/50'}`}>Week {step.week}</span>
                              {isDone && <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center"><Medal className="w-3 h-3 mr-1" /> Verified Mastery</span>}
                              {effectiveLock && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center"><Shield className="w-3 h-3 mr-1" /> Locked</span>}
                            </div>
                            <h4 className={`text-xl font-bold mb-2 ${isDone ? 'text-emerald-50' : 'text-white'}`}>{step.title}</h4>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{step.description}</p>
                            
                            <div className="bg-slate-950/50 rounded-xl p-4 mb-6 border border-slate-800/50">
                              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Core Concepts</h5>
                              <div className="space-y-2">
                                {step.keyConcepts.map((concept, i) => (
                                  <button key={i} disabled={effectiveLock} onClick={() => handleConceptClick(concept)} className="flex items-center text-xs text-slate-300 hover:text-brand-400 transition-colors w-full text-left group disabled:opacity-50 disabled:hover:text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-2 group-hover:bg-brand-500"></div>
                                    {concept}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {!isDone ? (
                              <button 
                                onClick={() => startExam(step)}
                                disabled={effectiveLock}
                                className="w-full py-3 bg-brand-600/10 border border-brand-500/30 hover:bg-brand-600/20 text-brand-400 rounded-xl text-sm font-bold flex items-center justify-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:border-slate-700 disabled:text-slate-500"
                              >
                                {effectiveLock ? (
                                    <span>Complete previous week first</span>
                                ) : (
                                    <>
                                        <ClipboardCheck className="w-4 h-4 mr-2" /> Take Mastery Exam (10 Qs)
                                    </>
                                )}
                              </button>
                            ) : (
                              <div className="flex gap-2">
                                <div className="flex-grow text-center py-2 px-4 rounded-lg bg-emerald-900/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                                    Module Finished
                                </div>
                                <button onClick={() => startExam(step)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg" title="Retake to improve score">
                                    <RefreshCcw className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="hidden md:block md:w-1/2"></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`max-w-3xl mx-auto p-12 rounded-[2.5rem] border-2 border-dashed transition-all relative overflow-hidden ${isFinalUnlocked ? 'border-brand-500 bg-brand-950/10 shadow-2xl shadow-brand-500/10' : 'border-slate-800 opacity-50'}`}>
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Trophy className="w-48 h-48 text-brand-400" />
                 </div>
                 <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Award className="w-10 h-10 text-brand-400" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-white mb-3">Program Completion Assessment</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                        {isFinalUnlocked 
                           ? "You have completed all modules. Pass the final assessment to earn your program certification."
                           : "Complete all weekly modules above to unlock the final assessment and earn your certification."
                        }
                    </p>
                    <button 
                        disabled={!isFinalUnlocked}
                        onClick={() => startExam()}
                        className="px-12 py-5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-2xl shadow-brand-900/40 transition-all flex items-center justify-center mx-auto group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        {isFinalUnlocked ? (
                            <>Begin Graduation Exam <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                        ) : (
                            <><Shield className="w-5 h-5 mr-2" /> Exam Locked</>
                        )}
                    </button>
                 </div>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'CERTIFICATES_LIST' && (
        <div className="animate-fade-in pb-24">
            <div className="flex items-center gap-4 mb-10">
                <Award className="w-8 h-8 text-brand-400" />
                <h3 className="text-3xl font-display font-bold text-white">Credentials Wallet</h3>
            </div>
            {history.filter(p => p.certificate).length === 0 ? (
                 <div className="text-center py-32 bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-800">
                    <Medal className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                    <p className="text-slate-500 text-lg">No certifications earned yet.</p>
                    <button onClick={() => setView('NEW')} className="mt-6 text-brand-400 font-bold hover:underline">Start a Mastery Path</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {history.filter(p => p.certificate).map(p => (
                        <button
                            key={p.id}
                            onClick={() => {
                                setActiveCertificate(p.certificate);
                                setView('CERTIFICATE');
                            }}
                            className="bg-[#fffdf5] p-2 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform group text-left"
                        >
                            <div className="border-4 border-double border-slate-200 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                                 <div className="absolute top-0 left-0 w-16 h-16 border-r border-b border-slate-100 rounded-br-3xl"></div>
                                 <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-brand-600">
                                    <Award className="w-6 h-6" />
                                 </div>
                                 <h4 className="font-serif font-bold text-slate-900 text-lg leading-tight mb-2">{p.certificate?.courseName}</h4>
                                 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">Issued: {p.certificate?.issueDate}</p>
                                 <div className="mt-auto pt-4 border-t border-slate-100 w-full">
                                    <span className="text-xs font-bold text-brand-600 group-hover:underline">View Certificate</span>
                                 </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
      )}

      {activeExam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl animate-fade-in no-print overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2.5rem] shadow-2xl relative my-8 overflow-hidden">
                <div className="bg-slate-950 p-8 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-500/10 rounded-xl"><ClipboardCheck className="w-6 h-6 text-brand-400" /></div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-none">
                                {examType === 'WEEKLY' ? `Module ${examWeek} Mastery` : 'Final Graduation Assessment'}
                            </h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-bold">Passing requirement: {examType === 'WEEKLY' ? '7/10' : '16/20'}</p>
                        </div>
                    </div>
                    {!examResult && (
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Question</div>
                                <div className="text-white font-mono font-bold text-lg">{currentQuestionIdx + 1} / {activeExam.length}</div>
                            </div>
                            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${((currentQuestionIdx + 1) / activeExam.length) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                    {examResult && (
                        <button onClick={() => setActiveExam(null)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><X className="w-5 h-5" /></button>
                    )}
                </div>

                <div className="p-10">
                    {examLoading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="w-12 h-12 text-brand-400 animate-spin mx-auto mb-6" />
                            <p className="text-slate-400 font-medium animate-pulse">Constructing virtual assessment room...</p>
                        </div>
                    ) : !examResult ? (
                        <div className="animate-slide-up">
                            <div className="mb-10">
                                <span className="text-brand-500 font-bold text-xs uppercase tracking-widest mb-4 block">Question #{currentQuestionIdx + 1}</span>
                                <h4 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                    {activeExam[currentQuestionIdx].question}
                                </h4>
                            </div>
                            <div className="space-y-4">
                                {activeExam[currentQuestionIdx].options.map((option, oIdx) => (
                                    <button 
                                        key={oIdx}
                                        onClick={() => setExamAnswers(prev => ({ ...prev, [currentQuestionIdx]: oIdx }))}
                                        className={`w-full p-6 rounded-2xl text-left text-base font-medium transition-all border-2 ${
                                            examAnswers[currentQuestionIdx] === oIdx 
                                            ? 'bg-brand-600/10 border-brand-500 text-white shadow-lg shadow-brand-500/5' 
                                            : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${examAnswers[currentQuestionIdx] === oIdx ? 'border-brand-400 bg-brand-400' : 'border-slate-700'}`}>
                                                {examAnswers[currentQuestionIdx] === oIdx && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            {option}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-16 flex justify-between items-center pt-10 border-t border-slate-800">
                                <button 
                                    onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))} 
                                    disabled={currentQuestionIdx === 0} 
                                    className="px-6 py-3 text-slate-500 hover:text-white disabled:opacity-30 font-bold transition-all flex items-center"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                                </button>
                                {currentQuestionIdx === activeExam.length - 1 ? (
                                    <button 
                                        onClick={submitExam} 
                                        disabled={Object.keys(examAnswers).length < activeExam.length} 
                                        className="px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-2xl shadow-brand-900/30 transition-all disabled:opacity-50"
                                    >
                                        Finalize & Submit
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setCurrentQuestionIdx(p => Math.min(activeExam.length - 1, p + 1))} 
                                        disabled={examAnswers[currentQuestionIdx] === undefined} 
                                        className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center"
                                    >
                                        Next Question <ChevronRight className="w-5 h-5 ml-2" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 animate-scale-in">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border-4 ${examResult.passed ? 'bg-emerald-500/20 border-emerald-500' : 'bg-red-500/20 border-red-500'}`}>
                                {examResult.passed ? <Trophy className="w-12 h-12 text-emerald-500" /> : <X className="w-12 h-12 text-red-500" />}
                            </div>
                            <h4 className="text-4xl font-display font-bold text-white mb-3">
                                {examResult.passed ? (examType === 'FINAL' ? 'Graduation Complete!' : 'Module Passed') : 'Verification Failed'}
                            </h4>
                            <div className="flex justify-center gap-2 mb-10">
                                <span className="text-slate-400 text-lg">Score achieved:</span>
                                <span className={`text-lg font-bold ${examResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>{examResult.score} / {examResult.total}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700">
                                {examResult.results.map((res, i) => (
                                    <div key={i} className={`p-4 rounded-xl border flex items-start gap-3 ${res.correct ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-red-950/10 border-red-500/20'}`}>
                                        {res.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" /> : <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />}
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Question {i+1}</p>
                                            <p className={`text-xs ${res.correct ? 'text-slate-300' : 'text-slate-400 italic'}`}>{res.q}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 justify-center">
                                {examResult.passed ? (
                                    <button onClick={handleFinishModule} className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-900/20 transition-all flex items-center">
                                        {examType === 'FINAL' ? 'Issue Certificate' : 'Continue Path'} <ChevronRight className="w-5 h-5 ml-2" />
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => { setActiveExam(null); setExamResult(null); }} className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-colors">Return to Map</button>
                                        <button onClick={() => startExam(examType === 'WEEKLY' ? { week: examWeek, title: 'Retake', keyConcepts: [] } : undefined)} className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold flex items-center hover:bg-brand-500 transition-colors shadow-lg shadow-brand-900/20">
                                            <RefreshCcw className="w-4 h-4 mr-2" /> Retake Assessment
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {explaining && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[2rem] shadow-2xl relative my-8">
            <button onClick={() => setExplaining(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <div className="p-10">
              {!explanation ? ( 
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-brand-400 animate-spin" />
                    <p className="mt-4 text-slate-400 font-medium animate-pulse">Extracting intelligence...</p>
                </div> 
              ) : (
                <div className="animate-slide-up">
                  <div className="flex items-center space-x-4 mb-10">
                    <div className="p-4 bg-brand-500/10 rounded-2xl"><GraduationCap className="w-8 h-8 text-brand-400" /></div>
                    <h3 className="text-3xl font-display font-bold text-white leading-tight">{explanation.concept}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center"><Shield className="w-3.5 h-3.5 mr-2" /> Neural Definition</h4>
                            <p className="text-slate-200 leading-relaxed text-lg">{explanation.definition}</p>
                        </div>
                        <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/30">
                            <div className="flex items-center text-blue-400 mb-3"><Lightbulb className="w-4 h-4 mr-2" /><span className="font-bold text-xs uppercase tracking-wider">Operational Context</span></div>
                            <p className="text-slate-300 text-sm leading-relaxed">{explanation.example}</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800">
                            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-6 flex items-center"><Globe className="w-3.5 h-3.5 mr-2" /> Data Grounding</h4>
                            {groundingLoading ? <div className="space-y-3"><div className="h-4 bg-slate-800 rounded animate-pulse"></div><div className="h-4 bg-slate-800 rounded animate-pulse w-2/3"></div></div> : groundedLinks.length > 0 ? (
                                <ul className="space-y-4">{groundedLinks.map((link, i) => (
                                    <li key={i}><a href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-start group/link"><ExternalLink className="w-4 h-4 mr-3 text-slate-600 group-hover/link:text-brand-400 transition-colors flex-shrink-0 mt-0.5" /><span className="text-xs text-slate-400 group-hover/link:text-white transition-colors line-clamp-2">{link.title}</span></a></li>
                                ))}</ul>
                            ) : <p className="text-xs text-slate-600 italic">No external grounding.</p>}
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-slate-950 p-8 border-t border-slate-800 flex justify-end items-center rounded-b-[2rem]">
              <button onClick={() => setExplaining(false)} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all">Close Module</button>
            </div>
          </div>
        </div>
      )}

      {view === 'HISTORY' && (
        <div className="animate-fade-in pb-24">
            <div className="flex items-center gap-4 mb-10">
                <History className="w-8 h-8 text-brand-400" />
                <h3 className="text-3xl font-display font-bold text-white">Training History</h3>
            </div>
            {history.length === 0 ? (
                <div className="text-center py-32 bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-800">
                    <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                    <p className="text-slate-500 text-lg">No training programs created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {history.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => { 
                                setPlan(p); 
                                if (p.certificate) {
                                  setActiveCertificate(p.certificate);
                                  setView('CERTIFICATE');
                                } else {
                                  setView('NEW'); 
                                }
                            }}
                            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-left hover:border-brand-500/50 transition-all group relative overflow-hidden shadow-xl"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles className="w-20 h-20 text-brand-400" />
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-brand-950 text-brand-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-brand-500/20">{p.difficulty}</span>
                                <span className="text-slate-500 text-xs font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-4 capitalize">{p.topic}</h4>
                            <div className="flex items-center gap-6 mt-10">
                                <div className="flex-grow bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div className="h-full bg-brand-500" style={{ width: `${Math.round(((p.completedWeeks?.length || 0) / p.roadmap.length) * 100)}%` }}></div>
                                </div>
                                {p.certificate ? (
                                   <span className="text-xs font-bold text-emerald-400 flex items-center"><Award className="w-4 h-4 mr-1"/> Certified</span>
                                ) : (
                                   <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{p.completedWeeks?.length || 0} / {p.roadmap.length} Modules</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};
