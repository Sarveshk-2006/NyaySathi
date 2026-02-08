import React, { useState, useEffect } from 'react';
import {
  Calendar, FileText, Clock, CheckCircle2, AlertCircle, Users,
  TrendingUp, Bell, Search, Filter, ChevronRight, Gavel, BarChart3,
  Mic, Download, Eye, Edit, Plus, Award, Target
} from 'lucide-react';
import { Case, Hearing, Notice, CourtCalendar } from '../../../types/court';
import { useCourtAuth } from '../../../contexts/CourtAuthContext';
import { PERMISSIONS } from '../../../types/court';
import CaseStatusTracking from './CaseStatusTracking';
import NoticeGenerator from './NoticeGenerator';
import HearingSuccessRate from './HearingSuccessRate';

const JudgeDashboard = () => {
  const { courtUser, hasPermission } = useCourtAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'notices' | 'analytics'>('dashboard');
  const [todayCases, setTodayCases] = useState<Hearing[]>([]);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [pendingNotices, setPendingNotices] = useState<Notice[]>([]);
  const [statistics, setStatistics] = useState({
    totalCases: 0,
    pendingCases: 0,
    disposedToday: 0,
    hearingsToday: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    // Mock data - Replace with actual API calls
    const mockTodayCases: Hearing[] = [
      {
        id: '1',
        caseId: 'case-1',
        caseNumber: 'CC-DLI-12345/2026',
        caseTitle: 'State vs Rajesh Kumar',
        hearingDate: new Date(),
        hearingTime: '10:30 AM',
        courtRoomNumber: '1',
        judgeId: courtUser?.uid || '',
        judgeName: courtUser?.name || '',
        partiesPresent: [],
        lawyersPresent: [],
        purpose: 'Arguments',
        notes: '',
        outcome: 'completed',
        isSuccessful: true,
        documentsSubmitted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: courtUser?.uid || '',
      },
      {
        id: '2',
        caseId: 'case-2',
        caseNumber: 'CV-DLI-45678/2026',
        caseTitle: 'Ram Sharma vs XYZ Builder Ltd',
        hearingDate: new Date(),
        hearingTime: '11:30 AM',
        courtRoomNumber: '1',
        judgeId: courtUser?.uid || '',
        judgeName: courtUser?.name || '',
        partiesPresent: [],
        lawyersPresent: [],
        purpose: 'Evidence',
        notes: '',
        outcome: 'completed',
        isSuccessful: true,
        documentsSubmitted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: courtUser?.uid || '',
      },
      {
        id: '3',
        caseId: 'case-3',
        caseNumber: 'FM-DLI-99001/2026',
        caseTitle: 'Priya Gupta vs Amit Gupta',
        hearingDate: new Date(),
        hearingTime: '02:00 PM',
        courtRoomNumber: '1',
        judgeId: courtUser?.uid || '',
        judgeName: courtUser?.name || '',
        partiesPresent: [],
        lawyersPresent: [],
        purpose: 'Final Hearing',
        notes: '',
        outcome: 'completed',
        isSuccessful: true,
        documentsSubmitted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: courtUser?.uid || '',
      },
    ];

    setTodayCases(mockTodayCases);
    setStatistics({
      totalCases: 87,
      pendingCases: 45,
      disposedToday: 2,
      hearingsToday: mockTodayCases.length,
      successRate: 67.5,
    });

    setLoading(false);
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="animate-slide-up">
            <h1 className="text-4xl font-serif font-bold mb-2">
              Welcome back, {courtUser?.name}
            </h1>
            <p className="text-slate-200 text-lg font-medium">
              {courtUser?.designation} • {courtUser?.courtName}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg animate-slide-up delay-100">
            <Gavel className="w-16 h-16 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 animate-slide-up delay-100">
        {[
          {
            label: 'Total Cases',
            value: statistics.totalCases,
            icon: FileText,
            color: 'bg-slate-900',
            trend: '+5 this month',
          },
          {
            label: 'Pending Cases',
            value: statistics.pendingCases,
            icon: Clock,
            color: 'bg-amber-600',
            trend: '52% of total',
          },
          {
            label: 'Disposed Today',
            value: statistics.disposedToday,
            icon: CheckCircle2,
            color: 'bg-green-600',
            trend: 'On track',
          },
          {
            label: 'Hearings Today',
            value: statistics.hearingsToday,
            icon: Calendar,
            color: 'bg-purple-500',
            trend: `${statistics.hearingsToday} scheduled`,
          },
          {
            label: 'Success Rate',
            value: `${statistics.successRate}%`,
            icon: TrendingUp,
            color: 'bg-cyan-500',
            trend: '+4.2% from last month',
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 animate-slide-up" style={{ animationDelay: `${(idx + 2) * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl shadow-md`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-semibold mb-1 uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mb-2 font-serif">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-slide-up delay-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900/5 rounded-xl">
              <Calendar className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-serif">Today's Hearings</h2>
              <p className="text-sm text-slate-600 font-medium">{statistics.hearingsToday} cases scheduled</p>
            </div>
          </div>
          <button className="px-5 py-2.5 text-sm text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-md">
            View Full Calendar
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-900 mx-auto"></div>
            <p className="text-slate-500 mt-4 font-medium">Loading hearings...</p>
          </div>
        ) : todayCases.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No hearings scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayCases.map((hearing, idx) => (
              <div
                key={hearing.id}
                className="border-2 border-slate-200 rounded-2xl p-5 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 cursor-pointer hover:shadow-md animate-slide-up"
                style={{ animationDelay: `${(idx + 4) * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-[80px] bg-slate-900 text-white rounded-xl p-3">
                      <p className="text-xl font-bold">{hearing.hearingTime}</p>
                      <p className="text-xs opacity-80">Room {hearing.courtRoomNumber}</p>
                    </div>
                    <div className="h-12 w-px bg-slate-200"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-slate-700">
                          {hearing.caseNumber}
                        </span>
                        <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-sm">
                          {hearing.purpose}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">{hearing.caseTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasPermission(PERMISSIONS.HEARING_VIEW) && (
                      <button className="p-2.5 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    {hasPermission(PERMISSIONS.HEARING_RECORD) && (
                      <button className="p-2.5 text-slate-600 hover:bg-amber-500 hover:text-white rounded-xl transition-all">
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-slide-up delay-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-slate-900/5 rounded-xl">
              <Bell className="w-6 h-6 text-slate-900" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                action: 'Notice issued',
                case: 'CC-DLI-12345/2026',
                time: '30 minutes ago',
                icon: FileText,
                color: 'text-blue-600',
              },
              {
                action: 'Order passed',
                case: 'CV-DLI-45678/2026',
                time: '2 hours ago',
                icon: CheckCircle2,
                color: 'text-green-600',
              },
              {
                action: 'Hearing completed',
                case: 'FM-DLI-99001/2026',
                time: '4 hours ago',
                icon: Gavel,
                color: 'text-purple-600',
              },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 pb-4 border-b border-slate-200 last:border-0 last:pb-0 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-xl transition-all">
                <div className="p-2 bg-slate-900/5 rounded-lg">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-600 font-medium">Case: {activity.case}</p>
                </div>
                <p className="text-xs text-slate-500 font-medium">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-slide-up delay-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-slate-900/5 rounded-xl">
              <Target className="w-6 h-6 text-slate-900" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Create Notice', icon: FileText, onClick: () => setActiveTab('notices'), color: 'hover:border-amber-500 hover:bg-amber-50' },
              { label: 'Schedule Hearing', icon: Calendar, onClick: () => {}, color: 'hover:border-slate-900 hover:bg-slate-50' },
              { label: 'View Analytics', icon: BarChart3, onClick: () => setActiveTab('analytics'), color: 'hover:border-slate-900 hover:bg-slate-50' },
              { label: 'Record Order', icon: Mic, onClick: () => {}, color: 'hover:border-amber-500 hover:bg-amber-50' },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`p-5 border-2 border-slate-200 rounded-2xl ${action.color} transition-all duration-300 text-left group hover:shadow-lg hover:-translate-y-1`}
              >
                <action.icon className="w-7 h-7 text-slate-400 group-hover:text-slate-900 mb-3 transition-colors" />
                <p className="text-sm font-bold text-slate-900">{action.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'cases', label: 'Case Management', icon: FileText },
              { id: 'notices', label: 'Notice Generator', icon: Bell },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-4 ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'cases' && <CaseStatusTracking />}
        {activeTab === 'notices' && <NoticeGenerator />}
        {activeTab === 'analytics' && <HearingSuccessRate />}
      </div>
    </div>
  );
};

export default JudgeDashboard;
