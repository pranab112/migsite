
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SkillForge } from './components/SkillForge';
import { Login } from './components/Login';
import { PaymentModal } from './components/PaymentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BusinessAdvisor } from './components/BusinessAdvisor';
import { AppView, UserRole, UserProfile, SavedStudyPlan } from './types';
import { db, AVAILABLE_CLASSES } from './services/database';
import { contactApi } from './services/api';
import { ArrowRight, Cpu, Layers, Users, Calendar, Video, CheckCircle2, TrendingUp, BookOpen, Sparkles, ArrowUpRight, Clock, Monitor, PlayCircle, Zap, Mail, Globe, BarChart, Server, Code, Activity, Linkedin, Twitter, BrainCircuit, Lock, GraduationCap, Rocket, ChevronRight, Info, Target, Shield, Brain, Timer, Hourglass, Search } from 'lucide-react';

const VIEW_PERSIST_KEY = 'mig_current_view';
const BRIDGE_PERSIST_KEY = 'mig_bridge_topic';

const FEATURED_PROJECTS = [
  {
    id: 'proj_logistics',
    title: 'Nexus Logistics Core',
    client: 'Global Shipping Corp',
    category: 'Supply Chain AI',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
    description: 'Identified critical gaps in fleet routing efficiency. Built an autonomous management system that reduced delivery latency by 40% — and continue to optimize quarterly.',
    stats: ['18-Month Partnership', '40% Efficiency Gain'],
    tags: ['Python', 'TensorFlow', 'IoT']
  },
  {
    id: 'proj_fintech',
    title: 'Aegis Financial Sentinel',
    client: 'NeoBank Systems',
    category: 'FinTech Security',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    description: 'Discovered a fraud detection gap that was costing millions. Built a real-time engine processing high-frequency transactions with 99.9% accuracy — ongoing partnership since 2024.',
    stats: ['2-Year Partner', '$500M Secured'],
    tags: ['Go', 'Kafka', 'Vertex AI']
  },
  {
    id: 'proj_health',
    title: 'Medi-Synapse Grid',
    client: 'City General Hospital',
    category: 'Healthcare Data',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop',
    description: 'Gap analysis revealed 85% of staff time was lost to paperwork. Built a unified patient data pipeline using NLP — now expanding to three additional departments.',
    stats: ['Ongoing Partner', '85% Less Paperwork'],
    tags: ['React', 'NLP', 'Cloud Run']
  }
];


const ProjectsSection = () => (
  <section className="py-24 bg-slate-900/30 border-y border-slate-800 animate-fade-in">
    <div className="max-w-7xl mx-auto px-6">
       <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-indigo-400 font-bold tracking-widest text-sm uppercase mb-2 block">Partnership Results</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white">Growth Stories</h2>
          </div>
          <p className="text-slate-400 max-w-sm text-sm md:text-right">
             Real partnerships, real results. See how we've helped businesses discover gaps and build lasting growth.
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_PROJECTS.map(project => (
             <div key={project.id} className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl hover:shadow-indigo-500/10">
                <div className="h-48 overflow-hidden relative">
                   <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {project.category}
                   </div>
                </div>
                <div className="p-8">
                   <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                   <p className="text-xs text-indigo-400 font-medium mb-4 flex items-center"><Globe className="w-3 h-3 mr-1" /> Partner: {project.client}</p>
                   <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                   </p>
                   
                   <div className="flex flex-wrap gap-2 mb-6">
                      {project.stats.map((stat, i) => (
                         <div key={i} className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-1 rounded">
                            <Activity className="w-3 h-3 mr-1" /> {stat}
                         </div>
                      ))}
                   </div>

                   <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-2">
                      {project.tags.map(tag => (
                         <span key={tag} className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800 flex items-center">
                            <Code className="w-3 h-3 mr-1" /> {tag}
                         </span>
                      ))}
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  </section>
);

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin_url?: string;
  twitter_url?: string;
}

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const API_BASE = window.location.hostname === 'localhost'
          ? 'http://localhost:3001'
          : '';
        const response = await fetch(`${API_BASE}/api/team`);
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Failed to fetch team:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-800 rounded mx-auto mb-4"></div>
            <div className="h-12 w-96 bg-slate-800 rounded mx-auto mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-slate-900 rounded-2xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900 animate-fade-in">
       <div className="absolute top-0 right-0 w-96 h-96 bg-brand-900/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

       <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
             <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-2 block">Your Growth Team</span>
             <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Meet Our Team</h2>
             <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                We are a team of strategists, engineers, and growth specialists committed to understanding your business and helping you compete globally.
             </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${teamMembers.length >= 3 ? 'lg:grid-cols-3' : ''} ${teamMembers.length >= 4 ? 'lg:grid-cols-4' : ''} gap-8 justify-center`}>
             {teamMembers.map(member => (
                <div key={member.id} className="group relative">
                   <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-500 hover:border-brand-500/50 hover:-translate-y-2 h-full flex flex-col">
                      <div className="aspect-[4/5] overflow-hidden relative">
                         <img
                           src={member.image}
                           alt={member.name}
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>

                         <div className="absolute bottom-0 left-0 right-0 p-6">
                             <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                             <p className="text-brand-400 text-xs font-bold uppercase tracking-wider">{member.role}</p>
                         </div>
                      </div>

                      <div className="p-6 pt-0 flex-grow bg-slate-900">
                          <div className="h-px w-full bg-slate-800 mb-4"></div>
                          <p className="text-slate-400 text-sm leading-relaxed">
                               {member.bio}
                          </p>
                          <div className="mt-4 flex gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                              {member.linkedin_url && (
                                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                                  <Linkedin className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                                </a>
                              )}
                              {member.twitter_url && (
                                <a href={member.twitter_url} target="_blank" rel="noopener noreferrer">
                                  <Twitter className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                                </a>
                              )}
                          </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
};

const AcademySection = ({ onRegister }: { onRegister: (title: string, price: number, id: string) => void }) => (
  <section className="py-24 bg-slate-900/50 border-t border-slate-800 relative animate-fade-in">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
           <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-2 block">Partnership Benefit</span>
           <h2 className="text-3xl md:text-5xl font-display font-bold text-white">Client Training Programs</h2>
        </div>
        <button className="text-slate-400 hover:text-white font-bold text-sm flex items-center transition-colors">
            View All Courses <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {AVAILABLE_CLASSES.map(course => (
           <div key={course.id} className="group bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-8 hover:border-brand-500/30 transition-all shadow-lg hover:shadow-brand-500/10">
              <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden relative">
                 <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                 <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <span className="text-white font-bold text-sm">{course.price}</span>
                 </div>
              </div>
              <div className="flex-grow flex flex-col">
                <div className="flex-grow">
                   <div className="flex gap-2 mb-3">
                      {course.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">{tag}</span>
                      ))}
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-brand-400 transition-colors">{course.title}</h3>
                   <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">{course.description}</p>
                </div>
                <button 
                    onClick={() => onRegister(course.title, parseInt(course.price.replace(/\D/g,'')), course.id)} 
                    className="w-full bg-slate-800 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center group-hover:shadow-lg"
                >
                    Request Access <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  </section>
);

const SkillForgeIntro = ({ onLoginClick }: { onLoginClick: () => void }) => (
    <div className="py-24 relative overflow-hidden animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/30 border border-brand-500/30 text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" /> Client Training Platform
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                    Build Your Team's <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">Competitive Edge</span>
                </h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    Our AI-powered training platform builds custom programs, interactive assessments, and certification tracks tailored to your team's specific skill gaps.
                </p>

                <div className="space-y-4 mb-10">
                    <div className="flex items-start">
                        <div className="p-2 bg-slate-900 rounded-lg mr-4 border border-slate-800"><BrainCircuit className="w-5 h-5 text-brand-400" /></div>
                        <div>
                            <h4 className="text-white font-bold">Custom Training Paths</h4>
                            <p className="text-sm text-slate-500">Programs adapt to your team's needs and proficiency level.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="p-2 bg-slate-900 rounded-lg mr-4 border border-slate-800"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                        <div>
                            <h4 className="text-white font-bold">Measurable Progress</h4>
                            <p className="text-sm text-slate-500">Weekly assessments and comprehensive certifications to track team growth.</p>
                        </div>
                    </div>
                </div>

                <button onClick={onLoginClick} className="px-8 py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center shadow-xl shadow-white/5">
                    Start Training <ArrowRight className="w-5 h-5 ml-2" />
                </button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-[2.5rem] rotate-3 opacity-20 blur-xl"></div>
                <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">AI_CORE_V2.SYS</div>
                    </div>
                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex gap-4">
                            <span className="text-slate-500">01</span>
                            <span className="text-brand-400">generate_roadmap</span>
                            <span className="text-slate-300">("Advanced Quantum Computing")</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-slate-500">02</span>
                            <span className="text-indigo-400">processing...</span>
                        </div>
                         <div className="flex gap-4">
                            <span className="text-slate-500">03</span>
                            <span className="text-emerald-400">roadmap_created</span>
                            <span className="text-slate-300">[Week 1: Qubits & Superposition]</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-slate-500">04</span>
                            <span className="text-emerald-400">roadmap_created</span>
                            <span className="text-slate-300">[Week 2: Entanglement Principles]</span>
                        </div>
                         <div className="flex gap-4 mt-8 p-4 bg-slate-950 rounded-xl border border-slate-800 items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-500">Authentication Required to Access Full Module</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ContactSection = () => {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.message) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await contactApi.submit(formData);
      setSuccess(true);
      setFormData({ first_name: '', last_name: '', email: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-950 relative border-t border-slate-900 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
              <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-2 block">Start Your Partnership</span>
              <h2 className="text-4xl font-display font-bold text-white mb-6">Let's Find Your Growth Gaps</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Whether you need a gap analysis, custom solutions, or team training, we're ready to commit to your long-term growth. Let's start the conversation.
              </p>

              <div className="space-y-8">
                  <div className="flex items-center">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 mr-6 shadow-lg">
                          <Mail className="w-6 h-6 text-brand-400" />
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-lg">Email Us</h4>
                          <p className="text-slate-500">mindisgear@gmail.com</p>
                      </div>
                  </div>
                  <div className="flex items-center">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 mr-6 shadow-lg">
                          <Globe className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-lg">Global HQ</h4>
                          <p className="text-slate-500">Kathmandu, Nepal (Operating Globally)</p>
                      </div>
                  </div>
                  <div className="flex items-center">
                       <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 mr-6 shadow-lg">
                          <Users className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-lg">Join the Team</h4>
                          <p className="text-slate-500">mindisgear@gmail.com</p>
                      </div>
                  </div>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all"></div>

              <h3 className="text-xl font-bold text-white mb-6">Start a Conversation</h3>

              {success && (
                <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-colors"
                        placeholder="John"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-colors"
                        placeholder="Doe"
                      />
                  </div>
              </div>
              <div className="space-y-2 mb-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-colors"
                    placeholder="john@company.com"
                  />
              </div>
               <div className="space-y-2 mb-6">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-colors h-32 resize-none"
                    placeholder="Tell us about your project..."
                  ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'} {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
          </form>
      </div>
    </section>
  );
};

const GapAnalysisIntro = ({ onLoginClick }: { onLoginClick: () => void }) => (
    <div className="py-24 relative overflow-hidden animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Target className="w-3 h-3" /> Free Business Analysis
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                    Discover Your Business's <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-500">Hidden Gaps</span>
                </h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    Our AI-powered Gap Analysis Engine examines your business operations, identifies overlooked opportunities, and generates actionable recommendations — completely free.
                </p>

                <div className="space-y-4 mb-10">
                    <div className="flex items-start">
                        <div className="p-2 bg-slate-900 rounded-lg mr-4 border border-slate-800"><BrainCircuit className="w-5 h-5 text-brand-400" /></div>
                        <div>
                            <h4 className="text-white font-bold">AI-Powered Analysis</h4>
                            <p className="text-sm text-slate-500">Advanced AI examines your industry, operations, and competitive landscape.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="p-2 bg-slate-900 rounded-lg mr-4 border border-slate-800"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                        <div>
                            <h4 className="text-white font-bold">Actionable Recommendations</h4>
                            <p className="text-sm text-slate-500">Get specific, prioritized solutions you can act on immediately.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="p-2 bg-slate-900 rounded-lg mr-4 border border-slate-800"><ArrowRight className="w-5 h-5 text-indigo-400" /></div>
                        <div>
                            <h4 className="text-white font-bold">Bridge to Partnership</h4>
                            <p className="text-sm text-slate-500">Love the results? Turn your analysis into a full growth partnership.</p>
                        </div>
                    </div>
                </div>

                <button onClick={onLoginClick} className="px-8 py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center shadow-xl shadow-white/5">
                    Sign In to Start Analysis <ArrowRight className="w-5 h-5 ml-2" />
                </button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-emerald-600 rounded-[2.5rem] rotate-3 opacity-20 blur-xl"></div>
                <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">GAP_ANALYSIS.ENGINE</div>
                    </div>
                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex gap-4">
                            <span className="text-slate-500">01</span>
                            <span className="text-brand-400">analyze_gaps</span>
                            <span className="text-slate-300">("E-commerce, Southeast Asia")</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-slate-500">02</span>
                            <span className="text-emerald-400">gap_found</span>
                            <span className="text-slate-300">[Mobile checkout abandonment: 68%]</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-slate-500">03</span>
                            <span className="text-emerald-400">recommendation</span>
                            <span className="text-slate-300">[Implement one-tap payment flow]</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-slate-500">04</span>
                            <span className="text-brand-400">impact_estimate</span>
                            <span className="text-slate-300">[+35% conversion potential]</span>
                        </div>
                        <div className="flex gap-4 mt-8 p-4 bg-slate-950 rounded-xl border border-slate-800 items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-500">Sign in to run your free analysis</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [initializing, setInitializing] = useState(true);
  const [bridgeTopic, setBridgeTopic] = useState<string>('');

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [selectedCoursePrice, setSelectedCoursePrice] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // AUTH INIT: Run ONCE on mount to restore session and view
  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialUser = await db.auth.getCurrentUser();
        setUser(initialUser);
        
        const savedView = localStorage.getItem(VIEW_PERSIST_KEY) as AppView;
        if (savedView) {
          // Allow EDUCATION view for guests now (as an intro)
          if (!initialUser && (savedView === AppView.ADMIN)) {
            setCurrentView(AppView.HOME);
          } else {
            setCurrentView(savedView);
          }
        }

        const savedBridge = localStorage.getItem(BRIDGE_PERSIST_KEY);
        if (savedBridge) setBridgeTopic(savedBridge);

      } catch (e) {
        console.error("Critical Auth Init Failure:", e);
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, []); // Empty dependency array = Runs once on mount

  // AUTH LISTENER: Re-subscribes if currentView changes to handle accurate redirects
  useEffect(() => {
    // db.auth.onAuthChange returns the object with subscription directly, it is not wrapped in 'data'.
    const authListener = db.auth.onAuthChange((updatedUser) => {
      setUser(updatedUser);
      if (!updatedUser) {
        // If user logs out, kick them from protected views like ADMIN
        // We use the functional update form or just reference currentView if needed, 
        // but here we are in an effect that depends on currentView, so we have fresh state.
        if (currentView === AppView.ADMIN) {
           setCurrentView(AppView.HOME);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [currentView]);

  // VIEW PERSISTENCE: Save view whenever it changes (except Login)
  useEffect(() => {
    if (currentView !== AppView.LOGIN) {
      localStorage.setItem(VIEW_PERSIST_KEY, currentView);
    }
  }, [currentView]);

  useEffect(() => {
    if (bridgeTopic) localStorage.setItem(BRIDGE_PERSIST_KEY, bridgeTopic);
    else localStorage.removeItem(BRIDGE_PERSIST_KEY);
  }, [bridgeTopic]);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    if (newUser.role === 'BUSINESS') setCurrentView(AppView.HOME);
    else if (newUser.role === 'STUDENT') setCurrentView(AppView.EDUCATION);
    else if (newUser.role === 'ADMIN') setCurrentView(AppView.ADMIN);
    else setCurrentView(AppView.HOME);
  };

  const handleLogout = async () => {
    await db.auth.signOut();
  };

  const handleNavigate = (view: AppView) => {
    const role = user?.role || 'GUEST';
    
    // Check permissions
    if (view === AppView.ADMIN && role !== 'ADMIN') {
      setCurrentView(AppView.LOGIN);
      return;
    }
    setCurrentView(view);
  };

  const handleRegisterClick = (title: string, price: number, id: string) => {
    if (!user) {
      setCurrentView(AppView.LOGIN);
      return;
    }
    setSelectedCourseTitle(title);
    setSelectedCoursePrice(price);
    setSelectedCourseId(id);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (user && selectedCourseId) {
      await db.content.bookClass(user.email, selectedCourseId);
      setIsPaymentOpen(false);
      setRefreshTrigger(prev => prev + 1);
      setCurrentView(AppView.EDUCATION);
    }
  };

  const handleBridgeToEducation = (topic: string) => {
    setBridgeTopic(topic);
    setCurrentView(AppView.EDUCATION);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-brand-400" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-display font-bold uppercase tracking-widest text-[10px]">Verifying Identity Gateway</p>
      </div>
    );
  }

  const Dashboard = () => {
    const [activePlan, setActivePlan] = useState<SavedStudyPlan | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.email) {
                const plans = await db.content.getPlans(user.email);
                if (plans.length > 0) setActivePlan(plans[0]);
            }
        };
        fetchData();
    }, [user]);

    if (user?.role === 'ADMIN') return <AdminDashboard />;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 md:p-12 mb-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">{user?.name}</span>.
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                        Your growth dashboard is ready. Continue your training, explore gap analyses, or review your partnership progress.
                    </p>
                </div>
            </div>

            {/* Active Context (if any) */}
            {activePlan && (
                <div className="mb-12 animate-slide-up">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Neural Link</span>
                    </div>
                    <div className="bg-[#0B1120] border border-brand-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(14,165,233,0.1)]">
                        <div className="flex-grow">
                            <h3 className="text-2xl font-bold text-white mb-2">{activePlan.topic}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold uppercase">{activePlan.difficulty}</span>
                                <span>{activePlan.completedWeeks?.length || 0} / {activePlan.roadmap.length} Modules Complete</span>
                            </div>
                            <div className="w-full max-w-md h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-brand-500" style={{ width: `${Math.round(((activePlan.completedWeeks?.length || 0) / activePlan.roadmap.length) * 100)}%` }}></div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setCurrentView(AppView.EDUCATION)}
                            className="whitespace-nowrap px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-900/20 transition-all flex items-center"
                        >
                            Resume Protocol <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>
            )}

            {/* Core Systems Grid */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Available Systems</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Team Training Card */}
                    <div onClick={() => setCurrentView(AppView.EDUCATION)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-500/50 transition-all cursor-pointer group hover:-translate-y-1">
                        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-brand-500/50 group-hover:bg-brand-900/10 transition-colors">
                            <Sparkles className="w-6 h-6 text-brand-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Team Training</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            AI-powered training programs. Build custom learning paths for your team's skill gaps.
                        </p>
                        <span className="text-brand-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:underline">
                            Start Training <ChevronRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>

                    {/* Growth Programs Card */}
                    <div onClick={() => setCurrentView(AppView.ACADEMY)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all cursor-pointer group hover:-translate-y-1">
                        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-indigo-500/50 group-hover:bg-indigo-900/10 transition-colors">
                            <BookOpen className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Growth Programs</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            Instructor-led programs to upskill your team in AI, development, and strategic thinking.
                        </p>
                        <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:underline">
                            Browse Programs <ChevronRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>

                    {/* Gap Analysis Card */}
                    <div onClick={() => setCurrentView(AppView.GAP_ANALYSIS)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer group hover:-translate-y-1">
                        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-emerald-500/50 group-hover:bg-emerald-900/10 transition-colors">
                            <Target className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Gap Analysis</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            Discover hidden gaps in your business. Get AI-powered insights and actionable recommendations.
                        </p>
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:underline">
                            Run Analysis <ChevronRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>
                </div>
            </div>
            
            {/* System Metrics / Info */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-4">
                    <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-white font-bold text-sm mb-1">Our Philosophy</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            "Real growth comes from understanding where you are, where you could be, and building the bridge between." We commit to your long-term success.
                        </p>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-4">
                    <Globe className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-white font-bold text-sm mb-1">Global Operations</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Operating from Kathmandu to the world. Our team is ready to assist with enterprise integration and custom architecture.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const Landing = () => (
    <div className="flex flex-col">
      {/* HERO SECTION - "Ideas Fade Away" Concept */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-brand-500/8 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 animate-fade-in">
            <Target className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">Strategic Growth Partner</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 tracking-tight leading-[1.1]">
            <span className="block text-white">Every Business Has</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-brand-400">Gaps</span>
          </h1>

          {/* The Promise */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-8 tracking-tight animate-slide-up">
            We find them. We fix them. We grow with you.
          </h2>

          {/* Supporting Text */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Mind is Gear is your <span className="text-brand-400 font-bold">long-term growth partner</span>. We analyze your business, discover hidden gaps, build custom solutions, and commit to your success — not just for a sprint, but for the journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in">
            <button
              onClick={() => handleNavigate(AppView.GAP_ANALYSIS)}
              className="group bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-2xl shadow-brand-500/20 flex items-center justify-center"
            >
              <Target className="w-5 h-5 mr-2" />
              Get Your Free Gap Analysis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('partnership-tiers')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all border border-slate-700 flex items-center justify-center"
            >
              <Layers className="w-5 h-5 mr-2" />
              See Partnership Tiers
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-slate-400">
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <Users className="w-4 h-4 text-brand-500" />
              <span className="font-bold text-white">Long-Term</span>
              <span className="text-sm">Partnerships</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-white">3</span>
              <span className="text-sm">Partnership Tiers</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-white">Global</span>
              <span className="text-sm">Reach</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-slate-600 rotate-90" />
        </div>
      </section>

      {/* THE GAP PROBLEM SECTION */}
      <section className="py-24 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-amber-500/5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-red-400 font-bold tracking-widest text-sm uppercase mb-4 block">The Problem</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Most Businesses Can't See Their Own Gaps</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              The biggest threats to your growth are the ones you don't even know exist
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Blind Spots', desc: 'Internal teams are too close to the problem to see what\'s missing.', color: 'red' },
              { icon: TrendingUp, title: 'Missed Opportunities', desc: 'Revenue-generating possibilities go unnoticed without outside perspective.', color: 'orange' },
              { icon: Target, title: 'Competitive Pressure', desc: 'Competitors are evolving while you\'re focused on daily operations.', color: 'amber' },
              { icon: Users, title: 'Scattered Efforts', desc: 'Without a clear gap map, teams invest energy in the wrong areas.', color: 'yellow' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl hover:border-red-500/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center mb-4 group-hover:bg-${item.color}-500/20 transition-all`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR COMMITMENT / SOLUTION SECTION */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-4 block">Our Commitment</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                We Commit to Your Growth
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                We don't just build and leave. We <span className="text-slate-300">analyze your business</span>, find the gaps holding you back, and <span className="text-brand-400 font-semibold">partner with you</span> to close them — month after month, year after year.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Deep Gap Analysis</div>
                    <div className="text-sm text-slate-400">We find what's missing before building anything</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Custom Solutions</div>
                    <div className="text-sm text-slate-400">Tailored technology built specifically for your gaps</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Ongoing Partnership</div>
                    <div className="text-sm text-slate-400">We grow with you — continuous optimization and support</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Element - Partnership Journey */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-indigo-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Layers className="w-6 h-6 text-brand-400" />
                  <span className="text-lg font-bold text-white">Partnership Journey</span>
                </div>

                <div className="space-y-4">
                  {[
                    { phase: 'DISCOVER', desc: 'Deep dive into your business gaps', color: 'brand', progress: 100 },
                    { phase: 'BUILD', desc: 'Custom solutions for each gap', color: 'indigo', progress: 100 },
                    { phase: 'OPTIMIZE', desc: 'Measure, iterate, and improve', color: 'purple', progress: 100 },
                    { phase: 'SCALE', desc: 'Expand to new markets and opportunities', color: 'emerald', progress: 100 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-20 text-xs font-mono text-slate-500">Phase {i + 1}</div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-bold text-${item.color}-400`}>{item.phase}</span>
                          <span className="text-xs text-slate-500">{item.desc}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full`} style={{ width: `${item.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Our Commitment</span>
                  <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Long-Term</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIP TIERS */}
      <section id="partnership-tiers" className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-4 block">Choose Your Path</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Partnership Tiers</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Every partnership starts with understanding. Pick the level that fits your growth stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-brand-500/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition-all">
                <Target className="w-7 h-7 text-brand-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Perfect for businesses just beginning to identify their growth gaps.</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" /> Gap Analysis Report</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" /> Strategy Roadmap</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" /> Monthly Check-in</li>
              </ul>
              <button onClick={() => handleNavigate(AppView.CONTACT)} className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center justify-center">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Growth (Most Popular) */}
            <div className="bg-slate-900 border-2 border-brand-500 p-8 rounded-3xl relative shadow-xl shadow-brand-500/10 group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-white text-xs font-bold uppercase tracking-widest rounded-full">Most Popular</div>
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-brand-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">For businesses ready to invest in closing gaps and building competitive advantages.</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" /> Everything in Starter</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" /> Custom Development</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" /> Team Training Programs</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" /> Quarterly Reviews</li>
              </ul>
              <button onClick={() => handleNavigate(AppView.CONTACT)} className="w-full mt-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-900/20 flex items-center justify-center">
                Start Growing <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-all">
                <Rocket className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Full-scale partnership for businesses that want a dedicated growth team.</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-3 flex-shrink-0" /> Everything in Growth</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-3 flex-shrink-0" /> Dedicated Team</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-3 flex-shrink-0" /> Priority Support</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-3 flex-shrink-0" /> Annual Strategy Summits</li>
              </ul>
              <button onClick={() => handleNavigate(AppView.CONTACT)} className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center justify-center">
                Contact Us <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES - Growth Focused */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-4 block">How We Help You Grow</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Services</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Comprehensive growth services tailored to your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'AI & Automation', desc: 'Custom AI/ML solutions, LLM integration, and workflow automation to close efficiency gaps', badge: 'Core Service', color: 'brand' },
              { icon: Code, title: 'Digital Products', desc: 'Full-stack apps, SaaS platforms, and enterprise software built for your specific needs', badge: 'Custom Built', color: 'indigo' },
              { icon: Target, title: 'Gap Analysis', desc: 'Comprehensive business analysis to identify hidden opportunities and competitive weaknesses', badge: 'Free Tier Available', color: 'emerald' },
              { icon: GraduationCap, title: 'Team Development', desc: 'AI-powered training programs and certification tracks to upskill your team', badge: 'Partnership Benefit', color: 'purple' },
              { icon: Server, title: 'Infrastructure', desc: 'Cloud setup, CI/CD pipelines, and deployment automation for scalable growth', badge: 'Growth Enabler', color: 'amber' },
              { icon: BarChart, title: 'Strategic Consulting', desc: 'Business strategy, market positioning, and technology roadmap planning', badge: 'All Tiers', color: 'pink' },
            ].map((service, i) => (
              <div key={i} className={`group bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-${service.color}-500/50 transition-all duration-300 hover:-translate-y-2`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 bg-${service.color}-500/10 rounded-2xl flex items-center justify-center group-hover:bg-${service.color}-500/20 transition-all`}>
                    <service.icon className={`w-7 h-7 text-${service.color}-400`} />
                  </div>
                  <div className={`px-3 py-1 rounded-full bg-${service.color}-500/10 border border-${service.color}-500/20`}>
                    <span className={`text-xs font-bold text-${service.color}-400`}>{service.badge}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio / Projects Section */}
      <ProjectsSection />

      {/* Team Section */}
      <TeamSection />

      {/* TESTIMONIALS - Partnership Focused */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-4 block">Partner Success</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">What Our Partners Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'CTO, TechFlow Inc', text: 'Mind is Gear found gaps in our operations we never even considered. 18 months in, we\'ve grown revenue by 3x and our team is sharper than ever.', badge: '18-Month Partner' },
              { name: 'Michael Roberts', role: 'Founder, DataSync', text: 'They didn\'t just build us a product — they became part of our team. Their gap analysis completely changed our go-to-market strategy.', badge: '1-Year Partner' },
              { name: 'Lisa Wang', role: 'Product Manager, CloudNine', text: 'The training programs alone justified our partnership. But the ongoing strategic support is what truly sets Mind is Gear apart.', badge: '2-Year Partner' },
            ].map((t, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                  <span className="text-xs font-bold text-brand-400">{t.badge}</span>
                </div>
                <div className="flex items-center gap-1 mb-4 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academy Section */}
      <AcademySection onRegister={handleRegisterClick} />

      {/* CTA SECTION - Growth Driven */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">Unlock Your Potential</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Your Business Has <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Untapped Potential</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Every gap is an opportunity waiting to be discovered. Let's find yours and <span className="text-white font-semibold">start growing together</span>.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => handleNavigate(AppView.GAP_ANALYSIS)}
              className="group bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-brand-500/20 flex items-center justify-center"
            >
              <Target className="w-6 h-6 mr-2" />
              Get Your Free Gap Analysis
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('partnership-tiers')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-slate-800/50 hover:bg-slate-800 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all border border-slate-700 flex items-center justify-center"
            >
              <Layers className="w-6 h-6 mr-2" />
              See Partnership Tiers
            </button>
          </div>

          <p className="mt-8 text-slate-500 text-sm">
            Free gap analysis • No commitment • Response within 24 hours
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />
    </div>
  );

  return (
    <Layout currentView={currentView} setView={handleNavigate} user={user} onLogout={handleLogout}>
      {currentView === AppView.LOGIN && <Login onLogin={handleLogin} />}
      {currentView === AppView.HOME && (user ? <Dashboard /> : <Landing />)}
      
      {/* Render SkillForge for User OR Intro for Guest */}
      {currentView === AppView.EDUCATION && (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
          {user ? (
             <SkillForge refreshTrigger={refreshTrigger} initialTopic={bridgeTopic} user={user} />
          ) : (
             <SkillForgeIntro onLoginClick={() => setCurrentView(AppView.LOGIN)} />
          )}
        </div>
      )}

      {currentView === AppView.PROJECTS && (
        <div className="pt-8">
           <ProjectsSection />
        </div>
      )}

      {currentView === AppView.TEAM && (
         <div className="pt-8">
            <TeamSection />
         </div>
      )}

      {currentView === AppView.ACADEMY && (
         <div className="pt-8">
            <AcademySection onRegister={handleRegisterClick} />
         </div>
      )}

      {currentView === AppView.CONTACT && (
         <div className="pt-8">
            <ContactSection />
         </div>
      )}

      {currentView === AppView.GAP_ANALYSIS && (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
          {user ? (
            <BusinessAdvisor onBridge={handleBridgeToEducation} user={user} />
          ) : (
            <GapAnalysisIntro onLoginClick={() => setCurrentView(AppView.LOGIN)} />
          )}
        </div>
      )}

      {user?.role === 'ADMIN' && currentView === AppView.ADMIN && <AdminDashboard />}

      {!user && (currentView === AppView.ADMIN) && <Landing />}

      {isPaymentOpen && (
         <PaymentModal 
           courseTitle={selectedCourseTitle} 
           price={selectedCoursePrice} 
           onClose={() => setIsPaymentOpen(false)} 
           onSuccess={handlePaymentSuccess} 
           user={user}
         />
      )}
    </Layout>
  );
};

export default App;
