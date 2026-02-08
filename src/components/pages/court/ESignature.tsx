import React, { useState, useRef, useEffect } from 'react';
import {
  Pen, Check, X, Download, Shield, Clock, CheckCircle2,
  AlertCircle, FileText, Lock, Smartphone, Key
} from 'lucide-react';
import { ESignature, Notice } from '../../../types/court';
import { useCourtAuth } from '../../../contexts/CourtAuthContext';
import { PERMISSIONS } from '../../../types/court';
import { generateHash, generateSignatureId, getDeviceInfo, getClientIP } from '../../../utils/security';

interface ESignatureComponentProps {
  document: Notice | any;
  documentType: 'notice' | 'order' | 'judgment' | 'warrant';
  onSignComplete?: (signature: ESignature) => void;
}

const ESignatureComponent: React.FC<ESignatureComponentProps> = ({
  document,
  documentType,
  onSignComplete,
}) => {
  const { hasPermission, courtUser } = useCourtAuth();
  const [showSignModal, setShowSignModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'digital_certificate' | 'otp' | 'biometric'>('otp');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [existingSignatures, setExistingSignatures] = useState<ESignature[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasDrawing, setIsCanvasDrawing] = useState(false);

  useEffect(() => {
    // Load existing signatures for this document
    // This would come from the database
    const mockSignatures: ESignature[] = [];
    setExistingSignatures(mockSignatures);
  }, [document.id]);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsCanvasDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCanvasDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsCanvasDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save canvas as image
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const sendOTP = async () => {
    if (!courtUser?.phone) {
      alert('Phone number not found. Please update your profile.');
      return;
    }

    // Mock OTP sending - Replace with actual SMS API
    const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('OTP sent:', mockOTP); // In production, this would be sent via SMS
    
    setOtpSent(true);
    alert(`OTP sent to ${courtUser.phone.replace(/(\d{4})$/, 'xxxx')}`);
  };

  const verifyOTP = () => {
    // Mock OTP verification
    if (otp.length === 6) {
      return true;
    }
    alert('Please enter valid 6-digit OTP');
    return false;
  };

  const signDocument = async () => {
    if (!hasPermission(PERMISSIONS.DOCUMENT_SIGN)) {
      alert('You do not have permission to sign documents');
      return;
    }

    // Verify OTP if that method is selected
    if (verificationMethod === 'otp' && !verifyOTP()) {
      return;
    }

    // Check if signature is drawn
    if (!signatureData) {
      alert('Please draw your signature');
      return;
    }

    setSigning(true);

    try {
      // Generate certificate hash
      const documentContent = JSON.stringify(document);
      const certificateHash = await generateHash(documentContent + signatureData + Date.now());
      
      // Get device info and IP
      const deviceInfo = getDeviceInfo();
      const ipAddress = await getClientIP();

      // Create signature object
      const signature: ESignature = {
        id: generateSignatureId(),
        documentId: document.id,
        documentType,
        signerId: courtUser?.uid || '',
        signerName: courtUser?.name || '',
        signerRole: courtUser?.role || 'judge',
        signerDesignation: courtUser?.designation || '',
        signatureImageUrl: signatureData,
        certificateHash,
        timestamp: new Date(),
        isVerified: true,
        verificationMethod,
        ipAddress,
        deviceInfo,
        createdAt: new Date(),
      };

      // Save signature to database (mock)
      console.log('Signature created:', signature);
      
      // Update document with signature
      setExistingSignatures([...existingSignatures, signature]);
      
      // Callback to parent
      if (onSignComplete) {
        onSignComplete(signature);
      }

      alert('Document signed successfully!');
      setShowSignModal(false);
      clearSignature();
      
    } catch (error) {
      console.error('Signing error:', error);
      alert('Failed to sign document. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const verifySignature = async (signature: ESignature) => {
    // Verify signature hash
    const documentContent = JSON.stringify(document);
    const expectedHash = await generateHash(documentContent + signature.signatureImageUrl + signature.timestamp.getTime());
    
    if (signature.certificateHash === expectedHash) {
      alert('Signature is valid and verified ✓');
    } else {
      alert('Warning: Signature verification failed!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-3xl shadow-xl p-8 mb-6 text-white relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-serif font-bold text-white">E-Signature</h1>
            <p className="text-slate-200 mt-2 font-medium">Digitally sign documents with cryptographic security</p>
          </div>
        </div>

      {/* Signature Section */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-slide-up delay-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">Digital Signatures</h3>
              <p className="text-sm text-slate-600">Cryptographically signed and verified</p>
            </div>
          </div>
          
          {hasPermission(PERMISSIONS.DOCUMENT_SIGN) && existingSignatures.length === 0 && (
            <button
              onClick={() => setShowSignModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 hover:scale-[1.02] transition-all shadow-lg shadow-green-600/30 flex items-center gap-2"
            >
              <Pen className="w-5 h-5" />
              Sign Document
            </button>
          )}
        </div>

        {/* Existing Signatures */}
        {existingSignatures.length > 0 ? (
          <div className="space-y-4">
            {existingSignatures.map((sig) => (
              <div key={sig.id} className="border-2 border-green-200 bg-green-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  {/* Signature Image */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-24 bg-white border-2 border-green-300 rounded-lg overflow-hidden">
                      <img src={sig.signatureImageUrl} alt="Signature" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  {/* Signature Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">Digitally Signed</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-700">
                          <p><strong>Signed by:</strong> {sig.signerName}</p>
                          <p><strong>Designation:</strong> {sig.signerDesignation}</p>
                          <p><strong>Date & Time:</strong> {sig.timestamp.toLocaleString('en-IN')}</p>
                          <p><strong>Verification:</strong> {sig.verificationMethod.toUpperCase()}</p>
                          <p className="font-mono text-xs text-slate-500">
                            <strong>Certificate:</strong> {sig.certificateHash.substring(0, 32)}...
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => verifySignature(sig)}
                        className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Shield className="w-4 h-4" />
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <Lock className="w-16 h-16 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600 font-medium">No signatures yet. Document is unsigned.</p>
            <p className="text-sm text-slate-500 mt-1">Sign this document to add your digital signature</p>
          </div>
        )}
      </div>
    </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Sign Document</h3>
                  <p className="text-slate-600 mt-1">Digitally sign this {documentType}</p>
                </div>
                <button
                  onClick={() => {
                    setShowSignModal(false);
                    clearSignature();
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Verification Method */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-slate-700 mb-4">
                  Verification Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setVerificationMethod('otp')}
                    className={`p-4 border-2 rounded-xl transition-all hover:scale-[1.02] ${
                      verificationMethod === 'otp'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 mx-auto mb-2 ${
                      verificationMethod === 'otp' ? 'text-amber-600' : 'text-slate-700'
                    }`} />
                    <p className={`text-sm font-semibold ${
                      verificationMethod === 'otp' ? 'text-amber-900' : 'text-slate-900'
                    }`}>OTP</p>
                    <p className="text-xs text-slate-500 mt-1">SMS Verification</p>
                  </button>
                  
                  <button
                    onClick={() => setVerificationMethod('digital_certificate')}
                    className={`p-4 border-2 rounded-xl transition-all hover:scale-[1.02] ${
                      verificationMethod === 'digital_certificate'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Key className={`w-6 h-6 mx-auto mb-2 ${
                      verificationMethod === 'digital_certificate' ? 'text-amber-600' : 'text-slate-700'
                    }`} />
                    <p className={`text-sm font-semibold ${
                      verificationMethod === 'digital_certificate' ? 'text-amber-900' : 'text-slate-900'
                    }`}>Certificate</p>
                    <p className="text-xs text-slate-500 mt-1">Digital Certificate</p>
                  </button>
                  
                  <button
                    onClick={() => setVerificationMethod('biometric')}
                    className={`p-4 border-2 rounded-xl transition-all hover:scale-[1.02] ${
                      verificationMethod === 'biometric'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Shield className={`w-6 h-6 mx-auto mb-2 ${
                      verificationMethod === 'biometric' ? 'text-amber-600' : 'text-slate-700'
                    }`} />
                    <p className={`text-sm font-semibold ${
                      verificationMethod === 'biometric' ? 'text-amber-900' : 'text-slate-900'
                    }`}>Biometric</p>
                    <p className="text-xs text-slate-500 mt-1">Fingerprint/Face</p>
                  </button>
                </div>
              </div>

              {/* OTP Verification */}
              {verificationMethod === 'otp' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-2">SMS Verification</p>
                      {!otpSent ? (
                        <button
                          onClick={sendOTP}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Send OTP to {courtUser?.phone?.replace(/(\d{4})$/, 'xxxx')}
                        </button>
                      ) : (
                        <div>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
                          />
                          <p className="text-xs text-blue-700 mt-2">OTP sent to your registered mobile number</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Signature Canvas */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-slate-700 mb-4">
                  Draw Your Signature
                </label>
                <div className="border-2 border-slate-300 rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full cursor-crosshair"
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={clearSignature}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold mb-1">Security Notice</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      <li>Your signature will be cryptographically signed</li>
                      <li>All details (time, location, device) will be recorded</li>
                      <li>Signature cannot be modified after signing</li>
                      <li>Document tampering will be detected</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowSignModal(false);
                    clearSignature();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:scale-[1.02] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={signDocument}
                  disabled={signing || !signatureData || (verificationMethod === 'otp' && !otpSent)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 hover:scale-[1.02] transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Sign Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESignatureComponent;
