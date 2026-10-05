import React, { useState } from 'react';
import { 
  Smartphone, Download, ShieldCheck, CheckCircle2, X, QrCode, 
  Sparkles, Info, ArrowDownToLine, ExternalLink, HardDrive, SmartphoneNfc
} from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'instructions'>('download');

  if (!isOpen) return null;

  const apkUrl = '/downloads/nyay-saathi.apk';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    typeof window !== 'undefined' ? `${window.location.origin}${apkUrl}` : 'https://nyaysaathi.app/downloads/nyay-saathi.apk'
  )}&color=0f172a&bgcolor=ffffff`;

  const handleDownload = () => {
    setDownloadStarted(true);
    // Create hidden link to trigger download
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'NyaySaathi-Release-v2.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadStarted(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg text-slate-950 font-bold">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-1">
                <Sparkles className="w-3 h-3" /> Android App v2.0 Live
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Download Nyay Saathi APK
              </h3>
            </div>
          </div>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light max-w-xl">
            Experience lightning-fast legal assistance, voice search in regional languages, AI document generation, and real-time case updates on your Android phone.
          </p>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-1">
            <button
              onClick={() => setActiveTab('download')}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-all ${
                activeTab === 'download'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Direct Download
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-all ${
                activeTab === 'instructions'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Installation Guide
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50 flex-1">
          {activeTab === 'download' ? (
            <div className="space-y-6">
              {/* App Meta Card */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="p-2">
                  <div className="text-xs text-slate-500 font-medium">Package Size</div>
                  <div className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <HardDrive className="w-4 h-4 text-amber-500" />
                    63.6 MB
                  </div>
                </div>
                <div className="p-2 border-x border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">OS Required</div>
                  <div className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <SmartphoneNfc className="w-4 h-4 text-indigo-500" />
                    Android 7.0+
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-xs text-slate-500 font-medium">Security</div>
                  <div className="text-base font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Verified Safe
                  </div>
                </div>
              </div>

              {/* Main Download CTA Button */}
              <div className="text-center space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full group relative py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
                >
                  <ArrowDownToLine className={`w-6 h-6 ${downloadStarted ? 'animate-bounce text-slate-950' : 'text-slate-950 group-hover:translate-y-0.5 transition-transform'}`} />
                  <span>{downloadStarted ? 'Starting Download...' : 'Download Official APK (v2.0)'}</span>
                </button>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Direct release build • No Ads • Standard Android APK
                </div>
              </div>

              {/* QR Code Section */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-inner shrink-0">
                  <img 
                    src={qrCodeUrl} 
                    alt="Scan to download Nyay Saathi APK"
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    <QrCode className="w-3.5 h-3.5" /> Scan with Mobile Camera
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Want it on your Mobile device?</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Point your mobile camera or any QR scanner at this code to open the direct APK download link on your Android phone.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                How to install the APK on Android
              </h4>

              <div className="space-y-3">
                {[
                  {
                    step: '1',
                    title: 'Download the APK',
                    desc: 'Click the "Download Official APK" button to save nyay-saathi.apk onto your phone.'
                  },
                  {
                    step: '2',
                    title: 'Allow Unknown Apps (if prompted)',
                    desc: 'When opening the file, tap "Settings" and toggle "Allow from this source" for your browser or file manager.'
                  },
                  {
                    step: '3',
                    title: 'Tap Install',
                    desc: 'Confirm installation and launch Nyay Saathi from your app drawer to start using all features!'
                  }
                ].map((item) => (
                  <div key={item.step} className="p-4 bg-white rounded-xl border border-slate-200 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{item.title}</h5>
                      <p className="text-slate-600 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('download')}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Go to Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
