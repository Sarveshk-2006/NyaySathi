import React, { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, Zap, Download, Volume2, StopCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer, Card, LegalDisclaimer } from '../shared';

const CasePredictor = () => {
  const [caseDescription, setCaseDescription] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentUser } = useAuth();

  // Load initial query from voice assistant if available
  useEffect(() => {
    const initialQuery = localStorage.getItem('nyaysaathi_initial_query');
    if (initialQuery) {
      setCaseDescription(initialQuery);
      localStorage.removeItem('nyaysaathi_initial_query');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseDescription.trim()) {
      alert('Please enter a case description');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/predict-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDescription: caseDescription.trim(), userId: currentUser?.uid })
      });
      const data = await response.json();
      setPrediction(data.text);

      if (currentUser) {
        await addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: "Case Prediction",
          query: caseDescription,
          response: data.text,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPrediction = () => {
    if (!prediction) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 50;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.5);
    doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text("Case Prediction Report", pageWidth / 2, 60, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.text("(Generated via Nyay Saathi AI)", pageWidth / 2, 75, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(prediction, contentWidth);

    let y = 100;
    const lineHeight = 16;

    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > doc.internal.pageSize.height - 70) {
        doc.addPage();
        doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);
        y = 60;
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    doc.save('case_prediction_report.pdf');
  };

  return (
    <PageContainer title="Case Predictor" subtitle="Get AI-powered predictions on your legal case outcome and probable verdict.">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 h-fit shadow-xl">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-slate-900/5 rounded-lg"><BrainCircuit className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold font-serif">Case Details</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Describe Your Case</label>
              <textarea
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                placeholder="Provide details about your case, the parties involved, the dispute, applicable laws, and what you're seeking..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800 placeholder-slate-500 h-40 resize-none"
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
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-400"/>
                  Get Prediction
                </>
              )}
            </button>
          </form>
        </Card>

        {prediction ? (
          <Card className="p-8 bg-slate-50/50 border-t-4 border-green-500 animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-xl font-serif">Prediction Result</h3>
              <div className="flex gap-2">
                {isSpeaking ? (
                  <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Stop reading">
                    <StopCircle className="w-5 h-5"/>
                  </button>
                ) : (
                  <button onClick={() => { const utterance = new SpeechSynthesisUtterance(prediction); utterance.onend = () => setIsSpeaking(false); window.speechSynthesis.speak(utterance); setIsSpeaking(true); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300" title="Read aloud">
                    <Volume2 className="w-5 h-5"/>
                  </button>
                )}
                <button onClick={handleDownloadPrediction} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg shadow-sm text-white font-bold hover:bg-slate-800 transition-all" title="Download as PDF">
                  <Download className="w-4 h-4"/> Download PDF
                </button>
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap font-serif leading-relaxed p-6 bg-white rounded-xl shadow-inner border border-slate-100 h-[600px] overflow-y-auto">
              {prediction}
            </div>
            <LegalDisclaimer />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <BrainCircuit className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Prediction will appear here</p>
            <p className="text-sm">Describe your case above and click predict to get started</p>
          </div>
        )}
      </div>
      <LegalDisclaimer />
    </PageContainer>
  );
};

export default CasePredictor;
