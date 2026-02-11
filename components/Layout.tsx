
import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { Menu, X, Brain, Rocket, GraduationCap, LogIn, LogOut, Briefcase, User, Building2, School, Users, Mail, BookOpen, Search } from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: UserProfile | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, user, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userRole = user?.role || 'GUEST';

  // Define links
  const allLinks = [
    {
      id: AppView.HOME,
      label: 'Home',
      icon: <Brain className="w-4 h-4" />,
      allowed: ['GUEST', 'BUSINESS', 'STUDENT']
    },
    {
      id: AppView.PROJECTS,
      label: 'Case Studies',
      icon: <Briefcase className="w-4 h-4" />,
      allowed: ['GUEST', 'BUSINESS', 'STUDENT']
    },
    {
      id: AppView.ACADEMY,
      label: 'Training',
      icon: <BookOpen className="w-4 h-4" />,
      allowed: ['GUEST', 'STUDENT', 'BUSINESS']
    },
    {
      id: AppView.TEAM,
      label: 'Team',
      icon: <Users className="w-4 h-4" />,
      allowed: ['GUEST', 'STUDENT', 'BUSINESS']
    },
    {
      id: AppView.CONTACT,
      label: 'Partner With Us',
      icon: <Mail className="w-4 h-4" />,
      allowed: ['GUEST', 'STUDENT', 'BUSINESS']
    },
    {
      id: AppView.GAP_ANALYSIS,
      label: 'Free Analysis',
      icon: <Search className="w-4 h-4" />,
      allowed: ['GUEST', 'STUDENT', 'BUSINESS']
    },
  ];

  const visibleLinks = allLinks.filter(link => link.allowed.includes(userRole));

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <button 
              onClick={() => setView(AppView.HOME)} 
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-900/20 group-hover:scale-105 transition-transform duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-start">
                 <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
                  MIND IS <span className="text-brand-400">GEAR</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-1">
                  Growth Partners
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center bg-slate-900/50 rounded-full px-6 py-2 border border-slate-800/50">
                {visibleLinks.map((link, index) => (
                  <React.Fragment key={link.id}>
                    <button
                      onClick={() => setView(link.id as AppView)}
                      className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-200 ${
                        currentView === link.id
                          ? 'text-brand-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </button>
                    {index < visibleLinks.length - 1 && (
                      <div className="w-px h-4 bg-slate-800 mx-3"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Auth Area */}
              <div className="pl-4 border-l border-slate-800 ml-4">
                {!user ? (
                  <button
                    onClick={() => setView(AppView.LOGIN)}
                    className="group flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-brand-900/20 transition-all hover:shadow-brand-500/30 hover:-translate-y-0.5"
                  >
                    <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    <span>Sign In</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 text-right">
                      <div className="hidden xl:block">
                        <div className="text-sm font-bold text-white leading-none mb-1">{user.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 uppercase tracking-wider font-medium">
                           {user.organization && (
                             <>
                              {user.role === 'BUSINESS' ? <Building2 className="w-3 h-3" /> : <School className="w-3 h-3" />}
                              <span className="max-w-[100px] truncate">{user.organization}</span>
                             </>
                           )}
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${userRole === 'BUSINESS' ? 'bg-brand-900/20 border-brand-500/50 text-brand-400' : 'bg-indigo-900/20 border-indigo-500/50 text-indigo-400'}`}>
                         <User className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <button
                      onClick={onLogout}
                      className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-400 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 animate-fade-in">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {visibleLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setView(link.id as AppView);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center space-x-3 px-4 py-4 rounded-xl text-base font-medium transition-colors ${
                    currentView === link.id
                      ? 'bg-slate-800 text-brand-400 border border-slate-700'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
              
              <div className="border-t border-slate-800 mt-4 pt-4">
                 {!user ? (
                    <button
                      onClick={() => {
                        setView(AppView.LOGIN);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-4 py-4 rounded-xl font-bold shadow-lg shadow-brand-900/20"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </button>
                 ) : (
                    <div className="space-y-4">
                      <div className="flex items-center px-4 py-3 bg-slate-800 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${userRole === 'BUSINESS' ? 'bg-brand-900/20 border-brand-500/50 text-brand-400' : 'bg-indigo-900/20 border-indigo-500/50 text-indigo-400'}`}>
                           <User className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                           <div className="text-sm font-bold text-white">{user.name}</div>
                           <div className="text-xs text-slate-400">{user.email}</div>
                           {user.organization && (
                             <div className="text-xs text-brand-400 mt-0.5 font-medium">{user.organization}</div>
                           )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex w-full items-center justify-center space-x-2 bg-slate-800 text-red-400 px-4 py-4 rounded-xl font-bold hover:bg-slate-700"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-6 h-6 text-brand-500" />
              <span className="font-display font-bold text-lg text-white">Mind is Gear</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">
              Your long-term growth partner. We find your gaps, build solutions, and grow with you in the global marketplace.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Partnership</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li onClick={() => setView(AppView.PROJECTS)} className="hover:text-brand-400 cursor-pointer">Case Studies</li>
              <li onClick={() => setView(AppView.CONTACT)} className="hover:text-brand-400 cursor-pointer">Partner With Us</li>
              <li onClick={() => setView(AppView.GAP_ANALYSIS)} className="hover:text-brand-400 cursor-pointer">Free Analysis</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li onClick={() => setView(AppView.ACADEMY)} className="hover:text-brand-400 cursor-pointer">Training Programs</li>
              <li onClick={() => setView(AppView.TEAM)} className="hover:text-brand-400 cursor-pointer">Our Team</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Mind is Gear. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
