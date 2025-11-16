import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Users, 
  Gavel, 
  Home, 
  Loader2,
  Star,
  BookUser,
  Medal,
  LogIn,
  LogOut,
  Download,
  Volume2,
  StopCircle,
  Scroll,
  Scale, 
  CalendarDays, 
  Landmark,
  MessageSquare,
  ChevronRight,
  LifeBuoy,
  History,
  Mic,
  Search,
  Shield,
  Clock,
  Zap,
  Globe,
  FileSearch,
  Upload,
  Bookmark
} from 'lucide-react';
import { db, auth } from './firebase';
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData, addDoc, serverTimestamp, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import jsPDF from 'jspdf';
import ipcData from './data/ipc.json';
import penaltyData from './data/penalties.json';
import casesData from './data/cases.json';
import constitutionalRightsData from './data/constitutional-rights.json';

const LegalDisclaimer = () => (
  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg my-4" role="alert">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.031-1.742 3.031H4.42c-1.53 0-2.493-1.697-1.743-3.031l5.58-9.92zM10 13a1 1 0 100-2 1 1 0 000 2zm-1-3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium">Important Disclaimer</h3>
        <div className="text-sm mt-1">
          This content is AI-generated for informational purposes only and does not constitute legal advice. Always consult a qualified legal professional for advice on your specific situation.
        </div>
      </div>
    </div>
  </div>
);

const HomePage = ({ onNavClick }: { onNavClick: (page: string) => void }) => {
  const features1 = [
    { title: "AI-Powered Explanations", description: "Complex legal jargon transformed into crystal-clear explanations.", icon: "Chat", color: "blue", action: () => onNavClick('predict') },
    { title: "Multi-Language Voice", description: "Speak naturally in Hindi, English, or 15+ regional languages.", icon: "Mic", color: "green", action: () => onNavClick('voice') },
    { title: "Smart Document Analysis", description: "Upload legal documents and receive AI-generated summaries.", icon: "File", color: "purple", action: () => onNavClick('analyze') },
    { title: "Instant IPC Lookup", description: "Lightning-fast access to 500+ Indian Penal Code sections.", icon: "Search", color: "orange", action: () => onNavClick('ipc') },
    { title: "Penalty Calculator", description: "Precise penalty information with case precedents.", icon: "Scale", color: "red", action: () => onNavClick('penalties') },
    { title: "Case Law Database", description: "Access to 10,000+ legal precedents with AI-curated cases.", icon: "Book", color: "indigo", action: () => onNavClick('cases') },
  ];
  
  const features2 = [
    { title: "Constitutional Rights", description: "Comprehensive guide to fundamental rights.", icon: "Shield", color: "teal", action: null },
    { title: "24/7 AI Assistant", description: "Round-the-clock legal guidance with sub-2-second responses.", icon: "Clock", color: "pink", action: () => onNavClick('predict') },
    { title: "Bookmarks & History", description: "Save and organize your favorite legal references.", icon: "BookUser", color: "indigo", action: () => onNavClick('bookmarks') },
    { title: "Document Generator", description: "Generate customized legal documents with AI assistance.", icon: "Brain", color: "orange", action: () => onNavClick('documents') },
    { title: "Instant Alerts", description: "Real-time notifications about legal updates and deadlines.", icon: "Zap", color: "yellow", action: null },
    { title: "Community Forum", description: "Connect with legal experts and citizens for collaboration.", icon: "Users", color: "purple", action: null },
  ];

  const FeatureCard = ({ title, description, icon, color, action }: any) => {
    const icons: { [key: string]: React.ElementType } = {
      Chat: FileText,
      Mic: Mic,
      File: FileSearch,
      Search: Search,
      Scale: Scale,
      Book: BookUser,
      Shield: Shield,
      Clock: Clock,
      Brain: BrainCircuit,
      Zap: Zap,
      Globe: Globe,
      Users: Users,
    };
    const IconComponent = icons[icon] || Gavel;
    const colorClasses: { [key: string]: string } = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600",
      teal: "bg-teal-100 text-teal-600",
      pink: "bg-pink-100 text-pink-600",
      yellow: "bg-yellow-100 text-yellow-600",
    };

    const cardContent = (
      <>
        <div className={`w-14 h-14 ${colorClasses[color]} rounded-xl flex items-center justify-center mb-5`}>
          <IconComponent className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>
      </>
    );

    if (action) {
      return (
        <button 
          onClick={action}
          className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 text-left w-full"
        >
          {cardContent}
          <div className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Get Started &rarr;
          </div>
        </button>
      );
    }

    return (
      <div 
        className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 text-left opacity-70"
      >
        {cardContent}
        <div className="font-semibold text-slate-400">
          Coming Soon
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-24 py-10">
      <section className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
          Decode Indian Law with
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            AI Precision
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
          Transform complex legal documents into crystal-clear explanations.
          Your intelligent legal companion for every citizen.
        </p>
        <button 
          onClick={() => onNavClick('predict')}
          className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-all text-lg flex items-center gap-2 mx-auto"
        >
          Start Legal Query <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      <section>
        <h2 className="text-4xl font-bold text-slate-900 mb-10 text-center">
          Revolutionary Features for Modern Legal Understanding
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features1.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-4xl font-bold text-slate-900 mb-10 text-center">
          A Comprehensive Legal Toolkit
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features2.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
};

const DocumentGenerator = () => {
  const [docType, setDocType] = useState('rental-agreement');
  const [formData, setFormData] = useState<any>({});
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const { currentUser } = useAuth();

  const handleSpeak = () => {
    if (!generatedDoc) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(generatedDoc);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Generated Legal Document", 14, 22);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(generatedDoc, 180);
    doc.text(splitText, 14, 35);
    doc.save("NyaySaathi_Document.pdf");
  };

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
              <label className="block text-sm font-medium text-slate-700 mb-2">Landlord's Full Name</label>
              <input name="landlordName" onChange={handleInputChange} placeholder="Enter landlord's name" className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tenant's Full Name</label>
              <input name="tenantName" onChange={handleInputChange} placeholder="Enter tenant's name" className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </>
        );
      case 'divorce-papers':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Spouse 1 Full Name</label>
              <input name="spouse1Name" onChange={handleInputChange} placeholder="Enter spouse 1's name" className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Spouse 2 Full Name</label>
              <input name="spouse2Name" onChange={handleInputChange} placeholder="Enter spouse 2's name" className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </>
        );
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedDoc('');
    setError(null);
    try {
      const response = await fetch('http://localhost:8001/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: docType, formData: formData })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate document');
      }
      const { text } = await response.json();
      setGeneratedDoc(text);

      if (currentUser) {
        const historyRef = collection(db, 'history', currentUser.uid, 'queries');
        await addDoc(historyRef, {
          type: "Document Generation",
          query: `Generated: ${docType}`,
          response: text,
          createdAt: serverTimestamp()
        });
      }

    } catch (err: any) { 
      setError(err.message); 
    } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">AI Document Generator</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
          <select id="docType" value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="rental-agreement">Rental Agreement</option>
            <option value="divorce-papers">Divorce Papers (Mutual Consent)</option>
          </select>
        </div>
        <div className="space-y-4">{getFormFields()}</div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-slate-400 flex items-center justify-center">
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Generate Document'}
        </button>
      </form>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && <div className="text-center p-10 text-slate-600"><Loader2 className="animate-spin w-10 h-10 mx-auto mb-3" />Generating...</div>}
      {generatedDoc && (
        <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-3xl font-semibold text-slate-900">Generated Document Draft</h3>
            <div className="flex gap-3">
              {isSpeaking ? (
                <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                  <StopCircle className="w-5 h-5" /> Stop
                </button>
              ) : (
                <button onClick={handleSpeak} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium">
                  <Volume2 className="w-5 h-5" /> Speak
                </button>
              )}
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>
          </div>
          <LegalDisclaimer />
          <pre className="bg-slate-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm text-slate-700 border border-slate-200">{generatedDoc}</pre>
        </div>
      )}
    </div>
  );
};

const DocumentAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { currentUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSpeak = () => {
    if (!summary) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleDownloadPDF = () => {
    if (!summary) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Document Summary", 14, 22);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(summary, 180);
    doc.text(splitText, 14, 35);
    doc.save("NyaySaathi_Summary.pdf");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { 
      setError("Please select a file to upload."); 
      return; 
    }
    
    setIsLoading(true);
    setSummary('');
    setError(null);
    
    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await fetch('http://localhost:8001/api/upload-and-summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to summarize document');
      }
      const { text } = await response.json();
      setSummary(text);

      if (currentUser) {
        const historyRef = collection(db, 'history', currentUser.uid, 'queries');
        await addDoc(historyRef, {
          type: "Document Analysis",
          query: `Analyzed: ${selectedFile.name}`,
          response: text,
          createdAt: serverTimestamp()
        });
      }

    } catch (err: any) { 
      setError(err.message); 
    } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-2 text-center">Smart Document Analysis</h2>
      <p className="text-lg text-slate-600 mb-6 text-center">Upload your legal document (PDF or TXT) to get a simple, clear summary.</p>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload your document</label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <div className="mt-4 flex text-sm leading-6 text-slate-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-slate-500">PDF or TXT up to 10MB</p>
            </div>
          </div>
          {selectedFile && (
            <div className="mt-4 text-center text-sm text-green-700 font-medium">
              Selected file: {selectedFile.name}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-md disabled:hover:translate-y-0 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Analyze Document'}
        </button>
      </form>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && <div className="text-center p-10 text-slate-600"><Loader2 className="animate-spin w-10 h-10 mx-auto mb-3" />Analyzing...</div>}
      
      {summary && (
        <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-3xl font-semibold text-slate-900">Document Summary</h3>
            <div className="flex gap-3">
              {isSpeaking ? (
                <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                  <StopCircle className="w-5 h-5" /> Stop
                </button>
              ) : (
                <button onClick={handleSpeak} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium">
                  <Volume2 className="w-5 h-5" /> Speak
                </button>
              )}
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>
          </div>
          <LegalDisclaimer />
          <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap">{summary}</div>
        </div>
      )}
    </div>
  );
};

const CasePredictor = () => {
  const [caseDescription, setCaseDescription] = useState('');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (caseDescription.trim().length < 20) { 
      setError("Please provide a more detailed description (at least 20 characters)."); 
      return; 
    }
    setIsLoading(true);
    setPredictionResult(null);
    setError(null);
    try {
      const response = await fetch('http://localhost:8001/api/predict-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDescription: caseDescription })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze case');
      }
      const result = await response.json();
      setPredictionResult(result);

      if (currentUser) {
        const historyRef = collection(db, 'history', currentUser.uid, 'queries');
        await addDoc(historyRef, {
          type: "AI Query",
          query: caseDescription,
          response: result.text,
          sources: result.sources || [],
          createdAt: serverTimestamp()
        });
      }

    } catch (err: any) { 
      setError(err.message); 
    } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    try {
      const initial = localStorage.getItem('nyaysaathi_initial_query');
      if (initial && initial.trim().length > 0) {
        setCaseDescription(initial);
        localStorage.removeItem('nyaysaathi_initial_query');
      }
    } catch (e) {}
  }, []);

  const handleDownloadPDF = () => {
    if (!predictionResult?.text) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AI Case Analysis", 14, 22);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(predictionResult.text, 180);
    doc.text(splitText, 14, 35);
    doc.save("NyaySaathi_Case_Analysis.pdf");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-2 text-center">AI Legal Query</h2>
      <p className="text-lg text-slate-600 mb-6 text-center">Get AI-Powered Explanations & Case Insights</p>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Ask your legal question</label>
          <textarea 
            value={caseDescription} 
            onChange={(e) => setCaseDescription(e.target.value)} 
            placeholder="e.g., What is the punishment for theft in India? OR I was in a car accident where the other driver ran a red light..." 
            className="w-full h-48 p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-md disabled:hover:translate-y-0 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Get Legal Explanation'}
        </button>
      </form>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && <div className="text-center p-10 text-slate-600"><Loader2 className="animate-spin w-10 h-10 mx-auto mb-3" />Analyzing...</div>}
      {predictionResult && (
        <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-3xl font-semibold text-slate-900">AI-Generated Response</h3>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">
              <Download className="w-5 h-5" /> Download PDF
            </button>
          </div>
          <LegalDisclaimer />
          <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap">{predictionResult.text}</div>
          {predictionResult.sources && predictionResult.sources.length > 0 && (
            <div className="mt-8">
              <h4 className="text-2xl font-semibold text-slate-900 mb-4">Related Public Sources</h4>
              <ul className="list-disc pl-5 space-y-3">
                {predictionResult.sources.map((source: any, index: number) => (
                  <li key={index}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{source.title || 'View Source'}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MultiLanguageVoice = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lang, setLang] = useState('en-IN');

  // Web Speech API compatibility
  const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = lang;

    r.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      setTranscript((prev) => (prev + ' ' + final + ' ' + interim).trim());
    };

    r.onerror = (e: any) => {
      console.warn('Speech recognition error', e);
      setIsListening(false);
    };
    recognitionRef.current = r;
    return () => {
      try { r.stop(); } catch (e) {}
    };
  }, [SpeechRecognition, lang]);

  const startListening = () => {
    if (!SpeechRecognition) return alert('Speech Recognition not supported in this browser.');
    try {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn(e);
    }
  };
  const stopListening = () => {
    try { recognitionRef.current.stop(); } catch (e) {}
    setIsListening(false);
  };

  const playText = () => {
    if (!('speechSynthesis' in window)) return alert('Text-to-speech not supported in this browser.');
    const utter = new SpeechSynthesisUtterance(transcript || '');
    utter.lang = lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const sendToAI = () => {
    if (!transcript || transcript.trim().length < 5) return alert('Please speak or enter some text first.');
    // save to localStorage for CasePredictor to pick up
    localStorage.setItem('nyaysaathi_initial_query', transcript.trim());
    onNavigate('predict');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Multi-Language Voice Assistant</h2>
      <p className="text-slate-600 text-center mb-6">Speak in your preferred language and send the transcribed query to the AI assistant.</p>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
        <label className="block text-sm font-medium text-slate-700">Language</label>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg mb-4">
          <option value="en-IN">English (India)</option>
          <option value="hi-IN">Hindi</option>
          <option value="mr-IN">Marathi</option>
          <option value="bn-IN">Bengali</option>
          <option value="ta-IN">Tamil</option>
          <option value="te-IN">Telugu</option>
          <option value="kn-IN">Kannada</option>
        </select>

        <div className="flex gap-3 mb-3">
          {!isListening ? (
            <button onClick={startListening} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">Start Listening</button>
          ) : (
            <button onClick={stopListening} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg">Stop</button>
          )}
          <button onClick={() => { setTranscript(''); }} className="px-4 py-2 bg-slate-100 rounded-lg">Clear</button>
          <button onClick={playText} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">Play</button>
          <button onClick={sendToAI} className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg">Send to AI</button>
        </div>

        <label className="block text-sm font-medium text-slate-700">Transcript</label>
        <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={6} className="w-full p-3 border border-slate-300 rounded-lg" />

        <div className="text-sm text-slate-500">Hint: Press Start and speak clearly. When done, press Stop then Send to AI.</div>
      </div>
    </div>
  );
};

const IPCLookup = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>([]);

  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setResults(ipcData.slice(0, 50));
      setSelected(null);
      return;
    }
    const matches = ipcData.filter(item => (
      item.section.toString().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      (item.short || '').toLowerCase().includes(q) ||
      (item.keywords || []).some((k:any) => k.toLowerCase().includes(q)) ||
      (item.description || '').toLowerCase().includes(q)
    ));
    setResults(matches);
    setSelected(matches[0] || null);
  }, [searchTerm]);

  useEffect(() => {
    if (!currentUser) return;
    const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
    const bookmarkQuery = query(bookmarksRef);
    const unsubscribe = onSnapshot(bookmarkQuery, (snapshot) => {
      const bookmarked = snapshot.docs
        .filter(doc => doc.data().type === 'IPC Section')
        .map(doc => doc.data().data.section);
      setBookmarkedSections(bookmarked);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const addBookmark = async () => {
    if (!currentUser) { alert('Please log in to bookmark'); return; }
    if (!selected) return;
    try {
      const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
      await addDoc(bookmarksRef, {
        type: 'IPC Section',
        data: selected,
        createdAt: serverTimestamp()
      });
      alert('Bookmarked!');
    } catch (err) {
      console.error('Error bookmarking:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const downloadCSV = () => {
    const rows = results.map(r => (`"${r.section}","${(r.title||'').replace(/"/g,'""')}","${(r.short||'').replace(/"/g,'""')}","${(r.description||'').replace(/"/g,'""')}"`));
    const csv = 'section,title,short,description\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ipc_lookup.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Instant IPC Lookup</h2>
      <p className="text-slate-600 text-center mb-6">Search Indian Penal Code sections quickly. This is informational only; consult a legal professional for advice.</p>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex gap-4 mb-4">
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by section number, title or keywords" className="flex-1 p-3 border border-slate-300 rounded-lg" />
          <button onClick={() => { setSearchTerm(''); }} className="px-4 py-2 bg-slate-100 rounded-lg">Clear</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Download CSV</button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h4 className="text-lg font-semibold mb-3">Results ({results.length})</h4>
            <div className="space-y-3 max-h-96 overflow-auto">
              {results.map((r, idx) => (
                <button key={idx} onClick={() => setSelected(r)} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div className="font-semibold">Section {r.section} — {r.short}</div>
                  <div className="text-sm text-slate-500">{r.title}</div>
                </button>
              ))}
              {results.length === 0 && <div className="text-slate-500">No results</div>}
            </div>
          </div>

          <div className="md:col-span-2">
            {selected ? (
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Section {selected.section} — {selected.title}</h3>
                    <div className="text-sm text-slate-500 mt-1">{selected.short}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => copyToClipboard(`Section ${selected.section}: ${selected.title}\n\n${selected.description}`)} className="px-4 py-2 bg-slate-100 rounded-lg">Copy</button>
                    <button onClick={() => {
                      const doc = new jsPDF();
                      doc.setFontSize(14);
                      doc.text(`Section ${selected.section} - ${selected.title}`, 14, 20);
                      doc.setFontSize(11);
                      const split = doc.splitTextToSize(selected.description, 180);
                      doc.text(split, 14, 35);
                      doc.save(`IPC_${selected.section}.pdf`);
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Export PDF</button>
                    <button onClick={addBookmark} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 ${bookmarkedSections.includes(selected.section) ? 'bg-yellow-100 text-yellow-700' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                      <Bookmark className="w-4 h-4" /> {bookmarkedSections.includes(selected.section) ? 'Bookmarked' : 'Bookmark'}
                    </button>
                  </div>
                </div>

                <div className="mt-6 prose prose-lg text-slate-700 whitespace-pre-wrap">{selected.description}</div>
              </div>
            ) : (
              <div className="text-slate-500">Select a section to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CaseLawDatabase = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('year');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [bookmarkedCases, setBookmarkedCases] = useState<string[]>([]);

  const categories = ['All', ...new Set(casesData.map((c: any) => c.category))];

  useEffect(() => {
    if (!currentUser) return;
    const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
    const bookmarkQuery = query(bookmarksRef);
    const unsubscribe = onSnapshot(bookmarkQuery, (snapshot) => {
      const bookmarked = snapshot.docs
        .filter(doc => doc.data().type === 'Case')
        .map(doc => doc.data().data.id);
      setBookmarkedCases(bookmarked);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const addBookmark = async () => {
    if (!currentUser) { alert('Please log in to bookmark'); return; }
    if (!selectedCase) return;
    try {
      const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
      await addDoc(bookmarksRef, {
        type: 'Case',
        data: selectedCase,
        createdAt: serverTimestamp()
      });
      alert('Bookmarked!');
    } catch (err) {
      console.error('Error bookmarking:', err);
    }
  };

  const filteredCases = casesData.filter((c: any) => {
    const matchesSearch = searchQuery.trim() === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.relatedSections.some((s: string) => s.includes(searchQuery));
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === 'year') return b.year - a.year;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'court') return a.court.localeCompare(b.court);
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Case Law Database</h2>
      <p className="text-slate-600 text-center mb-6">Search landmark Indian court cases, their rulings, and impact on law.</p>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case name, summary or section"
            className="flex-1 p-3 border border-slate-300 rounded-lg"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg"
          >
            <option value="year">Year (Latest First)</option>
            <option value="title">Title (A-Z)</option>
            <option value="court">Court</option>
          </select>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="px-4 py-2 bg-slate-100 rounded-lg">
            Clear
          </button>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-600">
          Showing {sortedCases.length} of {casesData.length} cases
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Case list */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-semibold mb-3">Cases</h4>
            <div className="space-y-2 max-h-96 overflow-auto">
              {sortedCases.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedCase?.id === c.id
                      ? 'bg-indigo-100 border-indigo-300'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-sm">{c.title}</div>
                  <div className="text-xs text-slate-500">{c.year} — {c.court}</div>
                </button>
              ))}
              {sortedCases.length === 0 && (
                <div className="text-slate-500 py-4">No cases found</div>
              )}
            </div>
          </div>

          {/* Case details */}
          <div className="md:col-span-2">
            {selectedCase ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedCase.title}</h3>
                    <div className="text-sm text-slate-600 mt-2 space-y-1">
                      <div><strong>Court:</strong> {selectedCase.court}</div>
                      <div><strong>Year:</strong> {selectedCase.year}</div>
                      <div><strong>Case No:</strong> {selectedCase.caseNumber}</div>
                      <div><strong>Category:</strong> {selectedCase.category}</div>
                    </div>
                  </div>
                  <button onClick={addBookmark} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 whitespace-nowrap ${bookmarkedCases.includes(selectedCase.id) ? 'bg-yellow-100 text-yellow-700' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                    <Bookmark className="w-4 h-4" /> {bookmarkedCases.includes(selectedCase.id) ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
                  <p className="text-slate-700 text-sm">{selectedCase.summary}</p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Key Holding</h4>
                  <p className="text-slate-700 text-sm">{selectedCase.keyholding}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Related IPC Sections</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.relatedSections.map((section: string) => (
                      <span key={section} className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium">
                        Section {section}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Legal Impact</h4>
                  <p className="text-slate-700 text-sm">{selectedCase.impact}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = `${selectedCase.title}\nYear: ${selectedCase.year}\nCourt: ${selectedCase.court}\nCase No: ${selectedCase.caseNumber}\n\nSummary: ${selectedCase.summary}\n\nKey Holding: ${selectedCase.keyholding}\n\nImpact: ${selectedCase.impact}`;
                      navigator.clipboard.writeText(text);
                      alert('Copied to clipboard');
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Copy Case Details
                  </button>
                  <button
                    onClick={() => {
                      const doc = new jsPDF();
                      doc.setFontSize(14);
                      doc.text(selectedCase.title, 14, 20);
                      doc.setFontSize(10);
                      doc.text(`${selectedCase.year} | ${selectedCase.court}`, 14, 30);
                      doc.setFontSize(11);
                      doc.text('Summary:', 14, 45);
                      const summary = doc.splitTextToSize(selectedCase.summary, 180);
                      doc.text(summary, 14, 50);
                      const summaryHeight = summary.length * 5;
                      doc.text('Key Holding:', 14, 50 + summaryHeight + 10);
                      const holding = doc.splitTextToSize(selectedCase.keyholding, 180);
                      doc.text(holding, 14, 55 + summaryHeight + 10);
                      doc.save(`${selectedCase.title.replace(/\s+/g, '_')}.pdf`);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Export PDF
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg text-sm">
                  <strong>Note:</strong> This is a curated selection of landmark cases. For comprehensive legal research and current case status, consult official court databases and legal professionals.
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-10">Select a case to view full details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PenaltyCalculator = () => {
  const { currentUser } = useAuth();
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [searchSection, setSearchSection] = useState('');
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>([]);

  const filteredPenalties = penaltyData.filter(p =>
    p.section.toString().includes(searchSection) ||
    p.title.toLowerCase().includes(searchSection.toLowerCase())
  );

  useEffect(() => {
    if (!currentUser) return;
    const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
    const bookmarkQuery = query(bookmarksRef);
    const unsubscribe = onSnapshot(bookmarkQuery, (snapshot) => {
      const bookmarked = snapshot.docs
        .filter(doc => doc.data().type === 'Penalty')
        .map(doc => doc.data().data.section);
      setBookmarkedSections(bookmarked);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const addBookmark = async () => {
    if (!currentUser) { alert('Please log in to bookmark'); return; }
    if (!selectedSection) return;
    try {
      const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
      await addDoc(bookmarksRef, {
        type: 'Penalty',
        data: selectedSection,
        createdAt: serverTimestamp()
      });
      alert('Bookmarked!');
    } catch (err) {
      console.error('Error bookmarking:', err);
    }
  };

  const formatPenalty = (val: any) => {
    if (val === 'life') return 'Life Imprisonment';
    if (val === 'unlimited') return 'Unlimited Fine';
    if (typeof val === 'number') {
      if (val < 1) return Math.round(val * 12) + ' months';
      return val + ' years';
    }
    return val;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Penalty Calculator</h2>
      <p className="text-slate-600 text-center mb-6">Select an IPC section to view applicable penalties, factors affecting sentencing, and case examples.</p>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex gap-4 mb-4">
          <input
            value={searchSection}
            onChange={(e) => setSearchSection(e.target.value)}
            placeholder="Search by section or title"
            className="flex-1 p-3 border border-slate-300 rounded-lg"
          />
          <button onClick={() => setSearchSection('')} className="px-4 py-2 bg-slate-100 rounded-lg">Clear</button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h4 className="text-lg font-semibold mb-3">Sections ({filteredPenalties.length})</h4>
            <div className="space-y-2 max-h-96 overflow-auto">
              {filteredPenalties.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSection(p)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedSection?.section === p.section
                      ? 'bg-blue-100 border-blue-300'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold">Section {p.section}</div>
                  <div className="text-sm text-slate-500 truncate">{p.title}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedSection ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Section {selectedSection.section} — {selectedSection.title}</h3>
                    <p className="text-slate-600 mt-2">{selectedSection.description}</p>
                  </div>
                  <button onClick={addBookmark} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 whitespace-nowrap ${bookmarkedSections.includes(selectedSection.section) ? 'bg-yellow-100 text-yellow-700' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                    <Bookmark className="w-4 h-4" /> {bookmarkedSections.includes(selectedSection.section) ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-900 mb-4">Penalty Range</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-orange-100">
                      <div className="text-sm text-slate-600 font-medium">Imprisonment</div>
                      <div className="text-lg font-bold text-orange-700 mt-1">
                        {selectedSection.imprisonmentMin === 0 && selectedSection.imprisonmentMax === 'life'
                          ? 'Up to Life or may be Nil'
                          : `${formatPenalty(selectedSection.imprisonmentMin)} to ${formatPenalty(selectedSection.imprisonmentMax)}`}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-100">
                      <div className="text-sm text-slate-600 font-medium">Fine</div>
                      <div className="text-lg font-bold text-orange-700 mt-1">
                        ₹{selectedSection.fineMin === 0 ? '0' : selectedSection.fineMin} to {formatPenalty(selectedSection.fineMax)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Factors Affecting Sentencing</h4>
                  <ul className="space-y-2">
                    {selectedSection.factors?.map((factor: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className="text-slate-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Case Examples</h4>
                  <div className="space-y-3">
                    {selectedSection.examples?.map((example: string, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                        <span className="font-medium text-slate-900">Example {idx + 1}:</span> {example}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg text-sm">
                  <strong>Disclaimer:</strong> This information is for educational purposes only. Actual penalties vary based on specific case facts, evidence, judge's discretion, and applicable laws. Always consult a legal professional.
                </div>

                <button
                  onClick={() => {
                    const text = `Section ${selectedSection.section}: ${selectedSection.title}\n\n${selectedSection.description}\n\nPenalty Range:\nImprisonment: ${formatPenalty(selectedSection.imprisonmentMin)} to ${formatPenalty(selectedSection.imprisonmentMax)}\nFine: ₹${selectedSection.fineMin} to ${formatPenalty(selectedSection.fineMax)}\n\nFactors: ${selectedSection.factors?.join(', ')}\n\nExamples: ${selectedSection.examples?.join('; ')}`;
                    navigator.clipboard.writeText(text);
                    alert('Copied to clipboard');
                  }}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Copy Information
                </button>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-10">Select a section to view penalty details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdvocateFinder = () => {
  const [allLawyers, setAllLawyers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const q = query(collection(db, "advocates"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lawyers: any[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        lawyers.push({ id: doc.id, ...doc.data() });
      });
      setAllLawyers(lawyers);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError("Failed to load advocates.");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cities = ['All', ...new Set(allLawyers.map(l => l.city))];
  const specialties = ['All', ...new Set(allLawyers.map(l => l.specialty))];
  const filteredLawyers = allLawyers.filter(lawyer => 
    (cityFilter === 'All' || lawyer.city === cityFilter) &&
    (specialtyFilter === 'All' || lawyer.specialty === specialtyFilter)
  );

  const LawyerProfileCard = ({ lawyer }: { lawyer: any }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
      <img 
        src={lawyer.imageUrl} 
        alt={lawyer.name} 
        className="w-28 h-28 rounded-full border-4 border-slate-100 shadow-md"
        onError={(e: any) => e.target.src = 'https://placehold.co/112x112/E2E8F0/4A5568?text=Profile'}
      />
      <div className="flex-1">
        <h3 className="text-3xl font-bold text-slate-900">{lawyer.name}</h3>
        <p className="text-green-600 font-semibold text-lg mb-2">{lawyer.specialty}</p>
        <p className="text-slate-500 mb-4">{lawyer.city}</p>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full"><Medal className="w-4 h-4" /><strong>{lawyer.experience}</strong> Years Exp.</div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full"><Gavel className="w-4 h-4" /><strong>{lawyer.casesWon}</strong> Cases Won</div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full"><Star className="w-4 h-4" /><strong>{lawyer.rating}</strong>/5.0 Rating</div>
        </div>
      </div>
      <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all">
        View Profile
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">Find an Advocate</h2>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-10 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="cityFilter" className="block text-sm font-medium text-slate-700 mb-2">City:</label>
          <select id="cityFilter" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="specialtyFilter" className="block text-sm font-medium text-slate-700 mb-2">Specialty:</label>
          <select id="specialtyFilter" value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
          </select>
        </div>
      </div>
      
      {isLoading && <div className="text-center p-10"><Loader2 className="animate-spin w-10 h-10 mx-auto text-blue-600" /></div>}
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {!isLoading && !error && (
        <div className="space-y-8">
          {filteredLawyers.length > 0 ? (
            filteredLawyers.map(lawyer => <LawyerProfileCard key={lawyer.id} lawyer={lawyer} />)
          ) : (
            <p className="text-center text-slate-600 text-lg p-10 bg-white rounded-2xl shadow-lg border border-slate-200">No lawyers found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};

const VerdictCard = ({ verdict }: { verdict: any }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const ttsText = `Case: ${verdict.caseName}. Court: ${verdict.court}. Date: ${verdict.date}. Summary: ${verdict.summary}`;

  const handleSpeak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-xl p-4">
          <Scale className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{verdict.caseName}</h3>
          <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1 text-sm text-slate-600 mb-4">
            <span className="flex items-center gap-1.5 font-medium"><Landmark className="w-4 h-4" /> {verdict.court}</span>
            <span className="flex items-center gap-1.5 font-medium"><CalendarDays className="w-4 h-4" /> {verdict.date}</span>
          </div>
          <p className="text-slate-700 leading-relaxed"><strong className="font-semibold text-slate-900">Summary:</strong> {verdict.summary}</p>
        </div>
      </div>
      <div className="mt-5 pt-5 border-t border-slate-100 flex justify-end">
        {isSpeaking ? (
          <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm">
            <StopCircle className="w-5 h-5" /> Stop
          </button>
        ) : (
          <button onClick={handleSpeak} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-sm">
            <Volume2 className="w-5 h-5" /> Read Aloud
          </button>
        )}
      </div>
    </div>
  );
};

const parseVerdicts = (text: string): any[] => {
  try {
    if (!text || text.trim() === '') return [];

    // Case A: markdown table with a header containing 'Case Name'
    if (/\|\s*Case Name\s*\|/i.test(text)) {
      const lines = text.split('\n').map((l) => l.trim()).filter((l) => l !== '');
      // find header line index (line with Case Name) and ensure next line is the separator
      let headerIndex = lines.findIndex((l, i) => /\|\s*Case Name\s*\|/i.test(l) && i + 1 < lines.length && /^\|?\s*[-:]+/.test(lines[i + 1] || ''));
      if (headerIndex === -1) {
        headerIndex = lines.findIndex((l) => l.startsWith('|'));
      }
      const results: any[] = [];
      if (headerIndex !== -1) {
        // data rows start after header + separator
        for (let i = headerIndex + 2; i < lines.length; i++) {
          const ln = lines[i];
          if (!ln.startsWith('|')) continue;
          const cols = ln.split('|').slice(1, -1).map((c) => c.trim());
          const caseName = cols[0] || 'N/A';
          const date = cols[1] || 'N/A';
          const court = cols[2] || 'N/A';
          const significance = cols.slice(3).join(' | ') || '';
          results.push({ caseName, court, date, summary: significance });
        }
        return results.map((r, idx) => ({ id: idx, caseName: r.caseName, court: r.court, date: r.date, summary: r.summary }));
      }
    }

    // Case B: existing bold-field format like '**Case Name:** ...\n**Court:** ...'
    if (/\*\*Case Name:\*\*/.test(text)) {
      const verdictBlocks = text.split(/\n(?=\d\.\s*\*\*Case Name:\*\*)/).map((b) => b.trim()).filter((b) => b !== '');
      return verdictBlocks.map((block, index) => {
        const caseName = block.match(/\*\*Case Name:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || `Verdict ${index + 1}`;
        const court = block.match(/\*\*Court:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || 'N/A';
        const date = block.match(/\*\*Date:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || 'N/A';
        const summary = block.match(/\*\*Summary:\*\* ([\s\S]*)/)?.[1]?.replace(/\*/g, '').trim() || block.trim();
        return { id: index, caseName, court, date, summary };
      });
    }

    // Case C: fallback - split by double newlines into reasonable chunks
    const possibleBlocks = text.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b !== '');
    if (possibleBlocks.length > 1) {
      return possibleBlocks.map((block, index) => ({
        id: index,
        caseName: block.split('\n')[0].slice(0, 120),
        court: 'N/A',
        date: 'N/A',
        summary: block,
      }));
    }

    // Final fallback: return the full text as a single verdict summary
    return [{ id: 0, caseName: 'Recent Verdicts', court: 'N/A', date: 'N/A', summary: text.trim() }];
  } catch (e) {
    console.error('Failed to parse verdicts:', e);
    return [{ id: 0, caseName: 'Recent Verdicts', court: 'N/A', date: 'N/A', summary: text }];
  }
};

const Bookmarks = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { currentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
    const q = query(bookmarksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookmarks(data as any[]);
      setIsLoading(false);
    }, (err) => {
      console.error('Error loading bookmarks:', err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const removeBookmark = async (bookmarkId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'bookmarks', bookmarkId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const addBookmark = async (type: string, data: any) => {
    if (!currentUser) {
      alert('Please log in to bookmark');
      return;
    }
    try {
      const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
      await addDoc(bookmarksRef, {
        type,
        data,
        createdAt: serverTimestamp()
      });
      alert('Bookmarked successfully!');
    } catch (err) {
      console.error('Error saving bookmark:', err);
    }
  };

  const types = ['All', 'IPC Section', 'Case', 'Penalty'];
  const filteredBookmarks = filterType === 'All' 
    ? bookmarks 
    : bookmarks.filter(b => b.type === filterType);

  const BookmarkCard = ({ bookmark }: { bookmark: any }) => {
    const { type, data, id } = bookmark;
    const createdAt = bookmark.createdAt?.toDate?.() || new Date();
    const dateStr = createdAt.toLocaleDateString();

    return (
      <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-lg transition-all">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-1">{type}</div>
            {type === 'IPC Section' && (
              <>
                <h4 className="text-lg font-semibold text-slate-900">Section {data.section}</h4>
                <p className="text-sm text-slate-600">{data.title}</p>
              </>
            )}
            {type === 'Case' && (
              <>
                <h4 className="text-lg font-semibold text-slate-900">{data.title}</h4>
                <p className="text-sm text-slate-600">{data.court} ({data.year})</p>
              </>
            )}
            {type === 'Penalty' && (
              <>
                <h4 className="text-lg font-semibold text-slate-900">Section {data.section}</h4>
                <p className="text-sm text-slate-600">{data.title}</p>
              </>
            )}
            <div className="text-xs text-slate-500 mt-2">Saved on {dateStr}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (type === 'IPC Section') onNavigate('ipc');
                else if (type === 'Case') onNavigate('cases');
                else if (type === 'Penalty') onNavigate('penalty');
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
            >
              View
            </button>
            <button
              onClick={() => removeBookmark(id)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">My Bookmarks</h2>
      <p className="text-slate-600 text-center mb-6">Save and organize your favorite IPC sections, cases, and penalties for quick reference.</p>

      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin w-10 h-10 mx-auto text-blue-600" />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex gap-2 mb-6 flex-wrap">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t} ({filterType === t ? filteredBookmarks.length : bookmarks.filter(b => t === 'All' || b.type === t).length})
              </button>
            ))}
          </div>

          {filteredBookmarks.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredBookmarks.map(bookmark => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No bookmarks yet</p>
              <p className="text-sm mt-2">Explore IPC sections, cases, and penalties to start bookmarking</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RecentVerdicts = () => {
  const [verdicts, setVerdicts] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerdicts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8001/api/recent-verdicts');
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to fetch verdicts');
        }
        const result = await response.json();
        // Prefer structured verdicts from backend when available
        if (result.verdicts && Array.isArray(result.verdicts) && result.verdicts.length > 0) {
          // Normalize items to expected shape
          const normalized = result.verdicts.map((v: any, idx: number) => ({
            id: v.id ?? idx,
            caseName: v.caseName || v.title || `Verdict ${idx + 1}`,
            court: v.court || 'N/A',
            date: v.date || 'N/A',
            summary: v.summary || v.description || v.content || '',
          }));
          setVerdicts(normalized);
          setSources(result.sources || []);
        } else {
          const parsedVerdicts = parseVerdicts(result.text || '');
          setVerdicts(parsedVerdicts);
          setSources(result.sources || []);
        }
      } catch (err: any) { 
        setError(err.message); 
      } 
      finally { setIsLoading(false); }
    };
    fetchVerdicts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">Recent Indian Court Verdicts</h2>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && (
        <div className="text-center p-10 text-slate-600">
          <Loader2 className="animate-spin w-10 h-10 mx-auto mb-3 text-blue-600" />
          Fetching latest verdicts...
        </div>
      )}
      {!isLoading && !error && (
        <div className="space-y-8">
          <LegalDisclaimer />
          {verdicts.map((verdict) => (
            <VerdictCard key={verdict.id} verdict={verdict} />
          ))}
          {sources.length > 0 && (
            <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
              <h4 className="text-2xl font-semibold text-slate-900 mb-4">Sources</h4>
              <ul className="list-disc pl-5 space-y-3">
                {sources.map((source: any, index: number) => (
                  <li key={index}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{source.title || 'View Source'}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HistoryPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    const historyRef = collection(db, 'history', currentUser.uid, 'queries');
    const q = query(historyRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const historyData: any[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          historyData.push({ id: doc.id, ...doc.data() });
        });
        setHistory(historyData);
        setIsLoading(false);
      }, 
      (err) => {
        console.error("[Firestore] Error fetching history:", err);
        setError("Failed to load your history.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const HistoryCard = ({ item }: { item: any }) => {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          {item.type === "AI Query" && <BrainCircuit className="w-6 h-6 text-purple-600" />}
          {item.type === "Document Analysis" && <FileSearch className="w-6 h-6 text-purple-600" />}
          {item.type === "Document Generation" && <FileText className="w-6 h-6 text-blue-600" />}
          <h3 className="text-xl font-semibold text-slate-900">{item.type}</h3>
          <span className="text-sm text-slate-500">
            {item.createdAt ? new Date((item.createdAt as any).toDate()).toLocaleString() : 'Just now'}
          </span>
        </div>
        <p className="text-slate-600 mb-4 line-clamp-2"><strong className="text-slate-700">Your Query:</strong> {item.query}</p>
        <details>
          <summary className="font-medium text-blue-600 cursor-pointer">View Full Response</summary>
          <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap mt-4 border-t pt-4">
            {item.response}
          </div>
        </details>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">My History</h2>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {isLoading && (
        <div className="text-center p-10 text-slate-600">
          <Loader2 className="animate-spin w-10 h-10 mx-auto mb-3 text-blue-600" />
          Loading your history...
        </div>
      )}
      {!isLoading && !error && (
        <div className="space-y-8">
          {history.length > 0 ? (
            history.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))
          ) : (
            <p className="text-center text-slate-600 text-lg p-10 bg-white rounded-2xl shadow-lg border border-slate-200">
              You don't have any history yet. Try using "AI Query" or "Doc Analyzer" to see your results here!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Logged in successfully! Redirecting...');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Signed up successfully! You are now logged in.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="flex justify-center items-center gap-3 mb-6">
        <Gavel className="w-10 h-10 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-900 whitespace-nowrap">Nyay Saathi</h1>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6+ characters" required minLength={6} className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-slate-400 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-blue-600 hover:underline mt-6 font-medium">
        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
      </button>
      {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div>}
      {message && <div className="mt-6 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg">{message}</div>}
    </div>
  );
};

const ConstitutionalRights = () => {
  const [selectedCategory, setSelectedCategory] = useState('Fundamental Rights');
  const [selectedRight, setSelectedRight] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = constitutionalRightsData.map((cat: any) => cat.category);
  
  const currentCategory = constitutionalRightsData.find((cat: any) => cat.category === selectedCategory);
  
  let filteredRights = currentCategory?.rights || [];
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filteredRights = filteredRights.filter((right: any) =>
      right.article.toLowerCase().includes(q) ||
      right.title.toLowerCase().includes(q) ||
      right.description.toLowerCase().includes(q)
    );
  }

  const displayRight = selectedRight || (filteredRights.length > 0 ? filteredRights[0] : null);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Constitutional Rights Guide</h2>
      <p className="text-slate-600 text-center mb-6">Complete guide to fundamental rights, duties, and directive principles of Indian Constitution.</p>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedRight(null);
                setSearchTerm('');
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by article, title, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Rights list */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-semibold mb-3">Rights ({filteredRights.length})</h4>
            <div className="space-y-2 max-h-96 overflow-auto">
              {filteredRights.map((right: any) => (
                <button
                  key={right.article}
                  onClick={() => setSelectedRight(right)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    displayRight?.article === right.article
                      ? 'bg-blue-100 border-blue-300'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-sm">{right.article}</div>
                  <div className="text-xs text-slate-600 line-clamp-2">{right.title}</div>
                </button>
              ))}
              {filteredRights.length === 0 && (
                <div className="text-slate-500 text-center py-4">No results found</div>
              )}
            </div>
          </div>

          {/* Right details */}
          <div className="md:col-span-2">
            {displayRight ? (
              <div className="space-y-6">
                <div>
                  <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                    {displayRight.article}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{displayRight.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{displayRight.description}</p>
                </div>

                {displayRight.implications && displayRight.implications.length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">Key Implications</h4>
                    <ul className="space-y-2">
                      {displayRight.implications.map((impl: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span className="text-slate-700">{impl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {displayRight.examples && displayRight.examples.length > 0 && (
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h4 className="text-lg font-semibold text-green-900 mb-4">Landmark Cases</h4>
                    <ul className="space-y-3">
                      {displayRight.examples.map((example: string, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-green-100">
                          <p className="text-slate-700 text-sm">{example}</p>
                        </div>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const text = `${displayRight.article}: ${displayRight.title}\n\n${displayRight.description}\n\nImplications:\n${displayRight.implications?.join('\n')}\n\nCases:\n${displayRight.examples?.join('\n')}`;
                      navigator.clipboard.writeText(text);
                      alert('Copied to clipboard');
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Copy Details
                  </button>
                  <button
                    onClick={() => {
                      const doc = new jsPDF();
                      doc.setFontSize(14);
                      doc.text(`${displayRight.article} - ${displayRight.title}`, 14, 20);
                      doc.setFontSize(11);
                      const split = doc.splitTextToSize(displayRight.description, 180);
                      doc.text(split, 14, 35);
                      doc.save(`${displayRight.article}.pdf`);
                    }}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-10">Select a right to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('home');
  };
  
  const renderPage = () => {
    if (!currentUser) {
      return <AuthPage />;
    }
    
    switch (currentPage) {
      case 'docs':
      case 'documents':
        return <DocumentGenerator />;
      case 'analyze':
        return <DocumentAnalyzer />;
      case 'predict':
        return <CasePredictor />;
      case 'find':
        return <AdvocateFinder />;
      case 'voice':
        return <MultiLanguageVoice onNavigate={setCurrentPage} />;
      case 'ipc':
        return <IPCLookup />;
      case 'penalty':
      case 'penalties':
        return <PenaltyCalculator />;
      case 'cases':
        return <CaseLawDatabase />;
      case 'bookmarks':
        return <Bookmarks onNavigate={setCurrentPage} />;
      case 'verdicts':
        return <RecentVerdicts />;
      case 'history':
        return <HistoryPage />;
      case 'home':
      default:
        return <HomePage onNavClick={setCurrentPage} />;
    }
  };
  
  const NavButton = ({ page, label, icon: Icon, current }: { page: string, label: string, icon: any, current: string }) => {
    const isActive = currentPage === page;
    return (
      <button 
        onClick={() => setCurrentPage(page)} 
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
        {label}
      </button>
    );
  };
  
  const LogoutButton = () => (
    <button 
      onClick={handleLogout} 
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
    >
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {currentUser && (
        <header className="bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200 mb-8 sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <Gavel className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Nyay Saathi</h1>
            </div>
            
            <div className="flex items-center divide-x divide-slate-200">
              <div className="flex flex-wrap justify-center gap-2 pr-4">
                <NavButton page="home" label="Home" icon={Home} current={currentPage} />
                <NavButton page="predict" label="AI Query" icon={BrainCircuit} current={currentPage} />
                <NavButton page="docs" label="Doc Generator" icon={FileText} current={currentPage} />
                <NavButton page="analyze" label="Doc Analyzer" icon={FileSearch} current={currentPage} />
                <NavButton page="voice" label="Voice" icon={Mic} current={currentPage} />
                <NavButton page="ipc" label="IPC Lookup" icon={FileSearch} current={currentPage} />
                <NavButton page="penalty" label="Penalties" icon={Scale} current={currentPage} />
                <NavButton page="cases" label="Case Law" icon={BookUser} current={currentPage} />
                <NavButton page="bookmarks" label="Bookmarks" icon={Bookmark} current={currentPage} />
                <NavButton page="find" label="Find Advocate" icon={BookUser} current={currentPage} />
                <NavButton page="verdicts" label="Recent Verdicts" icon={Scroll} current={currentPage} />
                <NavButton page="history" label="My History" icon={History} current={currentPage} />
              </div>
              <div className="pl-4">
                <LogoutButton />
              </div>
            </div>
          </nav>
        </header>
      )}
      
      <main className="container mx-auto px-6 py-8">
        {renderPage()}
      </main>
      
      {currentUser && (
        <footer className="text-center py-10 mt-16 bg-slate-100 border-t border-slate-200 text-slate-500 text-sm">
          <p>© 2025 Nyay Saathi. All rights reserved.</p>
          <p className="font-medium mt-1">This is a technology demo and does not provide legal advice.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
