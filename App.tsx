
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SkillForge } from './components/SkillForge';
import { Login } from './components/Login';
import { PaymentModal } from './components/PaymentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AppView, UserRole, UserProfile, SavedStudyPlan } from './types';
import { db, AVAILABLE_CLASSES } from './services/database';
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

const TEAM_MEMBERS = [
  {
    id: 'team_1',
    name: 'Dr. Elena Rostova',
    role: 'Founder & Chief Architect',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    bio: 'Former lead researcher at DeepMind. Pioneered the "Neuro-Symbolic Bridge" architecture that powers our core engine.'
  },
  {
    id: 'team_2',
    name: 'James Chen',
    role: 'Head of Engineering',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
    bio: 'Full-stack veteran with 15 years experience building high-frequency trading systems and scalable cloud infrastructure.'
  },
  {
    id: 'team_3',
    name: 'Sarah Oconnell',
    role: 'Lead Data Scientist',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
    bio: 'Specialist in NLP and Transformer models. PhD from MIT in Computational Linguistics. Leads our generative AI division.'
  },
  {
    id: 'team_4',
    name: 'David Okafor',
    role: 'Product Strategy',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    bio: 'Ensuring our AI solutions translate to real-world business value. Expert in agile methodologies and product lifecycle.'
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

const TeamSection = () => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {TEAM_MEMBERS.map(member => (
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
                            <Linkedin className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                            <Twitter className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                 </div>
              </div>
           ))}
        </div>
     </div>
  </section>
);

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

const ContactSection = () => (
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

        <form className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all"></div>
            
            <h3 className="text-xl font-bold text-white mb-6">Send a Transmission</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-colors" placeholder="John" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-colors" placeholder="Doe" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-colors" placeholder="john@company.com" />
            </div>
             <div className="space-y-2 mb-6">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Message</label>
                <textarea className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-colors h-32 resize-none" placeholder="Tell us about your project..."></textarea>
            </div>
            <button type="button" className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center shadow-lg">
                Send Message <ArrowRight className="w-5 h-5 ml-2" />
            </button>
        </form>
    </div>
  </section>
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
      {/* Revised Hero / Mission */}
      <section className="relative overflow-hidden py-32 text-center bg-slate-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-900/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/30 border border-red-500/30 mb-8 animate-fade-in">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <span className="text-xs text-red-400 font-bold uppercase tracking-widest">Time Critical: Motivation Fades</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight leading-tight animate-slide-up">
            Ideas Decay in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">10 Days</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            You have a spark. If you don't build it now, you'll lose the drive. We turn your mental concept into a deployed system before the motivation fades.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => handleNavigate(AppView.EDUCATION)} className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-brand-900/30 flex items-center justify-center">
               Start Learning <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button onClick={() => handleNavigate(AppView.CONTACT)} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all border border-slate-800 flex items-center justify-center">
               Deploy System
            </button>
          </div>
        </div>
      </section>

      {/* The 3 Pillars Section - "What We Do" */}
      <section className="py-24 bg-slate-900/50 relative border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
              <span className="text-brand-400 font-bold tracking-widest text-sm uppercase mb-2 block">Our Core Pillars</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white">What We Do</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1: Neural Systems */}
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl relative group hover:border-brand-500/50 transition-all">
                  <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-8 border border-slate-800 group-hover:border-brand-500/30 group-hover:bg-brand-900/20 transition-all">
                      <Cpu className="w-8 h-8 text-brand-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Neural Systems</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                      We engineer autonomous software architectures that learn and adapt. From predictive logistics to generative content pipelines, we build the brains behind the business.
                  </p>
                  <ul className="space-y-3">
                      <li className="flex items-center text-slate-500 text-sm"><CheckCircle2 className="w-4 h-4 text-brand-500 mr-2"/> Custom LLM Integration</li>
                      <li className="flex items-center text-slate-500 text-sm"><CheckCircle2 className="w-4 h-4 text-brand-500 mr-2"/> Autonomous Agents</li>
                  </ul>
              </div>

              {/* Pillar 2: Cognitive Upskilling */}
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl relative group hover:border-indigo-500/50 transition-all">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 border border-slate-800 group-hover:border-indigo-500/30 group-hover:bg-indigo-900/20 transition-all">
                      <Brain className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Cognitive Upskilling</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                      Through <strong>Skill Forge</strong> and our Academy, we provide verified certification paths. We don't just teach tools; we train the workforce to think alongside AI.
                  </p>
                  <ul className="space-y-3">
                      <li className="flex items-center text-slate-500 text-sm"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2"/> Interactive Roadmaps</li>
                      <li className="flex items-center text-slate-500 text-sm"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2"/> Professional Certification</li>
                  </ul>
              </div>

              {/* Pillar 3: The 7-Day Sprint */}
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl relative group hover:border-orange-500/50 transition-all">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 border border-slate-800 group-hover:border-orange-500/30 group-hover:bg-orange-900/20 transition-all">
                      <Timer className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">The 7-Day Sprint</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                      Beat the 10-day motivation drop-off. We take your raw idea and deploy a functional MVP in <strong>7 days</strong>, locking in your progress before your mind moves on.
                  </p>
                  <ul className="space-y-3">
                      <li className="flex items-center text-slate-500 text-sm"><CheckCircle2 className="w-4 h-4 text-orange-500 mr-2"/> MVP Before Decay</li>
                      <li className="flex items-center text-slate-500 text-sm"><CheckCircle2 className="w-4 h-4 text-orange-500 mr-2"/> Capture Momentum</li>
                  </ul>
              </div>
           </div>
        </div>
      </section>
      
      {/* Portfolio / Projects Section */}
      <ProjectsSection />

      {/* Team Section */}
      <TeamSection />

      {/* Academy Section */}
      <AcademySection onRegister={handleRegisterClick} />

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
