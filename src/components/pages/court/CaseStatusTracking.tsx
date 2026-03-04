import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, AlertCircle, FileText, Gavel, XCircle,
  Calendar, Users, FileCheck, ArrowRight, Filter, Search,
  Download, Eye, Edit, Plus, Trash2, Save, MessageSquare, Bell, Activity
} from 'lucide-react';
import { Case, CaseStatus, CasePriority, CaseCategory } from '../../../types/court';
import { useCourtAuth } from '../../../contexts/CourtAuthContext';
import { PERMISSIONS } from '../../../types/court';
import { subscribeToRealTimeCases, updateCaseStatus, updateCaseField } from '../../../services/casesService';
import { initializeFirestoreWithMockCases } from '../../../data/mockCases';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

const CaseStatusTracking = () => {
  const { hasPermission, courtUser } = useCourtAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<CasePriority | 'all'>('all');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    nextHearingDate: '',
    judgeNotes: '',
  });

  // Debug: Log court user on mount
  useEffect(() => {
    console.log('=== COURT PORTAL DEBUG ===');
    console.log('Court User:', courtUser);
    console.log('User ID:', courtUser?.uid);
    console.log('User Email:', courtUser?.email);
    console.log('========================');
  }, [courtUser]);

  // Subscribe to real-time cases from Firestore
  useEffect(() => {
    if (!courtUser?.uid) {
      console.log('Court user not logged in yet, waiting...');
      return;
    }

    console.log('Court user authenticated:', courtUser.uid, courtUser.email);
    setLoading(true);
    setCasesError(null);

    // Subscribe to real-time case updates
    const unsub = subscribeToRealTimeCases(
      (updatedCases) => {
        console.log('Cases loaded successfully:', updatedCases.length);
        setCases(updatedCases);
        setLoading(false);
      },
      [],
      (error) => {
        console.error('Firestore error:', error);
        if (error?.code === 'permission-denied') {
          setCasesError('Permission denied. Please update Firestore rules and confirm you are logged in.');
        } else {
          setCasesError('Failed to load cases. Please try again.');
        }
        setLoading(false);
      }
    );

    setUnsubscribe(() => unsub);

    // Cleanup subscription on unmount
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [courtUser?.uid]);

  const getStatusConfig = (status: CaseStatus) => {
    const configs = {
      filed: { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Filed' },
      pending_evidence: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Evidence' },
      under_trial: { color: 'bg-purple-100 text-purple-800', icon: Gavel, label: 'Under Trial' },
      adjourned: { color: 'bg-orange-100 text-orange-800', icon: Calendar, label: 'Adjourned' },
      arguments_completed: { color: 'bg-indigo-100 text-indigo-800', icon: Users, label: 'Arguments Completed' },
      reserved_for_judgment: { color: 'bg-cyan-100 text-cyan-800', icon: FileCheck, label: 'Reserved for Judgment' },
      disposed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Disposed' },
      dismissed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Dismissed' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Withdrawn' },
    };
    return configs[status];
  };

  const getPriorityConfig = (priority: CasePriority) => {
    const configs = {
      urgent: { color: 'bg-red-500', label: 'Urgent' },
      high: { color: 'bg-orange-500', label: 'High' },
      normal: { color: 'bg-blue-500', label: 'Normal' },
      low: { color: 'bg-gray-500', label: 'Low' },
    };
    return configs[priority];
  };

  const handleInitializeCases = async () => {
    if (!hasPermission(PERMISSIONS.CASE_CREATE)) {
      alert('You do not have permission to initialize cases');
      return;
    }

    try {
      setSeedError(null);
      setSeeding(true);
      await initializeFirestoreWithMockCases(
        courtUser?.uid || 'admin',
        courtUser?.name || 'System Admin'
      );
    } catch (error) {
      setSeedError('Failed to initialize sample cases. Please check Firestore permissions.');
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdateCaseStatus = async (caseId: string, newStatus: CaseStatus) => {
    if (!hasPermission(PERMISSIONS.CASE_EDIT)) {
      alert('You do not have permission to edit case status');
      return;
    }

    try {
      // Update case status in Firestore - this will automatically trigger real-time updates
      await updateCaseStatus(caseId, newStatus, courtUser?.uid || '', courtUser?.name || '');
      
      // Add activity log
      await addCaseActivity(caseId, {
        action: 'Status Updated',
        description: `Case status changed to ${newStatus}`,
        performedBy: courtUser?.name || 'Judge',
        performedById: courtUser?.uid || '',
      });
      
      setShowStatusModal(false);
      setSelectedCase(null);
    } catch (error) {
      console.error('Error updating case:', error);
      alert('Failed to update case status. Please try again.');
    }
  };
  
  const handleUpdateCase = async () => {
    if (!selectedCase || !hasPermission(PERMISSIONS.CASE_EDIT)) {
      return;
    }

    try {
      const caseRef = doc(db, 'cases', selectedCase.id);
      const updates: any = {
        lastModifiedBy: courtUser?.uid,
        lastModifiedByName: courtUser?.name,
        updatedAt: serverTimestamp(),
      };

      // Update status if changed
      if (editForm.status && editForm.status !== selectedCase.status) {
        updates.status = editForm.status;
        await addCaseActivity(selectedCase.id, {
          action: 'Status Updated',
          description: `Status changed to ${editForm.status}`,
          performedBy: courtUser?.name || 'Judge',
          performedById: courtUser?.uid || '',
        });
      }

      // Update next hearing date if changed
      if (editForm.nextHearingDate) {
        updates.nextHearingDate = new Date(editForm.nextHearingDate);
        await addCaseActivity(selectedCase.id, {
          action: 'Hearing Scheduled',
          description: `Next hearing set for ${new Date(editForm.nextHearingDate).toLocaleDateString()}`,
          performedBy: courtUser?.name || 'Judge',
          performedById: courtUser?.uid || '',
        });
      }

      // Add judge notes if provided
      if (editForm.judgeNotes.trim()) {
        await addCaseActivity(selectedCase.id, {
          action: 'Note Added',
          description: editForm.judgeNotes,
          performedBy: courtUser?.name || 'Judge',
          performedById: courtUser?.uid || '',
        });
      }

      await updateDoc(caseRef, updates);

      setShowEditModal(false);
      setSelectedCase(null);
      setEditForm({ status: '', nextHearingDate: '', judgeNotes: '' });
    } catch (error) {
      console.error('Error updating case:', error);
      alert('Failed to update case. Please try again.');
    }
  };
  
  const addCaseActivity = async (caseId: string, activity: {
    action: string;
    description: string;
    performedBy: string;
    performedById: string;
  }) => {
    try {
      const caseRef = doc(db, 'cases', caseId);
      await updateDoc(caseRef, {
        activities: arrayUnion({
          ...activity,
          timestamp: new Date(),
          id: `activity-${Date.now()}`,
        }),
      });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusOptions: CaseStatus[] = [
    'filed', 'pending_evidence', 'under_trial', 'adjourned',
    'arguments_completed', 'reserved_for_judgment', 'disposed', 'dismissed', 'withdrawn'
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-3xl shadow-xl p-8 mb-6 text-white relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h1 className="text-4xl font-serif font-bold text-white">Case Status Tracking</h1>
              <p className="text-slate-200 mt-2 font-medium">Monitor and update case progress in real-time</p>
            </div>
            {hasPermission(PERMISSIONS.CASE_CREATE) && (
              <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Case
              </button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by case number or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-white/30 bg-white/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-slate-900 font-medium placeholder-slate-600 transition-all"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CaseStatus | 'all')}
              className="px-4 py-3 border-2 border-white/30 bg-white/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-medium text-slate-900"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{getStatusConfig(status).label}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as CasePriority | 'all')}
              className="px-4 py-3 border-2 border-white/30 bg-white/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-medium text-slate-900"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {casesError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-red-800 font-bold text-lg mb-2">Firebase Permission Error</h3>
                <p className="text-red-700 mb-4">{casesError}</p>
                
                <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                  <h4 className="font-semibold text-slate-900 mb-2">Diagnostic Info:</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-700">
                      ✓ Logged in as: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{courtUser?.email || 'Unknown'}</span>
                    </p>
                    <p className="text-slate-700">
                      ✓ User ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{courtUser?.uid || 'None'}</span>
                    </p>
                    <p className="text-red-700 font-semibold">
                      ✗ Firestore Permission: <span className="bg-red-100 px-2 py-0.5 rounded">DENIED</span>
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">🔧 How to Fix:</h4>
                  <ol className="list-decimal list-inside text-sm text-amber-800 space-y-2">
                    <li>Open <a href="https://console.firebase.google.com" target="_blank" className="underline font-semibold">Firebase Console</a></li>
                    <li>Go to <strong>Firestore Database → Rules</strong></li>
                    <li>Replace ALL rules with this:</li>
                  </ol>
                  <pre className="mt-3 bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}`}
                  </pre>
                  <p className="text-amber-800 text-sm mt-3">
                    4. Click <strong className="bg-amber-200 px-2 py-0.5 rounded">PUBLISH</strong>
                  </p>
                  <p className="text-amber-800 text-sm mt-2">
                    5. Wait 30 seconds, then <strong>refresh this page</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Cases', value: cases.length, color: 'bg-slate-900', icon: FileText },
            { label: 'Under Trial', value: cases.filter(c => c.status === 'under_trial').length, color: 'bg-amber-600', icon: Gavel },
            { label: 'Adjourned', value: cases.filter(c => c.status === 'adjourned').length, color: 'bg-orange-600', icon: Calendar },
            { label: 'Disposed', value: cases.filter(c => c.status === 'disposed').length, color: 'bg-green-600', icon: CheckCircle2 },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 animate-slide-up" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">{stat.label}</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2 font-serif">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-md`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cases List */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-slide-up delay-300">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 mx-auto"></div>
              <p className="text-slate-600 mt-4 font-medium">Loading cases...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-16 text-center bg-slate-50">
              <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">No cases found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or initialize sample cases</p>
              {seedError && (
                <p className="text-red-600 text-sm mt-3 font-medium">{seedError}</p>
              )}
              {hasPermission(PERMISSIONS.CASE_CREATE) && (
                <button
                  onClick={handleInitializeCases}
                  disabled={seeding}
                  className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all shadow-lg disabled:opacity-60"
                >
                  {seeding ? 'Initializing Cases...' : 'Initialize Sample Cases'}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Case Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Next Hearing</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Progress</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCases.map((caseItem) => {
                    const statusConfig = getStatusConfig(caseItem.status);
                    const priorityConfig = getPriorityConfig(caseItem.priority);
                    const StatusIcon = statusConfig.icon;
                    const progress = (caseItem.completedHearings / caseItem.totalHearings) * 100;

                    return (
                      <tr key={caseItem.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {caseItem.isConfidential && (
                              <div className="w-2 h-2 bg-red-500 rounded-full" title="Confidential"></div>
                            )}
                            <span className="font-mono text-sm font-medium text-slate-900">
                              {caseItem.caseNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{caseItem.caseTitle}</p>
                            <p className="text-sm text-slate-500">{caseItem.caseType}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`w-3 h-3 ${priorityConfig.color} rounded-full`} title={priorityConfig.label}></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {caseItem.nextHearingDate?.toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-24">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-semibold text-slate-900">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-900 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {hasPermission(PERMISSIONS.CASE_VIEW) && (
                              <button
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            )}
                            {hasPermission(PERMISSIONS.CASE_EDIT) && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedCase(caseItem);
                                    setEditForm({
                                      status: caseItem.status,
                                      nextHearingDate: caseItem.nextHearingDate?.toISOString().split('T')[0] || '',
                                      judgeNotes: '',
                                    });
                                    setShowEditModal(true);
                                  }}
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Edit Case"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCase(caseItem);
                                    setShowStatusModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Quick Status Update"
                                >
                                  <Activity className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showStatusModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Update Case Status</h3>
            <p className="text-slate-600 mb-6">
              Case: <span className="font-mono font-semibold">{selectedCase.caseNumber}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {statusOptions.map((status) => {
                const config = getStatusConfig(status);
                const Icon = config.icon;
                const isSelected = selectedCase.status === status;

                return (
                  <button
                    key={status}
                    onClick={() => handleUpdateCaseStatus(selectedCase.id, status)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                      <span className={`font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                        {config.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedCase(null);
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Edit Modal */}
      {showEditModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Update Case</h3>
                <p className="text-slate-600 mt-1">
                  Case: <span className="font-mono font-semibold">{selectedCase.caseNumber}</span>
                </p>
                <p className="text-slate-700 font-medium">{selectedCase.caseTitle}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-semibold">Real-Time Sync</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Current Case Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Current Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Current Status</p>
                    <p className="font-bold text-slate-900">{getStatusConfig(selectedCase.status).label}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Next Hearing</p>
                    <p className="font-bold text-slate-900">
                      {selectedCase.nextHearingDate?.toLocaleDateString() || 'Not Set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Last Updated By</p>
                    <p className="font-bold text-slate-900">{selectedCase.lastModifiedByName || 'System'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Last Update</p>
                    <p className="font-bold text-slate-900">{selectedCase.updatedAt?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Update Case Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none font-medium text-slate-900 transition-all"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {getStatusConfig(status).label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Next Hearing Date
                  </label>
                  <input
                    type="date"
                    value={editForm.nextHearingDate}
                    onChange={(e) => setEditForm({ ...editForm, nextHearingDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none font-medium text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Add Note/Update for Citizen
                  </label>
                  <textarea
                    value={editForm.judgeNotes}
                    onChange={(e) => setEditForm({ ...editForm, judgeNotes: e.target.value })}
                    placeholder="Add notes about this case update. This will be visible to the citizen..."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none font-medium text-slate-900 transition-all resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    <Bell className="w-3 h-3 inline mr-1" />
                    Citizens will see this update in real-time on their portal
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 font-semibold text-sm mb-1">Real-Time Updates</p>
                    <p className="text-blue-700 text-xs">
                      All changes made here will be immediately visible to the citizen on their portal. 
                      They'll see your updates without needing to refresh the page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={handleUpdateCase}
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save & Notify Citizen
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCase(null);
                    setEditForm({ status: '', nextHearingDate: '', judgeNotes: '' });
                  }}
                  className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStatusTracking;
