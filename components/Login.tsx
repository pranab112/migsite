
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { db } from '../services/database';
import { Briefcase, GraduationCap, ArrowRight, ShieldCheck, Loader2, ArrowLeft, Brain, Mail, Lock, User, Building2, School, AlertCircle, Wifi, WifiOff, Database, Key, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

type AuthMode = 'SIGN_IN' | 'SIGN_UP';
type AuthStep = 'ROLE_SELECTION' | 'AUTH_FORM';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('ROLE_SELECTION');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    const check = async () => {
      const status = await db.system.checkHealth();
      setDbStatus(status);
    };
    check();
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('AUTH_FORM');
    setAuthMode('SIGN_IN');
    setName('');
    setEmail('');
    setPassword('');
    setOrgName('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'SIGN_UP') {
        if (!name || !email || !password || !orgName) throw new Error("All fields are required for registration.");
        const result = await db.auth.signUp({ name, email, role: selectedRole as UserRole, organization: orgName }, password);
        onLogin(result.user);
      } else {
        const user = await db.auth.signIn(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const themeGradient = selectedRole === 'BUSINESS' ? 'from-brand-600 to-cyan-600' : selectedRole === 'ADMIN' ? 'from-red-600 to-orange-600' : 'from-indigo-600 to-purple-600';

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-4xl w-full relative z-10">
        {step === 'ROLE_SELECTION' && (
          <div className="animate-fade-in">
             <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mb-6 shadow-2xl">
                 <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">Partner Portal</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Sign in to access your partnership dashboard and growth tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={() => handleRoleSelect('BUSINESS')} className="group relative p-1 rounded-3xl transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <div className="relative h-full bg-slate-900 rounded-[22px] p-8 border border-slate-800 text-left flex flex-col">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors">
                    <Briefcase className="w-8 h-8 text-brand-400 group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Business Partner</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed text-sm flex-grow">Access your growth dashboard, gap analyses, and partnership tools.</p>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-6 mt-auto text-xs font-bold text-slate-500 uppercase">
                    <span>Partner Access</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>

              <button onClick={() => handleRoleSelect('STUDENT')} className="group relative p-1 rounded-3xl transition-all duration-500 hover:scale-[1.02]">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                 <div className="relative h-full bg-slate-900 rounded-[22px] p-8 border border-slate-800 text-left flex flex-col">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                    <GraduationCap className="w-8 h-8 text-indigo-400 group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Team Member</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed text-sm flex-grow">Access training programs and team development resources.</p>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-6 mt-auto text-xs font-bold text-slate-500 uppercase">
                    <span>Team Access</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            </div>
            
            <div className="mt-12 text-center space-y-4">
              <div className="flex justify-center items-center gap-4">
                 <button onClick={() => handleRoleSelect('ADMIN')} className="text-slate-600 hover:text-red-400 text-xs font-medium transition-colors flex items-center">
                    <Key className="w-3 h-3 mr-1" /> Admin Portal
                 </button>
              </div>

              {dbStatus && (
                <div className={`inline-flex items-center px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider ${dbStatus.status === 'OK' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-red-950/30 border-red-500/30 text-red-400'}`}>
                    {dbStatus.status === 'OK' ? <Wifi className="w-3 h-3 mr-2" /> : <WifiOff className="w-3 h-3 mr-2" />}
                    <span>{dbStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'AUTH_FORM' && selectedRole && (
          <div className="max-w-md mx-auto animate-slide-up">
            <button onClick={() => { setStep('ROLE_SELECTION'); setError(null); }} className="mb-8 flex items-center text-slate-400 hover:text-white text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
               <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${themeGradient}`}></div>
               <div className="text-center mb-8">
                 <h2 className="text-2xl font-bold text-white mb-2">{authMode === 'SIGN_IN' ? 'Sign In' : 'Create Account'}</h2>
                 <p className="text-slate-400 text-sm">Mind is Gear Partner Portal</p>
               </div>
              
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

               <form onSubmit={handleSubmit} className="space-y-4">
                 {authMode === 'SIGN_UP' && selectedRole !== 'ADMIN' && (
                   <div className="space-y-4">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                       <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Name" />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase">{selectedRole === 'BUSINESS' ? 'Company' : 'School'}</label>
                       <input type="text" required value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Organization" />
                     </div>
                   </div>
                 )}

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Email" />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="••••••••" />
                 </div>

                 <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 mt-4 flex items-center justify-center bg-gradient-to-r ${themeGradient}`}>
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center">{authMode === 'SIGN_IN' ? 'Sign In' : 'Create Account'}<ArrowRight className="ml-2 w-5 h-5" /></span>}
                 </button>
               </form>

               {selectedRole !== 'ADMIN' && (
                 <div className="mt-6 text-center pt-6 border-t border-slate-800">
                    <button onClick={() => { setAuthMode(authMode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN'); setError(null); }} className={`font-bold hover:underline text-sm ${selectedRole === 'BUSINESS' ? 'text-brand-400' : 'text-indigo-400'}`}>
                      {authMode === 'SIGN_IN' ? 'Create New Account' : 'Use Existing Account'}
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
