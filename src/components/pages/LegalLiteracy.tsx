import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Medal, CheckCircle2, X } from 'lucide-react';
import { db } from '../../firebase';
import { collection, doc, onSnapshot, setDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { LEARNING_MODULES } from '../../utils/mockData';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';

const LegalLiteracy = () => {
  const { currentUser } = useAuth();
  const [activeModule, setActiveModule] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [orderSelections, setOrderSelections] = useState<number[]>([]);
  const [matchSelections, setMatchSelections] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const totalModules = LEARNING_MODULES.length;

  // Realtime progress sync
  useEffect(() => {
    if (!currentUser) return;
    const progressRef = doc(db, 'users', currentUser.uid, 'progress', 'nyayVidya');
    const unsub = onSnapshot(progressRef, (snap) => {
      const data = snap.data();
      if (data?.completedModules) setCompletedModules(data.completedModules);
      if (typeof data?.lastScore === 'number') setScore(data.lastScore);
    });
    return () => unsub();
  }, [currentUser]);

  // Live leaderboard
  useEffect(() => {
    if (!currentUser) return;
    const scoresRef = collection(db, 'leaderboards', 'nyayVidya', 'scores');
    const q = query(scoresRef, orderBy('xp', 'desc'), limit(5));
    const unsub = onSnapshot(q, (snap) => {
      setLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser]);

  const calcXp = (modules: number[]) => {
    return modules.reduce((sum, id) => sum + (LEARNING_MODULES.find(m => m.id === id)?.xp || 0), 0);
  };

  const persistProgress = async (modules: number[], lastScoreVal: number) => {
    if (!currentUser) return;
    try {
      setIsSaving(true);
      const progressRef = doc(db, 'users', currentUser.uid, 'progress', 'nyayVidya');
      const xpVal = calcXp(modules);
      await setDoc(progressRef, {
        completedModules: modules,
        lastScore: lastScoreVal,
        xp: xpVal,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const leaderRef = doc(db, 'leaderboards', 'nyayVidya', 'scores', currentUser.uid);
      await setDoc(leaderRef, {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Citizen',
        xp: xpVal,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Failed to save progress', err);
    } finally {
      setIsSaving(false);
    }
  };

  const startModule = (mod: any) => {
    setActiveModule(mod);
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
  };

  useEffect(() => {
    if (!activeModule) return;
    if (activeModule.type === 'ordering') {
      setOrderSelections(new Array(activeModule.steps.length).fill(0));
    }
    if (activeModule.type === 'match') {
      setMatchSelections(new Array(activeModule.pairs.length).fill(''));
    }
    if (activeModule.type === 'fill') {
      setTextAnswer('');
    }
  }, [activeModule, currentStep]);

  const getTotalSteps = (mod: any) => {
    if (!mod) return 0;
    if (mod.type === 'quiz') return mod.questions?.length || 0;
    if (mod.type === 'scenario') return mod.scenarios?.length || 0;
    if (mod.type === 'rapid') return mod.items?.length || 0;
    if (mod.type === 'ordering') return 1;
    if (mod.type === 'match') return 1;
    if (mod.type === 'fill') return mod.prompts?.length || 0;
    return 0;
  };

  const handleAnswer = (answer: any) => {
    if (!activeModule) return;
    let isCorrect = false;

    if (activeModule.type === 'quiz') {
      const q = activeModule.questions[currentStep];
      isCorrect = answer === q.ans;
    } else if (activeModule.type === 'scenario') {
      const s = activeModule.scenarios[currentStep];
      isCorrect = answer === s.ans;
    } else if (activeModule.type === 'rapid') {
      const item = activeModule.items[currentStep];
      isCorrect = answer === item.ans;
    } else if (activeModule.type === 'ordering') {
      const expected = activeModule.correctOrder;
      isCorrect = expected.every((stepIndex: number, pos: number) => orderSelections[stepIndex] === pos + 1);
    } else if (activeModule.type === 'match') {
      isCorrect = activeModule.pairs.every((p: any, idx: number) => matchSelections[idx] === p.right);
    } else if (activeModule.type === 'fill') {
      const prompt = activeModule.prompts[currentStep];
      isCorrect = textAnswer.trim().toLowerCase() === String(prompt.answer).trim().toLowerCase();
    }

    const nextScore = isCorrect ? score + 10 : score;
    setScore(nextScore);
    const totalSteps = getTotalSteps(activeModule);

    if (currentStep + 1 < totalSteps) {
      setCurrentStep(c => c + 1);
    } else {
      setShowResult(true);
      const alreadyDone = completedModules.includes(activeModule.id);
      const updatedModules = alreadyDone ? completedModules : [...completedModules, activeModule.id];
      setCompletedModules(updatedModules);
      persistProgress(updatedModules, nextScore);
    }
  };

  return (
    <PageContainer title="Nyay Vidya" subtitle="Gamified Legal Learning. Know your rights, earn badges.">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Progress Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500 rounded-full text-slate-900"><Trophy className="w-8 h-8"/></div>
              <div>
                <h3 className="text-xl font-bold font-serif">Your Progress</h3>
                <p className="text-amber-400 text-sm font-medium">{calcXp(completedModules)} XP Earned</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Citizen Level</span>
                <span>{completedModules.length}/{totalModules} Modules</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(completedModules.length / totalModules) * 100}%` }}></div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500"/> Live Leaderboard</h4>
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <div className="text-sm text-slate-500">No scores yet. Be the first!</div>
              ) : (
                leaderboard.map((u: any, idx: number) => (
                  <div key={u.id || idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                      <span className="font-medium text-slate-700">{u.name || 'Citizen'}</span>
                    </div>
                    <span className="font-bold text-slate-900">{u.xp || 0} XP</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Medal className="w-5 h-5 text-amber-500"/> Badges</h4>
            <div className="grid grid-cols-3 gap-2">
              {completedModules.length > 0 ? (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-1 text-2xl">🥇</div>
                  <span className="text-xs">First Step</span>
                </div>
              ) : (
                <div className="text-center opacity-50">
                  <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full mb-1"></div>
                  <span className="text-xs">Locked</span>
                </div>
              )}
              {completedModules.length >= 3 ? (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-slate-200 rounded-full flex items-center justify-center mb-1 text-2xl">⚖️</div>
                  <span className="text-xs">Advocate</span>
                </div>
              ) : (
                <div className="text-center opacity-50">
                  <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full mb-1"></div>
                  <span className="text-xs">Locked</span>
                </div>
              )}
              <div className="text-center opacity-50">
                <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full mb-1"></div>
                <span className="text-xs">Locked</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Modules Grid / Quiz Area */}
        <div className="lg:col-span-2">
          {!activeModule ? (
            <div className="grid md:grid-cols-2 gap-6">
              {LEARNING_MODULES.map((mod) => {
                const IconComponent = mod.icon as any;
                return (
                  <Card key={mod.id} className="p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
                    <div onClick={() => startModule(mod)}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-100 rounded-xl text-slate-900 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                          {/* Icon rendering would need dynamic handling */}
                          <div className="w-8 h-8" />
                        </div>
                        {completedModules.includes(mod.id) && <CheckCircle2 className="w-6 h-6 text-green-500"/>}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{mod.title}</h3>
                      <p className="text-slate-500 text-sm mb-4">{mod.desc}</p>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full">+{mod.xp} XP</div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{mod.type}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 h-full">
              {showResult ? (
                <div className="text-center py-10">
                  <Medal className="w-20 h-20 text-amber-500 mx-auto mb-6 animate-bounce"/>
                  <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Module Completed!</h3>
                  <p className="text-slate-600 text-lg mb-8">You scored {score} points.</p>
                  <button onClick={() => setActiveModule(null)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">Back to Modules</button>
                </div>
              ) : (
                <div className="max-w-xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={() => setActiveModule(null)}
                      className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full"
                    >
                      ← Back to Dashboard
                    </button>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step {currentStep + 1}/{getTotalSteps(activeModule)}</span>
                    <button onClick={() => setActiveModule(null)} className="text-slate-400 hover:text-red-500"><X className="w-6 h-6"/></button>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
                    <div className="h-full bg-amber-500 transition-all" style={{ width: `${((currentStep + 1) / getTotalSteps(activeModule)) * 100}%` }}></div>
                  </div>

                  {activeModule.type === 'quiz' && (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-snug">{activeModule.questions[currentStep].q}</h3>
                      <div className="space-y-4">
                        {activeModule.questions[currentStep].options.map((opt: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50 transition-all font-medium text-slate-700"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {activeModule.type === 'scenario' && (
                    <>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 mb-6">
                        {activeModule.scenarios[currentStep].story}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-6">{activeModule.scenarios[currentStep].question}</h3>
                      <div className="space-y-4">
                        {activeModule.scenarios[currentStep].options.map((opt: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50 transition-all font-medium text-slate-700"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {activeModule.type === 'rapid' && (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-snug">{activeModule.items[currentStep].statement}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleAnswer(true)}
                          className="w-full py-4 rounded-xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all font-bold text-slate-700"
                        >
                          True
                        </button>
                        <button
                          onClick={() => handleAnswer(false)}
                          className="w-full py-4 rounded-xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all font-bold text-slate-700"
                        >
                          False
                        </button>
                      </div>
                    </>
                  )}

                  {activeModule.type === 'ordering' && (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-snug">Arrange the steps in correct order</h3>
                      <div className="space-y-4">
                        {activeModule.steps.map((step: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100">
                            <select
                              value={orderSelections[idx] || 0}
                              onChange={(e) => {
                                const next = [...orderSelections];
                                next[idx] = Number(e.target.value);
                                setOrderSelections(next);
                              }}
                              className="w-20 p-2 border border-slate-200 rounded-lg"
                            >
                              <option value={0}>#</option>
                              {activeModule.steps.map((_: string, i: number) => (
                                <option key={i} value={i + 1}>{i + 1}</option>
                              ))}
                            </select>
                            <span className="text-slate-700 font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleAnswer('ordering')}
                        disabled={orderSelections.some(v => v === 0)}
                        className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50"
                      >
                        Check & Next
                      </button>
                    </>
                  )}

                  {activeModule.type === 'match' && (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-snug">Match the correct right</h3>
                      <div className="space-y-4">
                        {activeModule.pairs.map((pair: any, idx: number) => (
                          <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl border-2 border-slate-100">
                            <span className="font-semibold text-slate-700 w-40">{pair.left}</span>
                            <select
                              value={matchSelections[idx] || ''}
                              onChange={(e) => {
                                const next = [...matchSelections];
                                next[idx] = e.target.value;
                                setMatchSelections(next);
                              }}
                              className="flex-1 p-2 border border-slate-200 rounded-lg"
                            >
                              <option value="">Select match</option>
                              {activeModule.pairs.map((p: any, i: number) => (
                                <option key={i} value={p.right}>{p.right}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleAnswer('match')}
                        disabled={matchSelections.some(v => v === '')}
                        className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50"
                      >
                        Check & Next
                      </button>
                    </>
                  )}

                  {activeModule.type === 'fill' && (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-snug">{activeModule.prompts[currentStep].text}</h3>
                      <input
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        placeholder="Type your answer"
                        className="w-full p-4 border-2 border-slate-100 rounded-xl"
                      />
                      <button
                        onClick={() => handleAnswer('fill')}
                        disabled={!textAnswer.trim()}
                        className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50"
                      >
                        Check & Next
                      </button>
                    </>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

      </div>
    </PageContainer>
  );
};

export default LegalLiteracy;
