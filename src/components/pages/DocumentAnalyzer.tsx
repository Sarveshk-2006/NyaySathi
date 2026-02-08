import React, { useState, useRef } from 'react';
import { FileSearch, Upload, Loader2, Zap, Download, Volume2, StopCircle, CheckCircle2, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer, Card, LegalDisclaimer } from '../shared';

const DocumentAnalyzer = () => {
  const { currentUser } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      setAnalyzeResult('');
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setAnalyzeResult('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://localhost:8001/api/analyze-document', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }

      const data = await response.json();
      setAnalyzeResult(data.analysis || data.text || 'Analysis completed.');

      if (currentUser) {
        await addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: 'Document Analysis',
          query: `Analyzed: ${uploadedFile.name}`,
          response: data.analysis || data.text,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadAnalysis = () => {
    if (!analyzeResult) return;

    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 50;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.text('Document Analysis Report', pageWidth / 2, 60, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.text('(Generated via Nyay Saathi AI)', pageWidth / 2, 75, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(analyzeResult, contentWidth);
    let y = 100;
    const lineHeight = 16;

    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > doc.internal.pageSize.height - 70) {
        doc.addPage();
        y = 60;
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    doc.save('document-analysis.pdf');
  };

  return (
    <PageContainer title="Document Analyzer" subtitle="Upload legal documents for AI-powered analysis and insights.">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 h-fit shadow-xl">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-slate-900/5 rounded-lg"><FileSearch className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold font-serif">Upload Document</h3>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="mb-6 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-slate-900 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-slate-100 group-hover:bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-slate-900" />
            </div>
            <p className="text-slate-700 font-medium mb-2">Click to upload document</p>
            <p className="text-slate-500 text-sm">PDF, DOC, DOCX, TXT (Max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
          </div>

          {uploadedFile && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-slate-700 font-medium text-sm">{uploadedFile.name}</p>
                  <p className="text-slate-500 text-xs">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleAnalyzeDocument}
            disabled={!uploadedFile || isAnalyzing}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/30 hover:bg-slate-800 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin w-5 h-5"/>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-400"/>
                Analyze Document
              </>
            )}
          </button>
        </Card>

        {analyzeResult ? (
          <Card className="p-8 bg-slate-50/50 border-t-4 border-green-500 animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-xl font-serif">Analysis Result</h3>
              <div className="flex gap-2">
                {isSpeaking ? (
                  <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Stop reading">
                    <StopCircle className="w-5 h-5"/>
                  </button>
                ) : (
                  <button onClick={() => { const utterance = new SpeechSynthesisUtterance(analyzeResult); utterance.onend = () => setIsSpeaking(false); window.speechSynthesis.speak(utterance); setIsSpeaking(true); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300" title="Read aloud">
                    <Volume2 className="w-5 h-5"/>
                  </button>
                )}
                <button onClick={handleDownloadAnalysis} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg shadow-sm text-white font-bold hover:bg-slate-800 transition-all" title="Download as PDF">
                  <Download className="w-4 h-4"/> Download PDF
                </button>
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap font-serif leading-relaxed p-6 bg-white rounded-xl shadow-inner border border-slate-100 h-[600px] overflow-y-auto">
              {analyzeResult}
            </div>
            <LegalDisclaimer />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <FileSearch className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Analysis will appear here</p>
            <p className="text-sm">Upload a document and click analyze to get started</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default DocumentAnalyzer;
