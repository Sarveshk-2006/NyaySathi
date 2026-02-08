import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, PieChart, Calendar,
  CheckCircle2, XCircle, Clock, Filter, Download, Award
} from 'lucide-react';
import { HearingSuccessMetrics, CaseCategory } from '../../../types/court';
import { useCourtAuth } from '../../../contexts/CourtAuthContext';
import { PERMISSIONS } from '../../../types/court';

const HearingSuccessRate = () => {
  const { hasPermission, courtUser } = useCourtAuth();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [metrics, setMetrics] = useState<HearingSuccessMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    if (!hasPermission(PERMISSIONS.ANALYTICS_VIEW)) {
      return;
    }

    setLoading(true);

    // Mock data - Replace with actual API call
    const mockMetrics: HearingSuccessMetrics = {
      judgeId: courtUser?.uid || '',
      judgeName: courtUser?.name || '',
      period,
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 31),
      totalHearings: 145,
      successfulHearings: 98,
      adjournedHearings: 47,
      disposedCases: 32,
      successRate: 67.59,
      averageHearingsPerCase: 4.5,
      averageDisposalTime: 89,
      categoriesBreakdown: [
        { category: 'criminal', total: 45, successful: 32, successRate: 71.11 },
        { category: 'civil', total: 38, successful: 28, successRate: 73.68 },
        { category: 'family', total: 32, successful: 20, successRate: 62.50 },
        { category: 'consumer', total: 15, successful: 10, successRate: 66.67 },
        { category: 'labor', total: 10, successful: 6, successRate: 60.00 },
        { category: 'other', total: 5, successful: 2, successRate: 40.00 },
      ] as any,
      comparisonWithPrevious: {
        period: 'December 2025',
        successRate: 63.24,
        percentageChange: 6.88,
      },
      calculatedAt: new Date(),
    };

    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 500);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      criminal: 'bg-red-500',
      civil: 'bg-blue-500',
      family: 'bg-purple-500',
      consumer: 'bg-green-500',
      labor: 'bg-orange-500',
      constitutional: 'bg-indigo-500',
      tax: 'bg-yellow-500',
      other: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 45) return 'text-orange-600';
    return 'text-red-600';
  };

  const downloadReport = () => {
    if (!metrics) return;

    const report = `
HEARING SUCCESS RATE REPORT
${metrics.judgeName}
${metrics.period.toUpperCase()} REPORT
${metrics.startDate.toLocaleDateString()} - ${metrics.endDate.toLocaleDateString()}

OVERALL METRICS
- Total Hearings: ${metrics.totalHearings}
- Successful Hearings: ${metrics.successfulHearings}
- Adjourned Hearings: ${metrics.adjournedHearings}
- Success Rate: ${metrics.successRate.toFixed(2)}%
- Disposed Cases: ${metrics.disposedCases}
- Average Hearings per Case: ${metrics.averageHearingsPerCase}
- Average Disposal Time: ${metrics.averageDisposalTime} days

CATEGORY BREAKDOWN
${metrics.categoriesBreakdown.map(cat => `
${cat.category.toUpperCase()}
  Total: ${cat.total}
  Successful: ${cat.successful}
  Success Rate: ${cat.successRate.toFixed(2)}%
`).join('')}

COMPARISON WITH PREVIOUS PERIOD
Previous Period: ${metrics.comparisonWithPrevious?.period}
Previous Success Rate: ${metrics.comparisonWithPrevious?.successRate.toFixed(2)}%
Change: ${metrics.comparisonWithPrevious?.percentageChange > 0 ? '+' : ''}${metrics.comparisonWithPrevious?.percentageChange.toFixed(2)}%

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hearing-success-report-${period}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission(PERMISSIONS.ANALYTICS_VIEW)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-4xl font-serif font-bold text-white">Hearing Success Rate</h1>
              <p className="text-slate-200 mt-2 font-medium">Performance analytics and insights</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 animate-slide-up delay-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Reporting Period</h3>
            <div className="flex items-center gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold bg-slate-50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              {hasPermission(PERMISSIONS.REPORTS_GENERATE) && (
                <button
                  onClick={downloadReport}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-lg shadow-slate-900/30 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100 animate-slide-up delay-200">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading analytics...</p>
          </div>
        ) : metrics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up delay-200">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  {metrics.comparisonWithPrevious && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      metrics.comparisonWithPrevious.percentageChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.comparisonWithPrevious.percentageChange > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(metrics.comparisonWithPrevious.percentageChange).toFixed(1)}%
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Success Rate</p>
                <p className={`text-3xl font-bold ${getSuccessRateColor(metrics.successRate)}`}>
                  {metrics.successRate.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {metrics.successfulHearings} of {metrics.totalHearings} hearings
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Disposed Cases</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.disposedCases}</p>
                <p className="text-xs text-slate-500 mt-2">Cases concluded</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Avg. Disposal Time</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.averageDisposalTime}</p>
                <p className="text-xs text-slate-500 mt-2">days</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Avg. Hearings/Case</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.averageHearingsPerCase}</p>
                <p className="text-xs text-slate-500 mt-2">hearings</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up delay-300">
              {/* Success vs Adjourned */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Hearing Outcomes</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-slate-700">Successful</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{metrics.successfulHearings}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${(metrics.successfulHearings / metrics.totalHearings) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {((metrics.successfulHearings / metrics.totalHearings) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-semibold text-slate-700">Adjourned</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{metrics.adjournedHearings}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(metrics.adjournedHearings / metrics.totalHearings) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {((metrics.adjournedHearings / metrics.totalHearings) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">Total Hearings</span>
                      <span className="font-bold text-slate-900 text-lg">{metrics.totalHearings}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Success Rate by Category</h3>
                <div className="space-y-3">
                  {metrics.categoriesBreakdown
                    .sort((a, b) => b.successRate - a.successRate)
                    .map((cat) => (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${getCategoryColor(cat.category)} rounded-full`}></div>
                            <span className="text-sm font-semibold text-slate-700 capitalize">
                              {cat.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                              {cat.successful}/{cat.total}
                            </span>
                            <span className={`text-sm font-bold ${getSuccessRateColor(cat.successRate)}`}>
                              {cat.successRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getCategoryColor(cat.category)} rounded-full transition-all`}
                            style={{ width: `${cat.successRate}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Comparison Card */}
            {metrics.comparisonWithPrevious && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all animate-slide-up delay-400">
                <h3 className="text-lg font-serif font-bold text-slate-900 mb-4">Period Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Previous Period</p>
                    <p className="text-xl font-bold text-slate-900">{metrics.comparisonWithPrevious.period}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Previous Success Rate</p>
                    <p className="text-xl font-bold text-slate-900">
                      {metrics.comparisonWithPrevious.successRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Change</p>
                    <div className={`flex items-center gap-2 text-xl font-bold ${
                      metrics.comparisonWithPrevious.percentageChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.comparisonWithPrevious.percentageChange > 0 ? (
                        <TrendingUp className="w-6 h-6" />
                      ) : (
                        <TrendingDown className="w-6 h-6" />
                      )}
                      {metrics.comparisonWithPrevious.percentageChange > 0 ? '+' : ''}
                      {metrics.comparisonWithPrevious.percentageChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100 animate-slide-up delay-200">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HearingSuccessRate;
