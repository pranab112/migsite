
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { UserProfile } from '../types';
import { Users, BookOpen, DollarSign, Calendar, Search, RefreshCw, Briefcase, GraduationCap, ShieldCheck, Database, Code, Copy, Check, AlertTriangle, Activity, Server, FileCheck, ZapOff, Coins } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'USERS' | 'BOOKINGS'>('USERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [optimizedCalls, setOptimizedCalls] = useState(0);

  const refreshData = async () => {
    setLoading(true);
    try {
      const u = await db.admin.getAllUsers();
      setUsers(u);
      const b = await db.admin.getAllBookings();
      setBookings(b);
      const health = await db.system.checkHealth();
      setDbHealth(health);
      setOptimizedCalls(Math.floor(u.length * 12 + b.length * 5)); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalRevenue = bookings.reduce((acc, curr) => {
    const price = parseInt(curr.price.replace(/[^0-9]/g, '')) || 0;
    return acc + price;
  }, 0);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">System Core Dashboard</h1>
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Server className="w-3 h-3 mr-2" />
                Local Storage Mode
             </div>
             {dbHealth && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center ${dbHealth.status === 'OK' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'}`}>
                   <div className={`w-1.5 h-1.5 rounded-full mr-2 ${dbHealth.status === 'OK' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                   {dbHealth.message}
                </div>
             )}
          </div>
        </div>
        <button onClick={refreshData} className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Sync System
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users className="w-6 h-6" /></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Active Users</span>
           </div>
           <div className="text-3xl font-display font-bold text-white">{users.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Coins className="w-6 h-6" /></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Efficiency</span>
           </div>
           <div className="text-3xl font-display font-bold text-emerald-400">~${(optimizedCalls * 0.002).toFixed(2)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><DollarSign className="w-6 h-6" /></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Revenue</span>
           </div>
           <div className="text-3xl font-display font-bold text-white">NPR {totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl"><Activity className="w-6 h-6" /></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Requests</span>
           </div>
           <div className="text-3xl font-display font-bold text-brand-400">{optimizedCalls}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px] shadow-2xl">
         <div className="border-b border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center bg-slate-950/50">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
               <button onClick={() => setActiveTab('USERS')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>User Directory</button>
               <button onClick={() => setActiveTab('BOOKINGS')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'BOOKINGS' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Transactions</button>
            </div>
         </div>

         <div className="p-0 overflow-x-auto">
            {activeTab === 'USERS' && (
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em]">
                     <tr><th className="px-6 py-5">Full Name</th><th className="px-6 py-5">Email</th><th className="px-6 py-5">Role</th><th className="px-6 py-5">Affiliation</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {filteredUsers.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No users found.</td></tr>
                     ) : filteredUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                           <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                           <td className="px-6 py-4 text-slate-400 font-mono text-xs">{u.email}</td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                 u.role === 'ADMIN' ? 'bg-red-950 text-red-400' :
                                 u.role === 'BUSINESS' ? 'bg-brand-950 text-brand-400' :
                                 'bg-indigo-950 text-indigo-400'
                              }`}>
                                 {u.role}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-slate-500">{u.organization || 'Independent'}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
            {activeTab === 'BOOKINGS' && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em]">
                    <tr><th className="px-6 py-5">User</th><th className="px-6 py-5">Class</th><th className="px-6 py-5">Date</th><th className="px-6 py-5">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {bookings.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No transactions found.</td></tr>
                    ) : bookings.map((b, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4">
                                <div className="font-bold text-white">{b.userName}</div>
                                <div className="text-xs text-slate-500">{b.userEmail}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{b.className}</td>
                            <td className="px-6 py-4 text-slate-500 text-xs font-mono">{new Date(b.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-emerald-400 font-bold">{b.price}</td>
                        </tr>
                    ))}
                </tbody>
              </table>
            )}
         </div>
      </div>
    </div>
  );
};
