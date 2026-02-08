import React, { useState } from 'react';
import { Scale, Loader2, Zap, Download, Volume2, StopCircle, CheckCircle2, Bookmark, Landmark } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer, Card, LegalDisclaimer } from '../shared';

const CaseOutcomePredictor = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    caseType: '',
    description: '',
    evidence: '',
    plaintiff: '',
    defendant: '',
    state: '',
    facts: ''
  });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const caseTypes = [
    'Criminal - Theft', 'Criminal - Assault', 'Criminal - Murder', 'Criminal - Fraud',
    'Civil - Property Dispute', 'Civil - Contract Breach', 'Civil - Family/Matrimonial',
    'Corporate - Partnership Dispute', 'Corporate - Employment', 
    'Consumer Rights', 'Cyber Crime', 'Taxation', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseType || !formData.description) {
      alert('Please fill in Case Type and Description');
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8001/api/predict-outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to predict outcome');
      }
      
      const data = await response.json();
      setResult(data);

      if (currentUser) {
        await addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: 'Case Outcome Prediction',
          query: `${formData.caseType}: ${formData.description}`,
          response: data.analysis,
          prediction: data.prediction,
          confidence: data.confidence,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 50;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text('Case Outcome Prediction Report', pageWidth / 2, 60, { align: 'center' });
    
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 80, { align: 'center' });

    let yPos = 120;
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(`Predicted Outcome: ${result.prediction}`, margin, yPos);
    
    yPos += 25;
    doc.setFontSize(12);
    doc.text(`Confidence Level: ${result.confidence}%`, margin, yPos);
    
    yPos += 40;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(result.analysis || '', contentWidth);
    lines.forEach((line: string) => {
      if (yPos > doc.internal.pageSize.height - 80) {
        doc.addPage();
        yPos = 50;
      }
      doc.text(line, margin, yPos);
      yPos += 15;
    });

    doc.save('case-outcome-prediction.pdf');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-600 bg-green-50';
    if (confidence >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <PageContainer title="Case Outcome Predictor" subtitle="AI-powered prediction combining historical case data and legal analysis">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-500" />
            Case Details
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Case Type *</label>
              <select
                value={formData.caseType}
                onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800"
                required
              >
                <option value="">Select case type...</option>
                {caseTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Case Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the case in detail: what happened, when, where, and who was involved..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800 placeholder-slate-500 h-32 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Key Facts</label>
              <textarea
                value={formData.facts}
                onChange={(e) => setFormData({ ...formData, facts: e.target.value })}
                placeholder="List key facts, dates, locations, and circumstances..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800 placeholder-slate-500 h-24 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Plaintiff/Complainant</label>
                <input
                  type="text"
                  value={formData.plaintiff}
                  onChange={(e) => setFormData({ ...formData, plaintiff: e.target.value })}
                  placeholder="Name of plaintiff"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Defendant/Accused</label>
                <input
                  type="text"
                  value={formData.defendant}
                  onChange={(e) => setFormData({ ...formData, defendant: e.target.value })}
                  placeholder="Name of defendant"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">State/Jurisdiction</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., Delhi, Maharashtra, Karnataka"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Evidence Available</label>
              <textarea
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                placeholder="List available evidence: documents, witnesses, forensic reports, CCTV footage, etc."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800 placeholder-slate-500 h-24 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/30 hover:bg-slate-800 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5"/>
                  Analyzing Case...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-400"/>
                  Predict Outcome
                </>
              )}
            </button>
          </form>
        </Card>

        {result ? (
          <Card className="p-8 bg-gradient-to-br from-slate-50 to-white border-t-4 border-amber-500">
            <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-2xl font-serif mb-2">Prediction Result</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getConfidenceColor(result.confidence)}`}>
                  <CheckCircle2 className="w-5 h-5" />
                  {result.confidence}% Confidence
                </div>
              </div>
              <div className="flex gap-2">
                {isSpeaking ? (
                  <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                    <StopCircle className="w-5 h-5"/>
                  </button>
                ) : (
                  <button onClick={() => { const utterance = new SpeechSynthesisUtterance(result.analysis); utterance.onend = () => setIsSpeaking(false); window.speechSynthesis.speak(utterance); setIsSpeaking(true); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                    <Volume2 className="w-5 h-5"/>
                  </button>
                )}
                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">
                  <Download className="w-4 h-4"/> Download
                </button>
              </div>
            </div>

            <div className="mb-6 p-6 bg-white rounded-2xl border-l-4 border-amber-500 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Predicted Outcome</div>
              <div className="text-2xl font-bold text-slate-900 font-serif">{result.prediction}</div>
            </div>

            {result.similarCasesCount > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                  <Bookmark className="w-4 h-4" />
                  {result.similarCasesCount} Similar Historical Cases Found
                </div>
                <div className="text-sm text-amber-700">Analysis based on database patterns and precedents</div>
              </div>
            )}

            <div className="prose prose-slate max-w-none">
              <div className="p-6 bg-white rounded-xl shadow-inner border border-slate-100 max-h-[600px] overflow-y-auto whitespace-pre-wrap font-serif text-slate-700 leading-relaxed">
                {result.analysis}
              </div>
            </div>

            {result.similarCases && result.similarCases.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-amber-500" />
                  Similar Past Cases
                </h4>
                <div className="space-y-2">
                  {result.similarCases.map((c: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                      <div className="font-semibold text-slate-900">{c.title}</div>
                      <div className="text-slate-600">Judgement: {c.judgement || 'N/A'} • {c.punishment || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <LegalDisclaimer />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <Scale className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Prediction will appear here</p>
            <p className="text-sm">Fill in the case details and click predict to get started</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default CaseOutcomePredictor;
