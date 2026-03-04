import React, { useState, useEffect } from 'react';
import {
  Calendar, FileText, Clock, CheckCircle2, AlertCircle, Users,
  TrendingUp, Bell, Search, Filter, ChevronRight, Gavel, BarChart3,
  Mic, Download, Eye, Edit, Plus, Award, Target, X, Save, ChevronLeft, Database
} from 'lucide-react';
import { Case, Hearing, Notice, CourtCalendar } from '../../../types/court';
import { useCourtAuth } from '../../../contexts/CourtAuthContext';
import { PERMISSIONS } from '../../../types/court';
import CaseStatusTracking from './CaseStatusTracking';
import NoticeGenerator from './NoticeGenerator';
import HearingSuccessRate from './HearingSuccessRate';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { initializeSampleData } from '../../../utils/sampleCourtData';

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [showScheduleHearing, setShowScheduleHearing] = useState(false);
  const [showRecordOrder, setShowRecordOrder] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time listeners
    const unsubscribers: (() => void)[] = [];
    
    if (courtUser?.uid) {
      // Listen to cases assigned to this judge
      const casesQuery = query(
        collection(db, 'cases'),
        where('judgeId', '==', courtUser.uid)
      );
      
      const unsubCases = onSnapshot(casesQuery, (snapshot) => {
        const cases: Case[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          cases.push({
            ...data,
            id: doc.id,
            filingDate: data.filingDate?.toDate?.() || new Date(data.filingDate),
            nextHearingDate: data.nextHearingDate?.toDate?.() || new Date(data.nextHearingDate),
            lastHearingDate: data.lastHearingDate?.toDate?.() || new Date(data.lastHearingDate),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          } as Case);
        });
        setRecentCases(cases);
        
        // Update statistics
        const pending = cases.filter(c => 
          c.status === 'filed' || 
          c.status === 'pending_evidence' || 
          c.status === 'under_trial' ||
          c.status === 'adjourned' ||
          c.status === 'arguments_completed' ||
          c.status === 'reserved_for_judgment'
        ).length;
        
        setStatistics(prev => ({
          ...prev,
          totalCases: cases.length,
          pendingCases: pending,
        }));
      }, (error) => {
        console.error('Error fetching cases:', error);
      });
      
      unsubscribers.push(unsubCases);
      
      // Listen to hearings for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const hearingsQuery = query(
        collection(db, 'hearings'),
        where('judgeId', '==', courtUser.uid),
        where('hearingDate', '>=', Timestamp.fromDate(today)),
        where('hearingDate', '<', Timestamp.fromDate(tomorrow))
      );
      
      const unsubHearings = onSnapshot(hearingsQuery, (snapshot) => {
        const hearings: Hearing[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          hearings.push({
            ...data,
            id: doc.id,
            hearingDate: data.hearingDate?.toDate?.() || new Date(data.hearingDate),
            nextHearingDate: data.nextHearingDate?.toDate?.() || new Date(data.nextHearingDate),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          } as Hearing);
        });

        const effectiveHearings = hearings.length > 0
          ? hearings
          : buildDemoHearings(courtUser?.uid, courtUser?.name).filter(h => {
              return h.hearingDate >= today && h.hearingDate < tomorrow;
            });

        // Sort by time
        effectiveHearings.sort((a, b) => a.hearingTime.localeCompare(b.hearingTime));
        setTodayCases(effectiveHearings);

        const completed = effectiveHearings.filter(h => h.outcome === 'disposed').length;
        setStatistics(prev => ({
          ...prev,
          hearingsToday: effectiveHearings.length,
          disposedToday: completed,
          successRate: effectiveHearings.length > 0 ? (effectiveHearings.filter(h => h.isSuccessful).length / effectiveHearings.length) * 100 : 0,
        }));
      }, (error) => {
        console.error('Error fetching hearings:', error);
      });
      
      unsubscribers.push(unsubHearings);
      
      // Listen to notices
      const noticesQuery = query(
        collection(db, 'notices'),
        where('issuedBy', '==', courtUser.uid),
        where('deliveryStatus', '==', 'pending')
      );
      
      const unsubNotices = onSnapshot(noticesQuery, (snapshot) => {
        const notices: Notice[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notices.push({
            ...data,
            id: doc.id,
            issuedDate: data.issuedDate?.toDate?.() || new Date(data.issuedDate),
            hearingDate: data.hearingDate?.toDate?.() || new Date(data.hearingDate),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          } as Notice);
        });
        setPendingNotices(notices);
      }, (error) => {
        console.error('Error fetching notices:', error);
      });
      
      unsubscribers.push(unsubNotices);
    }
    
    setLoading(false);
    
    // Cleanup function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [courtUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    // Real-time listeners handle data loading
    setLoading(false);
  };

  const buildDemoHearings = (judgeId?: string, judgeName?: string) => {
    const safeJudgeId = judgeId || 'demo-judge';
    const safeJudgeName = judgeName || 'Hon. Judge (Demo)';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const withDayOffset = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date;
    };

    return [
      {
        id: 'demo-hearing-1',
        caseId: 'demo-case-1',
        caseNumber: 'CC-DLI-12345/2026',
        caseTitle: 'State of Delhi vs Rajesh Kumar',
        hearingDate: withDayOffset(0),
        hearingTime: '10:30 AM',
        courtRoomNumber: '3',
        judgeId: safeJudgeId,
        judgeName: safeJudgeName,
        partiesPresent: ['State Counsel', 'Defendant'],
        lawyersPresent: ['Adv. Priya Sharma', 'Adv. Anil Verma'],
        purpose: 'Evidence',
        notes: 'Prosecution to present documentary evidence',
        outcome: 'completed',
        isSuccessful: true,
        documentsSubmitted: ['evidence-doc-1'],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: safeJudgeId,
      },
      {
        id: 'demo-hearing-2',
        caseId: 'demo-case-2',
        caseNumber: 'FM-DLI-99001/2026',
        caseTitle: 'Anjali Gupta vs Vikram Gupta',
        hearingDate: withDayOffset(0),
        hearingTime: '02:00 PM',
        courtRoomNumber: '2',
        judgeId: safeJudgeId,
        judgeName: safeJudgeName,
        partiesPresent: ['Petitioner', 'Respondent'],
        lawyersPresent: ['Adv. Meera Singh', 'Adv. Rajiv Khanna'],
        purpose: 'Arguments',
        notes: 'Final arguments on custody matter',
        outcome: 'completed',
        isSuccessful: true,
        documentsSubmitted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: safeJudgeId,
      },
      {
        id: 'demo-hearing-3',
        caseId: 'demo-case-3',
        caseNumber: 'CV-DLI-45678/2026',
        caseTitle: 'M/s Tech Solutions vs Alpha Enterprises',
        hearingDate: withDayOffset(0),
        hearingTime: '04:15 PM',
        courtRoomNumber: '3',
        judgeId: safeJudgeId,
        judgeName: safeJudgeName,
        partiesPresent: ['Plaintiff Rep', 'Defendant Rep'],
        lawyersPresent: ['Adv. Suresh Patel', 'Adv. Kavita Malhotra'],
        purpose: 'Interim Application',
        notes: 'Application for interim injunction',
        outcome: 'completed',
        isSuccessful: false,
        documentsSubmitted: ['application-doc'],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: safeJudgeId,
      },
      {
        id: 'demo-hearing-4',
        caseId: 'demo-case-4',
        caseNumber: 'CR-DLI-78910/2025',
        caseTitle: 'State of Delhi vs Mohit Sharma & Ors',
        hearingDate: withDayOffset(1),
        hearingTime: '11:00 AM',
        courtRoomNumber: '1',
        judgeId: safeJudgeId,
        judgeName: safeJudgeName,
        partiesPresent: [],
        lawyersPresent: [],
        purpose: 'Judgment',
        notes: 'Pronouncement of judgment',
        outcome: 'completed',
        isSuccessful: true,
        documentsSubmitted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: safeJudgeId,
      },
      {
        id: 'demo-hearing-5',
        caseId: 'demo-case-5',
        caseNumber: 'CS-DLI-11223/2026',
        caseTitle: 'Ramesh Chand vs XYZ Bank Ltd',
        hearingDate: withDayOffset(3),
        hearingTime: '02:30 PM',
        courtRoomNumber: '2',
        judgeId: safeJudgeId,
        judgeName: safeJudgeName,
        partiesPresent: [],
        lawyersPresent: [],
        purpose: 'Evidence',
        notes: 'Bank to submit transaction records',
        outcome: 'completed',
        isSuccessful: true,
        documentsSubmitted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: safeJudgeId,
      },
      {
        id: 'demo-hearing-6',
        caseId: 'demo-case-1',
        caseNumber: 'CC-DLI-12345/2026',
        caseTitle: 'State of Delhi vs Rajesh Kumar',
        hearingDate: withDayOffset(7),
        hearingTime: '10:00 AM',
        courtRoomNumber: '3',
        judgeId: safeJudgeId,
        judgeName: safeJudgeName,
        partiesPresent: [],
        lawyersPresent: [],
        purpose: 'Arguments',
        notes: 'Defense final arguments',
        outcome: 'completed',
        isSuccessful: true,
        documentsSubmitted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: safeJudgeId,
      },
    ] as Hearing[];
  };
  
  const loadCalendarData = async (targetMonth?: Date) => {
    if (!courtUser?.uid) return;
    
    const monthToLoad = targetMonth || currentMonth;
    const startOfMonth = new Date(monthToLoad.getFullYear(), monthToLoad.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(monthToLoad.getFullYear(), monthToLoad.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const hearingsQuery = query(
      collection(db, 'hearings'),
      where('judgeId', '==', courtUser.uid),
      where('hearingDate', '>=', Timestamp.fromDate(startOfMonth)),
      where('hearingDate', '<=', Timestamp.fromDate(endOfMonth)),
      orderBy('hearingDate'),
      orderBy('hearingTime')
    );
    
    const snapshot = await getDocs(hearingsQuery);
    const hearings: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      hearings.push({
        ...data,
        id: doc.id,
        hearingDate: data.hearingDate?.toDate?.() || new Date(data.hearingDate),
      });
    });

    const effectiveHearings = hearings.length > 0
      ? hearings
      : buildDemoHearings(courtUser?.uid, courtUser?.name).filter(h => {
          return h.hearingDate >= startOfMonth && h.hearingDate <= endOfMonth;
        });

    // Group by date
    const grouped = effectiveHearings.reduce((acc, hearing) => {
      const dateKey = hearing.hearingDate.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(hearing);
      return acc;
    }, {} as Record<string, any[]>);
    
    setCalendarData(Object.entries(grouped).map(([date, hearingsList]: [string, any[]]) => ({
      date: new Date(date),
      hearings: hearingsList,
      count: hearingsList.length,
    })));
  };
  
  const handleInitializeSampleData = async () => {
    if (!courtUser?.uid || !courtUser?.name) {
      alert('Please login as a judge first');
      return;
    }
    
    const confirm = window.confirm(
      'This will add sample cases and hearings to the database. Continue?'
    );
    
    if (!confirm) return;
    
    const result = await initializeSampleData(courtUser.uid, courtUser.name);
    
    if (result.success) {
      alert(result.message);
      loadDashboardData();
      loadCalendarData();
    } else {
      alert('Failed to initialize sample data: ' + result.message);
    }
  };
  
  const handleScheduleHearing = async (hearingData: any) => {
    try {
      await addDoc(collection(db, 'hearings'), {
        ...hearingData,
        judgeId: courtUser?.uid,
        judgeName: courtUser?.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        recordedBy: courtUser?.uid,
      });
      setShowScheduleHearing(false);
    } catch (error) {
      console.error('Error scheduling hearing:', error);
      alert('Failed to schedule hearing. Please try again.');
    }
  };
  
  const handleRecordOrder = async (orderData: any) => {
    try {
      if (selectedHearing) {
        const hearingRef = doc(db, 'hearings', selectedHearing.id);
        await updateDoc(hearingRef, {
          orderPassed: orderData.orderText,
          outcome: orderData.outcome,
          nextHearingDate: orderData.nextHearingDate ? Timestamp.fromDate(new Date(orderData.nextHearingDate)) : null,
          notes: orderData.notes,
          isSuccessful: orderData.isSuccessful,
          updatedAt: serverTimestamp(),
        });
        
        // Update case status if needed
        if (orderData.updateCaseStatus && orderData.caseId) {
          const caseRef = doc(db, 'cases', orderData.caseId);
          await updateDoc(caseRef, {
            status: orderData.caseStatus,
            nextHearingDate: orderData.nextHearingDate ? Timestamp.fromDate(new Date(orderData.nextHearingDate)) : null,
            lastHearingDate: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
      setShowRecordOrder(false);
      setSelectedHearing(null);
    } catch (error) {
      console.error('Error recording order:', error);
      alert('Failed to record order. Please try again.');
    }
  };
  
  // Calendar View Modal Component
  const CalendarViewModal = () => {
    if (!showCalendar) return null;
    
    const getDaysInMonth = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Add empty cells for days before the first day
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    };
    
    const getHearingsForDate = (date: Date | null) => {
      if (!date) return [];
      const dateString = date.toDateString();
      const dayData = calendarData.find(d => d.date.toDateString() === dateString);
      return dayData ? dayData.hearings : [];
    };
    
    const hasHearings = (date: Date | null) => {
      if (!date) return false;
      return getHearingsForDate(date).length > 0;
    };
    
    const isToday = (date: Date | null) => {
      if (!date) return false;
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };
    
    const goToPreviousMonth = () => {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      setCurrentMonth(newMonth);
      loadCalendarData(newMonth);
    };
    
    const goToNextMonth = () => {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      setCurrentMonth(newMonth);
      loadCalendarData(newMonth);
    };
    
    const selectedDayHearings = selectedDate ? getHearingsForDate(selectedDate) : [];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white font-serif">Hearing Calendar</h2>
            </div>
            <button 
              onClick={() => {
                setShowCalendar(false);
                setSelectedDate(null);
              }}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousMonth}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <h3 className="text-2xl font-bold text-slate-900">
                {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={goToNextMonth}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Calendar Grid */}
              <div>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-slate-700 text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth().map((date, idx) => {
                    const hearings = hasHearings(date);
                    const today = isToday(date);
                    const selected = selectedDate && date && selectedDate.toDateString() === date.toDateString();
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => date && setSelectedDate(date)}
                        disabled={!date}
                        className={`
                          aspect-square p-2 rounded-xl text-sm font-bold transition-all relative
                          ${
                            !date
                              ? 'bg-transparent cursor-default'
                              : selected
                              ? 'bg-amber-500 text-white shadow-lg scale-105'
                              : today
                              ? 'bg-blue-100 text-blue-900 border-2 border-blue-500'
                              : hearings
                              ? 'bg-slate-900 text-white hover:bg-slate-700 shadow-md'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }
                        `}
                      >
                        {date && (
                          <>
                            <span>{date.getDate()}</span>
                            {hearings && (
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                {getHearingsForDate(date).slice(0, 3).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 h-1 rounded-full ${
                                      selected ? 'bg-white' : 'bg-amber-400'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-slate-700 mb-2">Legend:</p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                    <span className="text-xs text-slate-600">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-900 rounded"></div>
                    <span className="text-xs text-slate-600">Has Hearings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-500 rounded"></div>
                    <span className="text-xs text-slate-600">Selected Date</span>
                  </div>
                </div>
              </div>
              
              {/* Selected Date Details */}
              <div>
                {selectedDate ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-4 text-white">
                      <p className="text-sm font-medium opacity-80">Hearings on</p>
                      <h4 className="text-xl font-bold">
                        {selectedDate.toLocaleDateString('en-IN', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h4>
                      <p className="text-sm mt-1 opacity-90">
                        {selectedDayHearings.length} hearing(s) scheduled
                      </p>
                    </div>
                    
                    {selectedDayHearings.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 text-sm">No hearings scheduled</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                        {selectedDayHearings.map((hearing: any, idx: number) => (
                          <div key={idx} className="border-2 border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all bg-white">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="bg-slate-900 text-white rounded-lg px-3 py-2 text-center min-w-[70px]">
                                <p className="text-sm font-bold">{hearing.hearingTime}</p>
                                <p className="text-xs opacity-80">Room {hearing.courtRoomNumber}</p>
                              </div>
                              <div className="flex-1">
                                <p className="font-mono text-xs font-bold text-slate-700 mb-1">
                                  {hearing.caseNumber}
                                </p>
                                <p className="font-bold text-slate-900 text-sm">{hearing.caseTitle}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                                {hearing.purpose}
                              </span>
                              {hearing.notes && (
                                <span className="text-xs text-slate-600 italic">
                                  {hearing.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-400">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-sm">Click on a date to view hearings</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Schedule Hearing Modal Component
  const ScheduleHearingModal = () => {
    const [formData, setFormData] = useState({
      caseId: '',
      caseNumber: '',
      caseTitle: '',
      hearingDate: '',
      hearingTime: '',
      courtRoomNumber: '1',
      purpose: 'Arguments',
    });
    
    if (!showScheduleHearing) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleScheduleHearing({
        ...formData,
        hearingDate: Timestamp.fromDate(new Date(formData.hearingDate)),
        outcome: 'completed' as any,
        isSuccessful: false,
        partiesPresent: [],
        lawyersPresent: [],
        documentsSubmitted: [],
        notes: '',
      });
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white font-serif">Schedule Hearing</h2>
            </div>
            <button 
              onClick={() => setShowScheduleHearing(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Case Number</label>
                <input
                  type="text"
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-medium"
                  placeholder="CC-DLI-12345/2026"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Case ID (Optional)</label>
                <input
                  type="text"
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-medium"
                  placeholder="case-123"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Case Title</label>
              <input
                type="text"
                value={formData.caseTitle}
                onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-medium"
                placeholder="State vs John Doe"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hearing Date</label>
                <input
                  type="date"
                  value={formData.hearingDate}
                  onChange={(e) => setFormData({ ...formData, hearingDate: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-medium"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hearing Time</label>
                <input
                  type="time"
                  value={formData.hearingTime}
                  onChange={(e) => setFormData({ ...formData, hearingTime: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-medium"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Court Room</label>
                <input
                  type="text"
                  value={formData.courtRoomNumber}
                  onChange={(e) => setFormData({ ...formData, courtRoomNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-medium"
                  placeholder="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Purpose</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none font-medium"
                >
                  <option value="Arguments">Arguments</option>
                  <option value="Evidence">Evidence</option>
                  <option value="Final Hearing">Final Hearing</option>
                  <option value="Interim Application">Interim Application</option>
                  <option value="Judgment">Judgment</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Schedule Hearing
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleHearing(false)}
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Record Order Modal Component
  const RecordOrderModal = () => {
    const [formData, setFormData] = useState({
      orderText: '',
      outcome: 'completed',
      nextHearingDate: '',
      notes: '',
      isSuccessful: true,
      updateCaseStatus: false,
      caseStatus: 'under_trial',
    });
    
    if (!showRecordOrder) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleRecordOrder({
        ...formData,
        caseId: selectedHearing?.caseId,
      });
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-600 to-amber-500">
            <div className="flex items-center gap-3">
              <Mic className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white font-serif">Record Order</h2>
            </div>
            <button 
              onClick={() => {
                setShowRecordOrder(false);
                setSelectedHearing(null);
              }}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {selectedHearing && (
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <p className="text-sm text-slate-600 font-medium mb-1">Case</p>
              <p className="font-mono text-sm font-bold text-slate-900">{selectedHearing.caseNumber}</p>
              <p className="text-slate-700 font-semibold">{selectedHearing.caseTitle}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Order Text</label>
              <textarea
                value={formData.orderText}
                onChange={(e) => setFormData({ ...formData, orderText: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none font-medium min-h-[150px]"
                placeholder="Enter the order details..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Hearing Outcome</label>
              <select
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none font-medium"
              >
                <option value="completed">Completed</option>
                <option value="adjourned">Adjourned</option>
                <option value="dismissed">Dismissed</option>
                <option value="disposed">Disposed</option>
                <option value="evidence_pending">Evidence Pending</option>
                <option value="arguments_pending">Arguments Pending</option>
                <option value="order_reserved">Order Reserved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Next Hearing Date (if applicable)</label>
              <input
                type="date"
                value={formData.nextHearingDate}
                onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none font-medium"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
              <input
                type="checkbox"
                id="isSuccessful"
                checked={formData.isSuccessful}
                onChange={(e) => setFormData({ ...formData, isSuccessful: e.target.checked })}
                className="w-5 h-5 text-amber-500 rounded"
              />
              <label htmlFor="isSuccessful" className="text-sm font-bold text-slate-700">
                Mark as successful hearing (case progressed)
              </label>
            </div>
            
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="updateCaseStatus"
                  checked={formData.updateCaseStatus}
                  onChange={(e) => setFormData({ ...formData, updateCaseStatus: e.target.checked })}
                  className="w-5 h-5 text-amber-500 rounded"
                />
                <label htmlFor="updateCaseStatus" className="text-sm font-bold text-slate-700">
                  Update case status
                </label>
              </div>
              
              {formData.updateCaseStatus && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Case Status</label>
                  <select
                    value={formData.caseStatus}
                    onChange={(e) => setFormData({ ...formData, caseStatus: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none font-medium"
                  >
                    <option value="filed">Filed</option>
                    <option value="pending_evidence">Pending Evidence</option>
                    <option value="under_trial">Under Trial</option>
                    <option value="adjourned">Adjourned</option>
                    <option value="arguments_completed">Arguments Completed</option>
                    <option value="reserved_for_judgment">Reserved for Judgment</option>
                    <option value="disposed">Disposed</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Record Order
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRecordOrder(false);
                  setSelectedHearing(null);
                }}
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Hearing Details Modal Component
  const HearingDetailsModal = () => {
    if (!selectedHearing || showRecordOrder) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-700">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white font-serif">Hearing Details</h2>
            </div>
            <button 
              onClick={() => setSelectedHearing(null)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Case Number</p>
                <p className="font-mono font-bold text-slate-900">{selectedHearing.caseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Hearing ID</p>
                <p className="font-mono text-sm text-slate-700">{selectedHearing.id}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Case Title</p>
              <p className="font-bold text-slate-900">{selectedHearing.caseTitle}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Date</p>
                <p className="font-bold text-slate-900">
                  {selectedHearing.hearingDate.toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Time</p>
                <p className="font-bold text-slate-900">{selectedHearing.hearingTime}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Court Room</p>
                <p className="font-bold text-slate-900">Room {selectedHearing.courtRoomNumber}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Purpose</p>
              <p className="font-bold text-slate-900">{selectedHearing.purpose}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Outcome</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedHearing.outcome === 'disposed' ? 'bg-green-100 text-green-700' :
                  selectedHearing.outcome === 'adjourned' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedHearing.outcome}
                </span>
                {selectedHearing.isSuccessful && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            
            {selectedHearing.orderPassed && (
              <div>
                <p className="text-sm text-slate-600 font-medium mb-2">Order Passed</p>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-700">{selectedHearing.orderPassed}</p>
                </div>
              </div>
            )}
            
            {selectedHearing.notes && (
              <div>
                <p className="text-sm text-slate-600 font-medium mb-2">Notes</p>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-700">{selectedHearing.notes}</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              {hasPermission(PERMISSIONS.HEARING_RECORD) && (
                <button
                  onClick={() => setShowRecordOrder(true)}
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Record Order
                </button>
              )}
              <button
                onClick={() => setSelectedHearing(null)}
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
        {/* Sample Data Button (for demo purposes) */}
        <button
          onClick={handleInitializeSampleData}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white text-sm font-bold transition-all flex items-center gap-2 backdrop-blur-sm"
        >
          <Database className="w-4 h-4" />
          Load Sample Data (Demo)
        </button>
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
          <button 
            onClick={() => {
              loadCalendarData();
              setShowCalendar(true);
            }}
            className="px-5 py-2.5 text-sm text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-md"
          >
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
                      <button 
                        onClick={() => setSelectedHearing(hearing)}
                        className="p-2.5 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    {hasPermission(PERMISSIONS.HEARING_RECORD) && (
                      <button 
                        onClick={() => {
                          setSelectedHearing(hearing);
                          setShowRecordOrder(true);
                        }}
                        className="p-2.5 text-slate-600 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                      >
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
              { label: 'Schedule Hearing', icon: Calendar, onClick: () => setShowScheduleHearing(true), color: 'hover:border-slate-900 hover:bg-slate-50' },
              { label: 'View Analytics', icon: BarChart3, onClick: () => setActiveTab('analytics'), color: 'hover:border-slate-900 hover:bg-slate-50' },
              { label: 'Record Order', icon: Mic, onClick: () => setShowRecordOrder(true), color: 'hover:border-amber-500 hover:bg-amber-50' },
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
      {/* Modals */}
      <CalendarViewModal />
      <ScheduleHearingModal />
      <RecordOrderModal />
      <HearingDetailsModal />

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
