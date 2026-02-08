import React, { useState } from 'react';
import { useCases } from '../../contexts/CasesContext';
import { Eye, AlertCircle, Clock, CheckCircle2, Settings } from 'lucide-react';

/**
 * Component to display cases from the Firestore real-time sync
 * Shows cases that belong to the citizen with live updates from court portal
 */
export const MyCasesRealTime = ({ citizenId }: { citizenId: string }) => {
  const { cases, loading, error } = useCases();
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAllCases, setShowAllCases] = useState(true); // Start with all cases visible

  // Filter cases related to this citizen (or show all if filter is off)
  const myCases = showAllCases 
    ? cases 
    : cases.filter(c => 
        c.respondent?.citizenPortalUserId === citizenId || 
        c.petitioner?.citizenPortalUserId === citizenId
      );

  const getStatusIcon = (status: string) => {
    const icons = {
      filed: <Clock className="w-5 h-5 text-blue-500" />,
      pending_evidence: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      under_trial: <Clock className="w-5 h-5 text-purple-500" />,
      adjourned: <AlertCircle className="w-5 h-5 text-orange-500" />,
      arguments_completed: <CheckCircle2 className="w-5 h-5 text-indigo-500" />,
      reserved_for_judgment: <Clock className="w-5 h-5 text-cyan-500" />,
      disposed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      dismissed: <AlertCircle className="w-5 h-5 text-red-500" />,
      withdrawn: <AlertCircle className="w-5 h-5 text-gray-500" />,
    };
    return icons[status as keyof typeof icons] || icons.filed;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      filed: 'Filed',
      pending_evidence: 'Pending Evidence',
      under_trial: 'Under Trial',
      adjourned: 'Adjourned',
      arguments_completed: 'Arguments Completed',
      reserved_for_judgment: 'Reserved for Judgment',
      disposed: 'Disposed',
      dismissed: 'Dismissed',
      withdrawn: 'Withdrawn',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        <span className="ml-2 text-slate-600">Loading your cases...</span>
      </div>
    );
  }

  // Show error if permission denied
  if (error && error.includes('permission')) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Permission Error</h3>
            <p className="text-red-800 text-sm mb-3">
              Unable to load your cases. This is usually due to incorrect Firestore security rules.
            </p>
            <div className="bg-red-100 rounded p-3 text-xs text-red-900 font-mono mb-3">
              {error}
            </div>
            <p className="text-red-800 text-sm mb-3">
              <strong>Fix:</strong> Check <code className="bg-red-100 px-2 py-1 rounded">FIRESTORE_RULES_FIX.md</code> for the correct security rules.
            </p>
            <button
              onClick={() => {
                const msg = `Firestore Error: ${error}. Check FIRESTORE_RULES_FIX.md for instructions.`;
                console.log(msg);
              }}
              className="text-red-700 hover:text-red-900 underline text-sm"
            >
              More details in browser console (F12)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (myCases.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">My Cases</h2>
          <button
            onClick={() => setShowAllCases(!showAllCases)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            {showAllCases ? 'Show My Cases Only' : 'Show All Cases'}
          </button>
        </div>
        
        <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No cases found{showAllCases ? ' in the system' : ' for you yet'}.</p>
          <p className="text-slate-500 text-sm mt-2">
            {showAllCases 
              ? 'Go to the Court Portal to initialize sample cases.' 
              : 'Your cases will appear here once they are filed in the court system.'}
          </p>
          {!showAllCases && (
            <button
              onClick={() => setShowAllCases(true)}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Show All Cases
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {showAllCases ? 'All Cases' : 'My Cases'} ({myCases.length})
        </h2>
        <button
          onClick={() => setShowAllCases(!showAllCases)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showAllCases ? 'Show My Cases Only' : 'Show All Cases'}
        </button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 font-semibold text-sm">Real-Time Updates</p>
          <p className="text-blue-700 text-xs mt-1">
            Cases shown here are updated in real-time. When the court updates case status, 
            you'll see the changes immediately without refreshing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{myCases.map(caseItem => (
          <div
            key={caseItem.id}
            onClick={() => setSelectedCase(caseItem)}
            className="bg-white rounded-lg border border-slate-200 hover:border-slate-400 p-4 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(caseItem.status)}
                  <span className="text-xs font-semibold text-slate-600 uppercase">
                    {getStatusLabel(caseItem.status)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{caseItem.caseTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Case #: {caseItem.caseNumber}</p>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Filed Date:</span>
                <span className="font-medium text-slate-900">
                  {caseItem.filingDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Next Hearing:</span>
                <span className="font-medium text-slate-900">
                  {caseItem.nextHearingDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Court:</span>
                <span className="font-medium text-slate-900">{caseItem.courtName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Judge:</span>
                <span className="font-medium text-slate-900">{caseItem.judgeName}</span>
              </div>
            </div>

            {/* Last Modified Info */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Last updated by <span className="font-semibold text-slate-700">{caseItem.lastModifiedByName || 'System'}</span>
              </p>
              <p className="text-xs text-slate-500">
                {caseItem.updatedAt.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedCase.caseTitle}</h2>
                <p className="text-slate-600 text-sm mt-1">Case #{selectedCase.caseNumber}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedCase.status)}
                    <p className="font-semibold text-slate-900">
                      {getStatusLabel(selectedCase.status)}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Priority</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedCase.priority}</p>
                </div>
              </div>

              {/* Important Dates */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Important Dates</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between bg-slate-50 p-2 rounded">
                    <span className="text-slate-600">Filing Date:</span>
                    <span className="font-medium">{selectedCase.filingDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-2 rounded">
                    <span className="text-slate-600">Next Hearing:</span>
                    <span className="font-medium">{selectedCase.nextHearingDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 p-2 rounded">
                    <span className="text-slate-600">Last Hearing:</span>
                    <span className="font-medium">{selectedCase.lastHearingDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Case Details</h3>
                <p className="text-slate-700 text-sm mb-4">{selectedCase.synopsis}</p>
              </div>

              {/* Hearings */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Total Hearings</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedCase.totalHearings}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-green-600 font-semibold uppercase mb-2">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{selectedCase.completedHearings}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-orange-600 font-semibold uppercase mb-2">Adjournments</p>
                  <p className="text-2xl font-bold text-orange-900">{selectedCase.adjournmentCount}</p>
                </div>
              </div>

              {/* Court & Judge Info */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Court Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Court:</span>
                    <span className="font-medium text-slate-900">{selectedCase.courtName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Judge:</span>
                    <span className="font-medium text-slate-900">{selectedCase.judgeName}</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Update Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-700 font-semibold mb-2">Last Updated</p>
                <p className="text-sm text-green-800">
                  {selectedCase.lastModifiedByName || 'System'} on {selectedCase.updatedAt.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Real-time sync enabled - updates appear automatically
                </p>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCasesRealTime;
