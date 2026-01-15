
import React, { useState, useEffect } from 'react';
import { db, AVAILABLE_CLASSES } from '../services/database';
import { UserProfile } from '../types';
import { Users, BookOpen, DollarSign, Calendar, Search, RefreshCw, Briefcase, GraduationCap, ShieldCheck, Database, Code, Copy, Check, AlertTriangle, Activity, Server, FileCheck, ZapOff, Coins, Trash2, HardDrive, RotateCcw, Save } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'USERS' | 'BOOKINGS' | 'DATABASE'>('USERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>({ totalKB: '0', usagePercent: '0' });

  const refreshData = async () => {
    setLoading(true);
    try {
      const u = await db.admin.getAllUsers();
      setUsers(u);
      const b = await db.admin.getAllBookings();
      setBookings(b);
      const health = await db.system.checkHealth();
      setDbHealth(health);
      const storage = await db.system.getStorageUsage();
      setStorageStats(storage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDeleteUser = async (email: string) => {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
        await db.admin.deleteUser(email);
        refreshData();
    }
  };

  const handleDeleteBooking = async (id: string) => {
      await db.admin.deleteBooking(id);
      refreshData();
  };

  const handleSeed = async () => {
      setLoading(true);
      await db.system.seedDatabase();
      await refreshData();
      alert("Database seeded with mock data.");
  };

  const handleNuke = async () => {
      if (confirm("WARNING: This will wipe ALL data. Are you sure?")) {
          await db.system.nuke();
          window.location.reload();
      }
  };

  const totalRevenue = bookings.reduce((acc, curr) => {
    const price = parseInt(curr.price.replace(/[^0-9]/g, '')) || 0;
    return acc + price;
  }, 0);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simple Analytics for Revenue per Course
  const courseRevenue: Record<string, number> = {};
  bookings.forEach(b => {
      const price = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
      courseRevenue[b.className] = (courseRevenue[b.className] || 0) + price;
  });

  const maxRevenue = Math.max(...Object.values(courseRevenue), 1); // Avoid div by zero

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <ShieldCheck className="w-6 h-6 text-brand-400" />
             </div>
             <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Control</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Server className="w-3 h-3 mr-2" />
                Browser LocalStorage
             </div>
             {dbHealth && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center ${dbHealth.status === 'OK' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'}`}>
                   <div className={`w-1.5 h-1.5 rounded-full mr-2 ${dbHealth.status === 'OK' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                   {dbHealth.message}
                </div>
             )}
          </div>
        </div>
        <button onClick={refreshData} disabled={loading} className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Users className="w-24 h-24 text-blue-400" /></div>
           <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users className="w-6 h-6" /></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Users</span>
           </div>
           <div className="text-3xl font-display font-bold text-white relative z-10">{users.length}</div>
           <div className="text-[10px] text-slate-500 mt-2 relative z-10">Active Accounts</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Coins className="w-24 h-24 text-emerald-400" /></div>
           <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Coins className="w-6 h-6" /></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Revenue</span>
           </div>
           <div className="text-3xl font-display font-bold text-emerald-400 relative z-10">NPR {totalRevenue.toLocaleString()}</div>
           <div className="text-[10px] text-emerald-500/50 mt-2 relative z-10">+12% from last week</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-24 h-24 text-amber-400" /></div>
           <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><DollarSign className="w-6 h-6" /></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Transactions</span>
           </div>
           <div className="text-3xl font-display font-bold text-white relative z-10">{bookings.length}</div>
           <div className="text-[10px] text-slate-500 mt-2 relative z-10">Successful Bookings</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Database className="w-24 h-24 text-pink-400" /></div>
           <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl"><Database className="w-6 h-6" /></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Storage</span>
           </div>
           <div className="text-3xl font-display font-bold text-brand-400 relative z-10">{storageStats.totalKB} KB</div>
           <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: `${storageStats.usagePercent}%` }}></div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px] shadow-2xl flex flex-col">
         {/* Tabs */}
         <div className="border-b border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center bg-slate-950/50">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-4 sm:mb-0">
               <button onClick={() => setActiveTab('USERS')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center ${activeTab === 'USERS' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Users className="w-4 h-4 mr-2" /> Directory
               </button>
               <button onClick={() => setActiveTab('BOOKINGS')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center ${activeTab === 'BOOKINGS' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Briefcase className="w-4 h-4 mr-2" /> Transactions
               </button>
               <button onClick={() => setActiveTab('DATABASE')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center ${activeTab === 'DATABASE' ? 'bg-slate-800 text-brand-400 shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  <HardDrive className="w-4 h-4 mr-2" /> Database
               </button>
            </div>
            
            {(activeTab === 'USERS' || activeTab === 'BOOKINGS') && (
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-brand-500 w-64"
                    />
                </div>
            )}
         </div>

         {/* Tab Content */}
         <div className="flex-grow overflow-x-auto bg-slate-900/50">
            {activeTab === 'USERS' && (
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em] border-b border-slate-800">
                     <tr>
                         <th className="px-6 py-5">User Identity</th>
                         <th className="px-6 py-5">Role</th>
                         <th className="px-6 py-5">Organization</th>
                         <th className="px-6 py-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {filteredUsers.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No users found in database.</td></tr>
                     ) : filteredUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="font-bold text-white">{u.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                 u.role === 'ADMIN' ? 'bg-red-950 text-red-400 border border-red-900' :
                                 u.role === 'BUSINESS' ? 'bg-brand-950 text-brand-400 border border-brand-900' :
                                 'bg-indigo-950 text-indigo-400 border border-indigo-900'
                              }`}>
                                 {u.role}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-slate-400">{u.organization || '—'}</td>
                           <td className="px-6 py-4 text-right">
                               <button onClick={() => handleDeleteUser(u.email)} className="text-slate-600 hover:text-red-400 transition-colors p-2" title="Delete User">
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}

            {activeTab === 'BOOKINGS' && (
               <div className="flex flex-col h-full">
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-slate-800 bg-slate-950/30">
                     <div className="space-y-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Revenue Distribution</h3>
                        <div className="space-y-3">
                           {Object.entries(courseRevenue).map(([course, revenue], idx) => (
                               <div key={idx} className="group">
                                  <div className="flex justify-between text-xs mb-1">
                                     <span className="text-slate-400">{course}</span>
                                     <span className="text-white font-mono">NPR {revenue.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors" style={{ width: `${(revenue / maxRevenue) * 100}%` }}></div>
                                  </div>
                               </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  <table className="w-full text-left text-sm flex-grow">
                    <thead className="bg-slate-950/80 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em] border-b border-slate-800">
                        <tr><th className="px-6 py-5">User</th><th className="px-6 py-5">Class</th><th className="px-6 py-5">Date</th><th className="px-6 py-5">Amount</th><th className="px-6 py-5 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {bookings.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No transactions recorded.</td></tr>
                        ) : bookings.map((b, i) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{b.userName}</div>
                                    <div className="text-xs text-slate-500 font-mono">{b.userEmail}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-300">{b.className}</td>
                                <td className="px-6 py-4 text-slate-500 text-xs font-mono">{new Date(b.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-emerald-400 font-bold">{b.price}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDeleteBooking(b.id)} className="text-slate-600 hover:text-red-400 transition-colors p-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
               </div>
            )}

            {activeTab === 'DATABASE' && (
                <div className="p-12 text-center max-w-2xl mx-auto">
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-700">
                            <HardDrive className="w-10 h-10 text-brand-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Database Management</h3>
                        <p className="text-slate-400 text-sm">Directly manipulate the browser LocalStorage.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={handleSeed}
                            className="group p-6 bg-slate-950 border border-slate-800 rounded-2xl hover:border-brand-500/50 transition-all text-left"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-brand-500/10 rounded-xl group-hover:bg-brand-500/20 transition-colors"><Save className="w-6 h-6 text-brand-400" /></div>
                                <h4 className="font-bold text-white">Seed Mock Data</h4>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">Populates the database with realistic sample users and booking data for testing.</p>
                        </button>

                        <button 
                            onClick={handleNuke}
                            className="group p-6 bg-red-950/10 border border-red-900/30 rounded-2xl hover:bg-red-950/20 hover:border-red-500/50 transition-all text-left"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors"><RotateCcw className="w-6 h-6 text-red-400" /></div>
                                <h4 className="font-bold text-white">Factory Reset</h4>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">Irreversibly wipes ALL LocalStorage data and logs you out. Use with caution.</p>
                        </button>
                    </div>

                    <div className="mt-12 p-6 bg-slate-950/50 rounded-xl border border-slate-800 text-left">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Storage Diagnostics</h4>
                        <div className="space-y-2 font-mono text-xs text-slate-400">
                            <div className="flex justify-between"><span>Total Allocated</span> <span className="text-white">5,000 KB (Approx)</span></div>
                            <div className="flex justify-between"><span>Used Space</span> <span className="text-brand-400">{storageStats.totalKB} KB</span></div>
                            <div className="flex justify-between"><span>Free Space</span> <span className="text-emerald-400">{(5000 - parseFloat(storageStats.totalKB)).toFixed(2)} KB</span></div>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
