
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserProfile } from '../types';
import {
  Users, BookOpen, DollarSign, Calendar, Search, RefreshCw, Briefcase,
  GraduationCap, ShieldCheck, Database, Code, Copy, Check, AlertTriangle,
  Activity, Server, FileCheck, ZapOff, Coins, Trash2, HardDrive, RotateCcw,
  Save, Plus, Edit3, Eye, EyeOff, Mail, MessageSquare, Settings, BarChart3,
  TrendingUp, Award, Clock, Filter, ChevronDown, ChevronRight, X, AlertCircle,
  CheckCircle2, XCircle, Loader2, Download, Upload, Bell, LogOut, UserPlus, Linkedin, Twitter,
  FolderKanban, Zap, Shield, FileText
} from 'lucide-react';

type AdminTab = 'DASHBOARD' | 'USERS' | 'COURSES' | 'BOOKINGS' | 'PLANS' | 'CERTIFICATES' | 'MESSAGES' | 'LOGS' | 'SETTINGS' | 'DATABASE' | 'TEAM' | 'PROJECTS';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  is_active: number;
  last_login: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  price: string;
  capacity: number;
  enrolled: number;
  is_active: number;
  is_featured: number;
  total_bookings: number;
  total_revenue: number;
  tags: string[];
}

interface Booking {
  id: string;
  user_name: string;
  user_email: string;
  class_title: string;
  price_paid: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface Analytics {
  users: { total: number; newToday: number; byRole: any[] };
  revenue: { total: number; today: number; thisMonth: number; trend: any[]; byClass: any[] };
  bookings: { total: number; byStatus: any[] };
  courses: { total: number };
  education: { studyPlans: number; certificates: number };
  messages: { unread: number };
  recentActivity: any[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin: string;
  twitter: string;
  display_order: number;
  is_active: number;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  category: string;
  client: string;
  description: string;
  image: string;
  stats: { label: string; icon: string }[];
  technologies: string[];
  display_order: number;
  is_active: number;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);

  // Settings state
  const [settings, setSettings] = useState<any[]>([]);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Plans & Certificates
  const [plans, setPlans] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Database stats
  const [dbStats, setDbStats] = useState<any>(null);

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  const fetchAnalytics = async () => {
    try {
      const data = await api.admin.getAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.admin.getUsers({ search: userSearch, role: userRoleFilter });
      setUsers(data.users);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await api.admin.getClasses();
      setCourses(data);
    } catch (e) {
      console.error('Failed to fetch courses:', e);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await api.admin.getBookings({ status: bookingStatusFilter });
      setBookings(data.bookings);
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await api.admin.getContacts();
      setMessages(data);
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await api.admin.getLogs();
      setLogs(data.logs);
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await api.admin.getSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await api.admin.getPlans();
      setPlans(data);
    } catch (e) {
      console.error('Failed to fetch plans:', e);
    }
  };

  const fetchCertificates = async () => {
    try {
      const data = await api.admin.getCertificates();
      setCertificates(data);
    } catch (e) {
      console.error('Failed to fetch certificates:', e);
    }
  };

  const fetchDbStats = async () => {
    try {
      const data = await api.admin.getDatabaseStats();
      setDbStats(data);
    } catch (e) {
      console.error('Failed to fetch db stats:', e);
    }
  };

  const fetchTeam = async () => {
    try {
      const data = await api.admin.getTeam();
      setTeamMembers(data);
    } catch (e) {
      console.error('Failed to fetch team:', e);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await api.admin.getProjects();
      setProjects(data);
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchUsers(),
      fetchCourses(),
      fetchBookings(),
      fetchMessages(),
      fetchLogs(),
      fetchSettings(),
      fetchPlans(),
      fetchCertificates(),
      fetchDbStats(),
      fetchTeam(),
      fetchProjects()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (api.auth.isAuthenticated()) {
      refreshAll();
    } else {
      setLoading(false);
      console.log('AdminDashboard: User not authenticated, skipping data fetch');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'USERS' && api.auth.isAuthenticated()) fetchUsers();
  }, [userSearch, userRoleFilter]);

  useEffect(() => {
    if (activeTab === 'BOOKINGS' && api.auth.isAuthenticated()) fetchBookings();
  }, [bookingStatusFilter]);

  // User CRUD handlers
  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await api.admin.updateUser(editingUser.id, formData);
      } else {
        await api.admin.createUser(formData);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({});
      fetchUsers();
    } catch (e: any) {
      alert(e.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.admin.deleteUser(id);
      fetchUsers();
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  // Course CRUD handlers
  const handleSaveCourse = async () => {
    try {
      const courseData = {
        ...formData,
        price: parseInt(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 100,
        tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()) : []
      };

      if (editingCourse) {
        await api.admin.updateClass(editingCourse.id, courseData);
      } else {
        await api.admin.createClass(courseData);
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      setFormData({});
      fetchCourses();
    } catch (e: any) {
      alert(e.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.admin.deleteClass(id);
      fetchCourses();
    } catch (e) {
      alert('Failed to delete course');
    }
  };

  // Booking handlers
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await api.admin.updateBookingStatus(id, status);
      fetchBookings();
    } catch (e) {
      alert('Failed to update booking');
    }
  };

  // Message handlers
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.admin.markContactRead(id);
      fetchMessages();
    } catch (e) {
      alert('Failed to mark as read');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.admin.deleteContact(id);
      fetchMessages();
    } catch (e) {
      alert('Failed to delete message');
    }
  };

  // Settings handler
  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await api.admin.updateSetting(key, value);
      fetchSettings();
    } catch (e) {
      alert('Failed to update setting');
    }
  };

  // Password change handler
  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.auth.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      setPasswordMessage({ type: 'error', text: e.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Database handlers
  const handleSeedDatabase = async () => {
    if (!confirm('Seed database with mock data?')) return;
    try {
      await api.admin.seedDatabase();
      alert('Database seeded successfully!');
      refreshAll();
    } catch (e) {
      alert('Failed to seed database');
    }
  };

  // Team CRUD handlers
  const handleSaveTeamMember = async () => {
    try {
      const memberData = {
        ...formData,
        display_order: parseInt(formData.display_order) || 0,
        is_active: formData.is_active !== false
      };

      if (editingTeamMember) {
        await api.admin.updateTeamMember(editingTeamMember.id, memberData);
      } else {
        await api.admin.createTeamMember(memberData);
      }
      setShowTeamModal(false);
      setEditingTeamMember(null);
      setFormData({});
      fetchTeam();
    } catch (e: any) {
      alert(e.message || 'Failed to save team member');
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
      await api.admin.deleteTeamMember(id);
      fetchTeam();
    } catch (e) {
      alert('Failed to delete team member');
    }
  };

  // Projects CRUD handlers
  const handleSaveProject = async () => {
    try {
      const projectData = {
        ...formData,
        display_order: parseInt(formData.display_order) || 0,
        is_active: formData.is_active !== false,
        technologies: formData.technologies ? formData.technologies.split(',').map((t: string) => t.trim()) : [],
        stats: formData.stats || []
      };

      if (editingProject) {
        await api.admin.updateProject(editingProject.id, projectData);
      } else {
        await api.admin.createProject(projectData);
      }
      setShowProjectModal(false);
      setEditingProject(null);
      setFormData({});
      fetchProjects();
    } catch (e: any) {
      alert(e.message || 'Failed to save project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.admin.deleteProject(id);
      fetchProjects();
    } catch (e) {
      alert('Failed to delete project');
    }
  };

  // Navigation items
  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: BarChart3 },
    { id: 'USERS', label: 'Users', icon: Users },
    { id: 'TEAM', label: 'Team', icon: UserPlus },
    { id: 'PROJECTS', label: 'Projects', icon: FolderKanban },
    { id: 'COURSES', label: 'Courses', icon: BookOpen },
    { id: 'BOOKINGS', label: 'Bookings', icon: DollarSign },
    { id: 'PLANS', label: 'Study Plans', icon: GraduationCap },
    { id: 'CERTIFICATES', label: 'Certificates', icon: Award },
    { id: 'MESSAGES', label: 'Messages', icon: MessageSquare, badge: analytics?.messages.unread },
    { id: 'LOGS', label: 'Activity Logs', icon: Activity },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
    { id: 'DATABASE', label: 'Database', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 fixed left-0 top-0 pt-6">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-600 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                <p className="text-slate-500 text-xs">Mind is Gear</p>
              </div>
            </div>
          </div>

          <nav className="px-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all ${
                  activeTab === item.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-6 left-3 right-3">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh Data</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {loading && !analytics ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* DASHBOARD TAB */}
              {activeTab === 'DASHBOARD' && analytics && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
                    <p className="text-slate-400">Real-time analytics and system metrics</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                          <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-emerald-400 text-xs font-bold">+{analytics.users.newToday} today</span>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{analytics.users.total}</div>
                      <div className="text-slate-500 text-sm">Total Users</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                          <Coins className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-emerald-400 text-xs font-bold flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" /> This Month
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-400 mb-1">NPR {analytics.revenue.total.toLocaleString()}</div>
                      <div className="text-slate-500 text-sm">Total Revenue</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                          <DollarSign className="w-6 h-6 text-amber-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{analytics.bookings.total}</div>
                      <div className="text-slate-500 text-sm">Total Bookings</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                          <Award className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{analytics.education.certificates}</div>
                      <div className="text-slate-500 text-sm">Certificates Issued</div>
                    </div>
                  </div>

                  {/* Revenue by Course */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-brand-400" />
                        Revenue by Course
                      </h3>
                      <div className="space-y-4">
                        {analytics.revenue.byClass.map((item, idx) => {
                          const maxRev = Math.max(...analytics.revenue.byClass.map(c => c.revenue), 1);
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400 truncate max-w-[200px]">{item.title}</span>
                                <span className="text-white font-mono">NPR {item.revenue.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
                                  style={{ width: `${(item.revenue / maxRev) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-400" />
                        Recent Activity
                      </h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {analytics.recentActivity.slice(0, 10).map((log, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-brand-500 mt-2" />
                            <div className="flex-1">
                              <div className="text-sm text-white">{log.action.replace(/_/g, ' ')}</div>
                              <div className="text-xs text-slate-500">{log.details}</div>
                              <div className="text-xs text-slate-600 mt-1">
                                {new Date(log.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Users by Role */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6">Users by Role</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {analytics.users.byRole.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-white">{item.count}</div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider">{item.role}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'USERS' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
                      <p className="text-slate-400">Manage all registered users</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setFormData({ role: 'STUDENT' });
                        setShowUserModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-500 outline-none"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                    >
                      <option value="">All Roles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="BUSINESS">Business</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  </div>

                  {/* Users Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-950">
                        <tr>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Role</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Organization</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Last Login</th>
                          <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{user.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                user.role === 'ADMIN' ? 'bg-red-950 text-red-400 border border-red-900' :
                                user.role === 'BUSINESS' ? 'bg-brand-950 text-brand-400 border border-brand-900' :
                                'bg-indigo-950 text-indigo-400 border border-indigo-900'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400">{user.organization || '—'}</td>
                            <td className="px-6 py-4">
                              {user.is_active ? (
                                <span className="flex items-center text-emerald-400 text-sm">
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> Active
                                </span>
                              ) : (
                                <span className="flex items-center text-red-400 text-sm">
                                  <XCircle className="w-4 h-4 mr-1" /> Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setFormData(user);
                                  setShowUserModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TEAM TAB */}
              {activeTab === 'TEAM' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Team Management</h2>
                      <p className="text-slate-400">Manage team members displayed on the website</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTeamMember(null);
                        setFormData({ is_active: true, display_order: teamMembers.length + 1 });
                        setShowTeamModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Team Member
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-brand-500/50 transition-all">
                        <div className="aspect-square overflow-hidden relative">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-bold text-white">{member.name}</h3>
                            <p className="text-brand-400 text-sm font-medium">{member.role}</p>
                          </div>
                          {!member.is_active && (
                            <div className="absolute top-4 right-4 px-2 py-1 bg-red-950 text-red-400 text-[10px] font-bold rounded uppercase">
                              Inactive
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-slate-400 text-sm line-clamp-2 mb-4">{member.bio}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {member.linkedin && (
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                  <Linkedin className="w-4 h-4" />
                                </a>
                              )}
                              {member.twitter && (
                                <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                  <Twitter className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingTeamMember(member);
                                  setFormData(member);
                                  setShowTeamModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTeamMember(member.id)}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-slate-600">
                            Display Order: {member.display_order}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROJECTS TAB */}
              {activeTab === 'PROJECTS' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Project Management</h2>
                      <p className="text-slate-400">Manage portfolio projects displayed on the website</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setFormData({ is_active: true, display_order: projects.length + 1, technologies: '', stats: [] });
                        setShowProjectModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-brand-500/50 transition-all">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={project.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-brand-600/90 text-white text-xs font-bold rounded-full">
                              {project.category}
                            </span>
                          </div>
                          {!project.is_active && (
                            <div className="absolute top-4 right-4 px-2 py-1 bg-red-950 text-red-400 text-[10px] font-bold rounded uppercase">
                              Inactive
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                          {project.client && (
                            <p className="text-brand-400 text-sm font-medium mb-3">Client: {project.client}</p>
                          )}
                          <p className="text-slate-400 text-sm line-clamp-2 mb-4">{project.description}</p>

                          {/* Technologies */}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies.map((tech, idx) => (
                                <span key={idx} className="px-2 py-1 bg-slate-950 text-slate-400 text-xs rounded-lg border border-slate-800">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Stats */}
                          {project.stats && project.stats.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              {project.stats.map((stat, idx) => (
                                <div key={idx} className="bg-slate-950 p-2 rounded-lg text-center">
                                  <div className="text-xs text-slate-500">{stat.label}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            <div className="text-xs text-slate-600">
                              Order: {project.display_order}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingProject(project);
                                  setFormData({
                                    ...project,
                                    technologies: project.technologies?.join(', ') || ''
                                  });
                                  setShowProjectModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {projects.length === 0 && (
                    <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
                      <FolderKanban className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-500">No projects yet. Add your first project!</p>
                    </div>
                  )}
                </div>
              )}

              {/* COURSES TAB */}
              {activeTab === 'COURSES' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Course Management</h2>
                      <p className="text-slate-400">Manage academy courses and pricing</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCourse(null);
                        setFormData({ is_active: true, is_featured: false });
                        setShowCourseModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Course
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {courses.map((course) => (
                      <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {course.is_featured ? (
                                  <span className="px-2 py-0.5 bg-amber-950 text-amber-400 text-[10px] font-bold rounded uppercase">Featured</span>
                                ) : null}
                                {!course.is_active && (
                                  <span className="px-2 py-0.5 bg-red-950 text-red-400 text-[10px] font-bold rounded uppercase">Inactive</span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
                              <p className="text-slate-500 text-sm">By {course.instructor}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-brand-400">{course.price}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-slate-950 p-3 rounded-xl text-center">
                              <div className="text-lg font-bold text-white">{course.enrolled}/{course.capacity}</div>
                              <div className="text-xs text-slate-500">Enrolled</div>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl text-center">
                              <div className="text-lg font-bold text-white">{course.total_bookings || 0}</div>
                              <div className="text-xs text-slate-500">Bookings</div>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl text-center">
                              <div className="text-lg font-bold text-emerald-400">NPR {(course.total_revenue || 0).toLocaleString()}</div>
                              <div className="text-xs text-slate-500">Revenue</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {course.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-slate-950 text-slate-400 text-xs rounded-lg border border-slate-800">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingCourse(course);
                                setFormData({
                                  ...course,
                                  price: parseInt(course.price.replace(/[^0-9]/g, '')),
                                  tags: course.tags.join(', ')
                                });
                                setShowCourseModal(true);
                              }}
                              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"
                            >
                              <Edit3 className="w-4 h-4 inline mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="px-4 py-2 bg-red-950/50 hover:bg-red-900/50 text-red-400 rounded-xl text-sm font-bold transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BOOKINGS TAB */}
              {activeTab === 'BOOKINGS' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Bookings & Transactions</h2>
                      <p className="text-slate-400">View and manage all course enrollments</p>
                    </div>
                    <select
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:border-brand-500 outline-none"
                    >
                      <option value="">All Status</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="REFUNDED">Refunded</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-950">
                        <tr>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Course</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Amount</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Payment</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Date</th>
                          <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{booking.user_name}</div>
                              <div className="text-xs text-slate-500">{booking.user_email}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{booking.class_title}</td>
                            <td className="px-6 py-4 text-emerald-400 font-bold">NPR {booking.price_paid.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                booking.payment_method === 'ESEWA' ? 'bg-[#60bb46]/20 text-[#60bb46]' : 'bg-[#5c2d91]/20 text-[#a663cc]'
                              }`}>
                                {booking.payment_method}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                className={`bg-transparent border rounded px-2 py-1 text-xs font-bold outline-none ${
                                  booking.status === 'COMPLETED' ? 'border-emerald-500/50 text-emerald-400' :
                                  booking.status === 'PENDING' ? 'border-amber-500/50 text-amber-400' :
                                  booking.status === 'REFUNDED' ? 'border-blue-500/50 text-blue-400' :
                                  'border-red-500/50 text-red-400'
                                }`}
                              >
                                <option value="COMPLETED">Completed</option>
                                <option value="PENDING">Pending</option>
                                <option value="REFUNDED">Refunded</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PLANS TAB */}
              {activeTab === 'PLANS' && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Study Plans</h2>
                    <p className="text-slate-400">Monitor user learning progress</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                      <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{plan.topic}</h3>
                            <p className="text-slate-500 text-sm">{plan.user_name} ({plan.user_email})</p>
                          </div>
                          <span className="px-2 py-1 bg-brand-950 text-brand-400 text-xs font-bold rounded uppercase">
                            {plan.difficulty}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white font-bold">
                              {plan.completed_weeks?.length || 0}/{plan.roadmap?.length || 0} modules
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 transition-all"
                              style={{
                                width: `${plan.roadmap?.length ? ((plan.completed_weeks?.length || 0) / plan.roadmap.length) * 100 : 0}%`
                              }}
                            />
                          </div>
                        </div>

                        {plan.certificate && (
                          <div className="flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
                            <Award className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 text-sm font-bold">Certificate Earned</span>
                          </div>
                        )}

                        <div className="text-xs text-slate-600 mt-4">
                          Created: {new Date(plan.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CERTIFICATES TAB */}
              {activeTab === 'CERTIFICATES' && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Certificates</h2>
                    <p className="text-slate-400">All issued certificates</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-950">
                        <tr>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Certificate ID</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Student</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Course</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Level</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Issue Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {certificates.map((cert) => (
                          <tr key={cert.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-brand-400">{cert.id.slice(0, 8).toUpperCase()}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{cert.student_name}</div>
                              <div className="text-xs text-slate-500">{cert.user_email}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{cert.course_name}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded">
                                {cert.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{cert.issue_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MESSAGES TAB */}
              {activeTab === 'MESSAGES' && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Contact Messages</h2>
                    <p className="text-slate-400">Manage contact form submissions</p>
                  </div>

                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`bg-slate-900 border rounded-2xl p-6 ${!msg.is_read ? 'border-brand-500/50' : 'border-slate-800'}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {!msg.is_read && (
                              <span className="w-2 h-2 rounded-full bg-brand-500" />
                            )}
                            <div>
                              <div className="font-bold text-white">{msg.first_name} {msg.last_name}</div>
                              <div className="text-sm text-slate-500">{msg.email}</div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-600">
                            {new Date(msg.created_at).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-slate-300 mb-4">{msg.message}</p>
                        <div className="flex gap-2">
                          {!msg.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(msg.id)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                              <Check className="w-4 h-4 inline mr-2" />
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="px-4 py-2 bg-red-950/50 hover:bg-red-900/50 text-red-400 rounded-lg text-sm font-bold transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LOGS TAB */}
              {activeTab === 'LOGS' && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Activity Logs</h2>
                    <p className="text-slate-400">System activity and audit trail</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-950">
                        <tr>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Timestamp</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Action</th>
                          <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 text-slate-500 text-sm font-mono">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white text-sm">{log.user_name || 'System'}</div>
                              <div className="text-xs text-slate-500">{log.user_email || '—'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-800 text-brand-400 text-xs font-bold rounded">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-sm max-w-md truncate">
                              {log.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'SETTINGS' && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">System Settings</h2>
                    <p className="text-slate-400">Configure application settings</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
                    {settings.map((setting) => (
                      <div key={setting.id} className="p-6 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white capitalize">
                            {setting.key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-slate-500">{setting.description}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          {setting.key === 'maintenance_mode' ? (
                            <button
                              onClick={() => handleUpdateSetting(setting.key, setting.value === 'true' ? 'false' : 'true')}
                              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                                setting.value === 'true'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                            </button>
                          ) : (
                            <input
                              type="text"
                              value={setting.value}
                              onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white w-48 text-right focus:border-brand-500 outline-none"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Change Password Section */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-brand-400" />
                      Change Password
                    </h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      {passwordMessage && (
                        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                          passwordMessage.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                          {passwordMessage.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <AlertCircle className="w-5 h-5" />
                          )}
                          {passwordMessage.text}
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">New Password</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                        </p>
                        <button
                          onClick={handleChangePassword}
                          disabled={passwordLoading}
                          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                        >
                          {passwordLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DATABASE TAB */}
              {activeTab === 'DATABASE' && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Database Management</h2>
                    <p className="text-slate-400">SQLite database administration</p>
                  </div>

                  {/* Database Stats */}
                  {dbStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {Object.entries(dbStats).map(([key, value]) => (
                        <div key={key} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-white">{value as number}</div>
                          <div className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Database Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-brand-500/10 rounded-xl">
                          <Upload className="w-6 h-6 text-brand-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Seed Mock Data</h3>
                          <p className="text-sm text-slate-500">Add sample data for testing</p>
                        </div>
                      </div>
                      <button
                        onClick={handleSeedDatabase}
                        className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors"
                      >
                        Seed Database
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                          <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Database Location</h3>
                          <p className="text-sm text-slate-500">SQLite file location</p>
                        </div>
                      </div>
                      <code className="block bg-slate-950 p-4 rounded-xl text-slate-400 text-sm font-mono break-all">
                        server/mindgear.db
                      </code>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <h3 className="font-bold text-emerald-400">Database Status: Connected</h3>
                    </div>
                    <p className="text-slate-400 text-sm">
                      The SQLite database is running and all tables are properly initialized.
                      Data is persisted to disk automatically.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Password</label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Role</label>
                <select
                  value={formData.role || 'STUDENT'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                >
                  <option value="STUDENT">Student</option>
                  <option value="BUSINESS">Business</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Organization</label>
                <input
                  type="text"
                  value={formData.organization || ''}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                />
              </div>
              {editingUser && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-950 border-slate-700"
                  />
                  <label className="text-slate-400">Active Account</label>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-4">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors"
              >
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Instructor</label>
                  <input
                    type="text"
                    value={formData.instructor || ''}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Price (NPR)</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Date</label>
                  <input
                    type="text"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Time</label>
                  <input
                    type="text"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Duration</label>
                  <input
                    type="text"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity || 100}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Image URL</label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags || ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  placeholder="React, AI, Cloud"
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-950 border-slate-700"
                  />
                  <span className="text-slate-400">Active</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_featured ?? false}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-950 border-slate-700"
                  />
                  <span className="text-slate-400">Featured</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-4">
              <button
                onClick={() => setShowCourseModal(false)}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors"
              >
                {editingCourse ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900">
              <h3 className="text-xl font-bold text-white">
                {editingTeamMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Role/Position *</label>
                <input
                  type="text"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  placeholder="Lead Developer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none resize-none"
                  placeholder="Short biography..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Photo *</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-950 hover:bg-slate-900 hover:border-brand-500 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="mb-1 text-sm text-slate-400">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size must be less than 5MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="relative">
                      <div className="rounded-xl overflow-hidden w-24 h-24 border border-slate-700">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedin || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Twitter URL</label>
                  <input
                    type="text"
                    value={formData.twitter || ''}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                    min="0"
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-950 border-slate-700"
                    />
                    <span className="text-slate-400">Active (visible on website)</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-4 sticky bottom-0 bg-slate-900">
              <button
                onClick={() => setShowTeamModal(false)}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeamMember}
                className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors"
              >
                {editingTeamMember ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900">
              <h3 className="text-xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Project Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  placeholder="Enterprise AI Platform"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Category *</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Enterprise AI">Enterprise AI</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Client Name</label>
                  <input
                    type="text"
                    value={formData.client || ''}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none resize-none"
                  placeholder="Brief description of the project..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Image URL</label>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  placeholder="https://..."
                />
                {formData.image && (
                  <div className="mt-2 rounded-xl overflow-hidden w-full h-32">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={formData.technologies || ''}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                  placeholder="React, Node.js, PostgreSQL, AWS"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none"
                    min="0"
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-950 border-slate-700"
                    />
                    <span className="text-slate-400">Active (visible on website)</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-4 sticky bottom-0 bg-slate-900">
              <button
                onClick={() => setShowProjectModal(false)}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors"
              >
                {editingProject ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
