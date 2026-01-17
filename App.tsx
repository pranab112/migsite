
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SkillForge } from './components/SkillForge';
import { Login } from './components/Login';
import { PaymentModal } from './components/PaymentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AppView, UserRole, UserProfile, SavedStudyPlan } from './types';
import { db, AVAILABLE_CLASSES } from './services/database';
import { contactApi } from './services/api';
import { ArrowRight, Cpu, Layers, Users, Calendar, Video, CheckCircle2, TrendingUp, BookOpen, Sparkles, ArrowUpRight, Clock, Monitor, PlayCircle, Zap, Mail, Globe, BarChart, Server, Code, Activity, Linkedin, Twitter, BrainCircuit, Lock, GraduationCap, Rocket, ChevronRight, Info, Target, Shield, Brain, Timer, Hourglass } from 'lucide-react';

const VIEW_PERSIST_KEY = 'mig_current_view';
const BRIDGE_PERSIST_KEY = 'mig_bridge_topic';

const FEATURED_PROJECTS = [
  {
    id: 'proj_logistics',
    title: 'Nexus Logistics Core',
    client: 'Global Shipping Corp',
    category: 'Supply Chain AI',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
    description: 'A fully autonomous fleet management system that reduced delivery latency by 40% using predictive routing algorithms.',
    stats: ['40% Faster Delivery', '2.4M Routes/Day'],
    tags: ['Python', 'TensorFlow', 'IoT']
  },
  {
    id: 'proj_fintech',
    title: 'Aegis Financial Sentinel',
    client: 'NeoBank Systems',
    category: 'FinTech Security',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    description: 'Real-time fraud detection engine processing high-frequency transactions with 99.9% accuracy via anomaly detection models.',
    stats: ['$500M Secured', '12ms Latency'],
    tags: ['Go', 'Kafka', 'Vertex AI']
  },
  {
    id: 'proj_health',
    title: 'Medi-Synapse Grid',
    client: 'City General Hospital',
    category: 'Healthcare Data',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop',
    description: 'Unified patient data pipeline that utilizes NLP to summarize clinical notes and automate insurance coding.',
    stats: ['85% Less Paperwork', 'HIPAA Compliant'],
    tags: ['React', 'NLP', 'Cloud Run']
  }
];


const ProjectsSection = () => (
  <section className="py-24 bg-slate-900/30 border-y border-slate-800 animate-fade-in">
    <div className="max-w-7xl mx-auto px-6">
       <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-indigo-400 font-bold tracking-widest text-sm uppercase mb-2 block">System Portfolio</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white">Deployed Architectures</h2>
          </div>
          <p className="text-slate-400 max-w-sm text-sm md:text-right">
             Real-world systems engineered by Mind is Gear. From FinTech to Healthcare, we build resilient infrastructure.
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
                   <p className="text-xs text-indigo-400 font-medium mb-4 flex items-center"><Globe className="w-3 h-3 mr-1" /> Client: {project.client}</p>
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
             <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-2 block">The Architects</span>
             <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Meet Our Team</h2>
             <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                We are a collective of researchers, engineers, and strategists dedicated to bridging the gap between biological intelligence and synthetic cognition.
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
           <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-2 block">Professional Certification</span>
           <h2 className="text-3xl md:text-5xl font-display font-bold text-white">Online Academy</h2>
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
                    Enroll Now <ArrowRight className="w-4 h-4 ml-2" />
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
                    <Sparkles className="w-3 h-3" /> AI Curriculum Generator
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                    Forge Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">Mastery</span>
                </h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    Skill Forge utilizes advanced generative AI to build personalized learning roadmaps, interactive quizzes, and final certification exams tailored specifically to your goals.
                </p>
                
                <div className="space-y-4 mb-10">
                    <div className="flex items-start">
                        <div className="p-2 bg-slate-900 rounded-lg mr-4 border border-slate-800"><BrainCircuit className="w-5 h-5 text-brand-400" /></div>
                        <div>
                            <h4 className="text-white font-bold">Dynamic Curriculums</h4>
                            <p className="text-sm text-slate-500">Roadmaps adapt to your chosen topic and proficiency level.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="p-2 bg-slate-900 rounded-lg mr-4 border border-slate-800"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                        <div>
                            <h4 className="text-white font-bold">Verified Assessments</h4>
                            <p className="text-sm text-slate-500">Weekly quizzes and comprehensive final exams to prove your skills.</p>
                        </div>
                    </div>
                </div>

                <button onClick={onLoginClick} className="px-8 py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center shadow-xl shadow-white/5">
                    Start Forging Now <ArrowRight className="w-5 h-5 ml-2" />
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
              <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-2 block">Get in Touch</span>
              <h2 className="text-4xl font-display font-bold text-white mb-6">Let's Build the Future</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Whether you need a custom AI architecture, corporate training for your team, or just want to explore the possibilities of the Mind is Gear system, we are ready to deploy.
              </p>

              <div className="space-y-8">
                  <div className="flex items-center">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 mr-6 shadow-lg">
                          <Mail className="w-6 h-6 text-brand-400" />
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-lg">Email Us</h4>
                          <p className="text-slate-500">contact@mindisgear.com</p>
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
                          <p className="text-slate-500">careers@mindisgear.com</p>
                      </div>
                  </div>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all"></div>

              <h3 className="text-xl font-bold text-white mb-6">Send a Transmission</h3>

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
                        System Online. Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">{user?.name}</span>.
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                        Mind is Gear operates at the intersection of biological creativity and artificial speed. 
                        Select a protocol below to begin enhancing your capabilities or building your infrastructure.
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
                    {/* Skill Forge Card */}
                    <div onClick={() => setCurrentView(AppView.EDUCATION)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-500/50 transition-all cursor-pointer group hover:-translate-y-1">
                        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-brand-500/50 group-hover:bg-brand-900/10 transition-colors">
                            <Sparkles className="w-6 h-6 text-brand-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Skill Forge</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            Generative AI curriculum builder. Create custom learning roadmaps for any topic instantly.
                        </p>
                        <span className="text-brand-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:underline">
                            Initialize <ChevronRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>

                    {/* Academy Card */}
                    <div onClick={() => setCurrentView(AppView.ACADEMY)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all cursor-pointer group hover:-translate-y-1">
                        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-indigo-500/50 group-hover:bg-indigo-900/10 transition-colors">
                            <BookOpen className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Academy</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            Instructor-led professional certification tracks. Master Full Stack AI and Prompt Engineering.
                        </p>
                        <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:underline">
                            Browse Catalog <ChevronRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>

                    {/* Build / Deploy Card */}
                    <div onClick={() => setCurrentView(AppView.CONTACT)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer group hover:-translate-y-1">
                        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-emerald-500/50 group-hover:bg-emerald-900/10 transition-colors">
                            <Rocket className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Rapid Deploy</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            Need a custom AI solution? We build and deploy SaaS MVPs in as little as 7 days.
                        </p>
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:underline">
                            Start Project <ChevronRight className="w-3 h-3 ml-1" />
                        </span>
                    </div>
                </div>
            </div>
            
            {/* System Metrics / Info */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-4">
                    <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-white font-bold text-sm mb-1">System Philosophy</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            "The human mind is the gear that turns the machine of intelligence." We believe AI is an extension of human will, not a replacement.
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8 animate-fade-in">
            <Hourglass className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">Rapid Execution Partner</span>
          </div>

          {/* Main Headline - The Fade Effect */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 tracking-tight leading-[1.1]">
            <span className="block text-white/40 animate-pulse" style={{ animationDuration: '3s' }}>Ideas Fade Away</span>
          </h1>

          {/* The Promise - Solid & Bold */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-8 tracking-tight animate-slide-up">
            Before fading, we make your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-amber-400 to-brand-400">system ready.</span>
          </h2>

          {/* Supporting Text */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            From concept to production in <span className="text-amber-400 font-bold">10 days</span>. We capture your vision and build it into reality before the moment passes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in">
            <button
              onClick={() => handleNavigate(AppView.CONTACT)}
              className="group bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-400 hover:to-brand-400 text-slate-900 px-8 py-4 rounded-xl font-bold transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center"
            >
              <Zap className="w-5 h-5 mr-2" />
              Save Your Idea
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('sprint-timeline')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all border border-slate-700 flex items-center justify-center"
            >
              <Timer className="w-5 h-5 mr-2" />
              See Our Speed
            </button>
          </div>

          {/* Speed Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-slate-400">
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <Rocket className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-white">10-Day</span>
              <span className="text-sm">MVP</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-white">50+</span>
              <span className="text-sm">Ideas Launched</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <Clock className="w-4 h-4 text-brand-500" />
              <span className="font-bold text-white">99%</span>
              <span className="text-sm">On-Time</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-slate-600 rotate-90" />
        </div>
      </section>

      {/* THE FADE PROBLEM SECTION */}
      <section className="py-24 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-amber-500/5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-red-400 font-bold tracking-widest text-sm uppercase mb-4 block">The Problem</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">While You Wait, Your Idea Loses...</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Every day of delay costs you more than you realize
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Timer, title: 'Market Timing', desc: 'Competitors are already building. First-mover advantage slips away.', color: 'red' },
              { icon: TrendingUp, title: 'Momentum', desc: 'Energy and enthusiasm diminish with each passing week.', color: 'orange' },
              { icon: Target, title: 'Opportunity', desc: 'Investors and partners move to the next pitch in line.', color: 'amber' },
              { icon: Users, title: 'Team Alignment', desc: 'Stakeholder confidence fades without visible progress.', color: 'yellow' },
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

      {/* OUR PROMISE / SOLUTION SECTION */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-4 block">Our Promise</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                We Don't Let Ideas Die
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                In the time others spend <span className="text-slate-300">planning meetings</span>, we're already <span className="text-brand-400 font-semibold">building your product</span>. Our rapid deployment methodology means your idea becomes reality in days, not months.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Speed Without Compromise</div>
                    <div className="text-sm text-slate-400">Fast execution doesn't mean cutting corners</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Production-Ready Code</div>
                    <div className="text-sm text-slate-400">Scalable architecture from day one</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Daily Progress Updates</div>
                    <div className="text-sm text-slate-400">Watch your idea come to life in real-time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Element - Timeline Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Hourglass className="w-6 h-6 text-amber-400" />
                  <span className="text-lg font-bold text-white">10-Day Sprint Timeline</span>
                </div>

                <div className="space-y-4">
                  {[
                    { days: 'Day 1-2', phase: 'CAPTURE', desc: 'Deep dive into your vision', color: 'brand', progress: 100 },
                    { days: 'Day 3-6', phase: 'BUILD', desc: 'Core development sprint', color: 'indigo', progress: 100 },
                    { days: 'Day 7-9', phase: 'REFINE', desc: 'Polish and iterate', color: 'purple', progress: 100 },
                    { days: 'Day 10', phase: 'LAUNCH', desc: 'Deploy to production', color: 'amber', progress: 100 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-20 text-xs font-mono text-slate-500">{item.days}</div>
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
                  <span className="text-slate-400 text-sm">Total Time</span>
                  <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-400">10 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10-DAY SPRINT TIMELINE */}
      <section id="sprint-timeline" className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-bold tracking-widest text-sm uppercase mb-4 block">How We Beat The Fade</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">The 10-Day Sprint</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              A battle-tested process that turns ideas into production systems
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 'Days 1-2', title: 'Capture', desc: 'We understand your vision, define scope, and design the architecture', icon: Brain, color: 'brand' },
              { step: 'Days 3-6', title: 'Build', desc: 'Rapid development with daily demos and real-time collaboration', icon: Code, color: 'indigo' },
              { step: 'Days 7-9', title: 'Refine', desc: 'Polish UI/UX, optimize performance, and iterate on feedback', icon: Sparkles, color: 'purple' },
              { step: 'Day 10', title: 'Launch', desc: 'Deploy to production, monitor, and hand over with full documentation', icon: Rocket, color: 'amber' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className={`bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-${item.color}-500/50 transition-all h-full`}>
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center mb-6 group-hover:bg-${item.color}-500/20 transition-all`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-400`} />
                  </div>
                  <div className={`text-${item.color}-400 font-mono text-sm mb-2`}>{item.step}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-slate-700 to-transparent z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES - Speed Focused */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-4 block">What We Build Fast</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Services</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Every service optimized for speed without sacrificing quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Cards with Delivery Time */}
            {[
              { icon: Cpu, title: 'AI Solutions', desc: 'Custom AI/ML, LLM integration, chatbots, and automation', time: '10-14 days', color: 'brand' },
              { icon: Code, title: 'Web Applications', desc: 'Full-stack apps, SaaS platforms, and enterprise software', time: '10-21 days', color: 'indigo' },
              { icon: Rocket, title: 'MVP Development', desc: 'Validate your idea with a production-ready prototype', time: '10 days', color: 'amber' },
              { icon: GraduationCap, title: 'Team Training', desc: 'AI and development training with certification', time: '1-4 weeks', color: 'emerald' },
              { icon: Server, title: 'Cloud & DevOps', desc: 'Infrastructure setup, CI/CD, and deployment automation', time: '3-7 days', color: 'purple' },
              { icon: BarChart, title: 'Tech Consulting', desc: 'Strategy, architecture review, and AI readiness audit', time: '2-5 days', color: 'pink' },
            ].map((service, i) => (
              <div key={i} className={`group bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-${service.color}-500/50 transition-all duration-300 hover:-translate-y-2`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 bg-${service.color}-500/10 rounded-2xl flex items-center justify-center group-hover:bg-${service.color}-500/20 transition-all`}>
                    <service.icon className={`w-7 h-7 text-${service.color}-400`} />
                  </div>
                  <div className={`px-3 py-1 rounded-full bg-${service.color}-500/10 border border-${service.color}-500/20`}>
                    <span className={`text-xs font-bold text-${service.color}-400`}>{service.time}</span>
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

      {/* TESTIMONIALS - Speed Focused */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-4 block">Ideas We've Saved</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Client Success Stories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'CTO, TechFlow Inc', text: 'We had an idea that needed to launch before a competitor. Mind is Gear delivered our MVP in just 8 days. We beat them to market.', days: '8 days' },
              { name: 'Michael Roberts', role: 'Founder, DataSync', text: 'I was about to give up on my startup idea. Their 10-day sprint breathed new life into it. Now we have paying customers.', days: '10 days' },
              { name: 'Lisa Wang', role: 'Product Manager, CloudNine', text: 'The speed is unreal. We went from napkin sketch to production app in under two weeks. Our investors were blown away.', days: '12 days' },
            ].map((t, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group hover:border-brand-500/30 transition-all">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs font-bold text-amber-400">Delivered: {t.days}</span>
                </div>
                <div className="flex items-center gap-1 mb-4 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center text-white font-bold">
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

      {/* CTA SECTION - Urgency Driven */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <Hourglass className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-sm text-amber-300 font-medium">Every Second Counts</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Your Idea Is <span className="text-white/40">Fading</span> Right Now
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Don't let another brilliant idea slip away. Let's build it together, <span className="text-white font-semibold">starting today</span>.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => handleNavigate(AppView.CONTACT)}
              className="group bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-400 hover:to-brand-400 text-slate-900 px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center"
            >
              <Zap className="w-6 h-6 mr-2" />
              Save Your Idea Now
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleNavigate(AppView.EDUCATION)}
              className="bg-slate-800/50 hover:bg-slate-800 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all border border-slate-700 flex items-center justify-center"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              Learn With Us
            </button>
          </div>

          <p className="mt-8 text-slate-500 text-sm">
            Free consultation • No commitment • Response within 24 hours
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
