import React, { useState } from 'react';
import { FileText, Loader2, Zap, Download, Volume2, StopCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer, Card, LegalDisclaimer } from '../shared';

const DocumentGenerator = () => {
  const [docType, setDocType] = useState('rental-agreement');
  const [formData, setFormData] = useState<any>({});
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const getFormFields = () => {
    switch (docType) {
      case 'rental-agreement':
        return (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Landlord Name</label>
              <input name="landlordName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tenant Name</label>
              <input name="tenantName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Property Address</label>
              <input name="address" onChange={handleInputChange} placeholder="Complete Address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'affidavit':
        return (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Deponent Name (You)</label>
              <input name="deponentName" onChange={handleInputChange} placeholder="Your Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Father's Name</label>
              <input name="fatherName" onChange={handleInputChange} placeholder="Father's Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Statement of Facts</label>
              <textarea name="facts" onChange={handleInputChange} placeholder="I solemnly affirm that..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800 h-24" />
            </div>
          </>
        );
      case 'will':
        return (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Testator Name (Person making the will)</label>
              <input name="testatorName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Beneficiary Name</label>
              <input name="beneficiaryName" onChange={handleInputChange} placeholder="Who inherits?" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'power-of-attorney':
        return (
           <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Principal Name (Grantor)</label>
              <input name="principalName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Agent Name (Attorney-in-Fact)</label>
              <input name="agentName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'nda':
         return (
           <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Disclosing Party</label>
              <input name="disclosingParty" onChange={handleInputChange} placeholder="Company/Person Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Receiving Party</label>
              <input name="receivingParty" onChange={handleInputChange} placeholder="Company/Person Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'employment-contract':
         return (
           <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Employer</label>
              <input name="employerName" onChange={handleInputChange} placeholder="Company Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Employee</label>
              <input name="employeeName" onChange={handleInputChange} placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'divorce-papers':
        return (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Spouse 1 Full Name</label>
              <input name="spouse1Name" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Spouse 2 Full Name</label>
              <input name="spouse2Name" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, formData })
      });
      const { text } = await response.json();
      setGeneratedDoc(text);
      if (currentUser) {
        await addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: "Document Generation", query: `Generated: ${docType}`, response: text, createdAt: serverTimestamp()
        });
      }
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;

    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 50;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);
    
    doc.setDrawColor(0, 0, 0); 
    doc.setLineWidth(1.5);
    doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    const title = docType.replace(/-/g, ' ').toUpperCase();
    doc.text(title, pageWidth / 2, 60, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.text("(Generated via Nyay Saathi AI)", pageWidth / 2, 75, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    
    const lines = doc.splitTextToSize(generatedDoc, contentWidth);
    
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

    y += 40;
    
    if (y + 100 > doc.internal.pageSize.height - 40) {
        doc.addPage();
        doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);
        y = 60;
    }

    doc.setFont("times", "bold");
    
    let leftLabel = "Party A";
    let rightLabel = "Party B";

    if (docType === 'rental-agreement') { leftLabel = "Landlord"; rightLabel = "Tenant"; }
    else if (docType === 'affidavit') { leftLabel = "Deponent"; rightLabel = "Notary Public"; }
    else if (docType === 'will') { leftLabel = "Testator"; rightLabel = "Witness"; }
    else if (docType === 'power-of-attorney') { leftLabel = "Principal"; rightLabel = "Agent"; }
    else if (docType === 'nda') { leftLabel = "Disclosing Party"; rightLabel = "Receiving Party"; }
    else if (docType === 'employment-contract') { leftLabel = "Employer"; rightLabel = "Employee"; }
    else if (docType === 'divorce-papers') { leftLabel = "Spouse 1"; rightLabel = "Spouse 2"; }

    doc.text("__________________________", margin, y);
    doc.text("__________________________", pageWidth - margin - 150, y);
    
    y += 20;
    doc.text(`Signed by ${leftLabel}`, margin, y);
    doc.text(`Signed by ${rightLabel}`, pageWidth - margin - 150, y);

    // 5. FOOTER
    y += 40;
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString();
    doc.text(`Date: ${today}`, margin, y);
    doc.text(`Place: __________________`, pageWidth - margin - 150, y);

    doc.save(`${docType}_Legal_Draft.pdf`);
  };

  const handleSpeak = () => {
    if (!generatedDoc) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(generatedDoc);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <PageContainer title="AI Document Drafter" subtitle="Generate legally compliant drafts in seconds.">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 h-fit shadow-xl">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-slate-900/5 rounded-lg"><FileText className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold font-serif">Input Details</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800">
                <option value="rental-agreement">Rental Agreement</option>
                <option value="affidavit">General Affidavit</option>
                <option value="will">Last Will & Testament</option>
                <option value="power-of-attorney">Power of Attorney</option>
                <option value="nda">Non-Disclosure Agreement (NDA)</option>
                <option value="employment-contract">Employment Contract</option>
                <option value="divorce-papers">Divorce Papers (Mutual)</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {getFormFields()}
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/30 hover:bg-slate-800 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 mt-4">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Zap className="w-5 h-5 text-amber-400"/> Generate Draft</>}
            </button>
          </form>
        </Card>

        {generatedDoc ? (
          <Card className="p-8 bg-slate-50/50 border-t-4 border-green-500 animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-xl font-serif">Document Preview</h3>
              <div className="flex gap-2">
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg shadow-sm text-white font-bold hover:bg-slate-800 transition-all">
                    <Download className="w-4 h-4"/> Download PDF
                </button>
                {isSpeaking ? (
                    <button onClick={() => { handleStop(); setIsSpeaking(false); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                        <StopCircle className="w-5 h-5"/>
                    </button>
                ) : (
                    <button onClick={() => { handleSpeak(); setIsSpeaking(true); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                        <Volume2 className="w-5 h-5"/>
                    </button>
                )}
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap font-serif leading-relaxed p-6 bg-white rounded-xl shadow-inner border border-slate-100 h-[600px] overflow-y-auto">
              {generatedDoc}
            </div>
            <LegalDisclaimer />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Document preview will appear here</p>
            <p className="text-sm">Fill the details to generate your draft</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default DocumentGenerator;
