import React, { useState } from 'react';
import {
  FileText, Send, Download, Eye, Printer, CheckCircle2,
  AlertCircle, Calendar, User, MapPin, Mail, Phone, Pen
} from 'lucide-react';
import { Notice, NoticeType, Case } from '../../../types/court';
import { useCourtAuth } from '../../../contexts/CourtAuthContext';
import { PERMISSIONS } from '../../../types/court';
import { generateNoticeNumber, generateHash } from '../../../utils/security';

const NoticeGenerator = () => {
  const { hasPermission, courtUser } = useCourtAuth();
  const [noticeType, setNoticeType] = useState<NoticeType>('summons');
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedNotice, setGeneratedNotice] = useState<Notice | null>(null);

  const noticeTemplates = {
    summons: {
      subject: 'Summons to Appear Before Court',
      template: `IN THE COURT OF {COURT_NAME}

SUMMONS
Notice No: {NOTICE_NUMBER}
Date: {DATE}

Case No: {CASE_NUMBER}
{CASE_TITLE}

To,
{RECIPIENT_NAME}
{RECIPIENT_ADDRESS}

WHEREAS a case has been filed against you in this court, you are hereby summoned to appear before this court on {HEARING_DATE} at {HEARING_TIME} to answer the charges against you.

TAKE NOTICE that if you fail to appear on the said date, the court may proceed ex-parte and pass orders in your absence.

Given under my hand and seal of this court.

{JUDGE_NAME}
{JUDGE_DESIGNATION}
{COURT_NAME}`,
    },
    warrant: {
      subject: 'Warrant of Arrest',
      template: `IN THE COURT OF {COURT_NAME}

WARRANT OF ARREST
Warrant No: {NOTICE_NUMBER}
Date: {DATE}

Case No: {CASE_NUMBER}
{CASE_TITLE}

To,
The Officer In-Charge
All Police Stations

WHEREAS {RECIPIENT_NAME}, residing at {RECIPIENT_ADDRESS}, has failed to appear before this court despite repeated summons, you are hereby directed to arrest the said person and produce them before this court on {HEARING_DATE}.

This warrant is valid until further orders of the court.

{JUDGE_NAME}
{JUDGE_DESIGNATION}
{COURT_NAME}

SEAL OF THE COURT`,
    },
    adjournment: {
      subject: 'Notice of Adjournment',
      template: `IN THE COURT OF {COURT_NAME}

NOTICE OF ADJOURNMENT
Notice No: {NOTICE_NUMBER}
Date: {DATE}

Case No: {CASE_NUMBER}
{CASE_TITLE}

To,
{RECIPIENT_NAME}
{RECIPIENT_ADDRESS}

This is to inform you that the hearing scheduled for {PREVIOUS_DATE} in the above-mentioned case has been adjourned to {HEARING_DATE} at {HEARING_TIME}.

You are requested to appear before the court on the new date with all necessary documents and evidence.

{JUDGE_NAME}
{JUDGE_DESIGNATION}
{COURT_NAME}`,
    },
    judgment: {
      subject: 'Notice of Judgment',
      template: `IN THE COURT OF {COURT_NAME}

NOTICE OF JUDGMENT
Notice No: {NOTICE_NUMBER}
Date: {DATE}

Case No: {CASE_NUMBER}
{CASE_TITLE}

To,
{RECIPIENT_NAME}
{RECIPIENT_ADDRESS}

This is to inform you that judgment has been pronounced in the above-mentioned case on {JUDGMENT_DATE}.

You may collect a certified copy of the judgment from the court office during working hours (10:00 AM to 5:00 PM) on payment of prescribed fees.

{JUDGE_NAME}
{JUDGE_DESIGNATION}
{COURT_NAME}`,
    },
    bail_order: {
      subject: 'Bail Order',
      template: `IN THE COURT OF {COURT_NAME}

BAIL ORDER
Order No: {NOTICE_NUMBER}
Date: {DATE}

Case No: {CASE_NUMBER}
{CASE_TITLE}

To,
The Superintendent
{JAIL_NAME}

WHEREAS the accused {RECIPIENT_NAME} has filed an application for bail in the above-mentioned case, and after hearing both parties and considering the facts and circumstances, this court is pleased to grant bail to the accused on the following conditions:

1. Personal bond of Rs. {BOND_AMOUNT}
2. Two sureties of like amount
3. Accused shall appear before this court on all hearing dates
4. Accused shall not leave the jurisdiction without court permission
5. Accused shall surrender passport (if any)

You are directed to release the accused upon furnishing the bail bond and sureties.

{JUDGE_NAME}
{JUDGE_DESIGNATION}
{COURT_NAME}`,
    },
    interim_order: {
      subject: 'Interim Order',
      template: `IN THE COURT OF {COURT_NAME}

INTERIM ORDER
Order No: {NOTICE_NUMBER}
Date: {DATE}

Case No: {CASE_NUMBER}
{CASE_TITLE}

To,
{RECIPIENT_NAME}
{RECIPIENT_ADDRESS}

WHEREAS the petitioner has filed an application for interim relief, and after hearing both parties, this court is pleased to pass the following interim order:

{CUSTOM_CONTENT}

This order shall remain in force until the next date of hearing on {HEARING_DATE} or until further orders of this court.

{JUDGE_NAME}
{JUDGE_DESIGNATION}
{COURT_NAME}`,
    },
    final_order: {
      subject: 'Final Order',
      template: `IN THE COURT OF {COURT_NAME}

FINAL ORDER
Order No: {NOTICE_NUMBER}
Date: {DATE}

Case No: {CASE_NUMBER}
{CASE_TITLE}

After hearing both parties and examining the evidence on record, this court passes the following final order:

{CUSTOM_CONTENT}

This order is final and binding on all parties. Any party aggrieved by this order may file an appeal within the prescribed period.

Given under my hand and seal of this court.

{JUDGE_NAME}
{JUDGE_DESIGNATION}
{COURT_NAME}

SEAL OF THE COURT`,
    },
  };

  const generatePreview = () => {
    if (!hasPermission(PERMISSIONS.NOTICE_CREATE)) {
      alert('You do not have permission to create notices');
      return;
    }

    const template = noticeTemplates[noticeType].template;
    const noticeNumber = generateNoticeNumber(courtUser?.courtId || 'CRT', noticeType);
    
    const previewContent = template
      .replace(/{COURT_NAME}/g, courtUser?.courtName || 'District Court')
      .replace(/{NOTICE_NUMBER}/g, noticeNumber)
      .replace(/{DATE}/g, new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }))
      .replace(/{CASE_NUMBER}/g, selectedCase || '[Case Number]')
      .replace(/{CASE_TITLE}/g, '[Case Title]')
      .replace(/{RECIPIENT_NAME}/g, recipientName || '[Recipient Name]')
      .replace(/{RECIPIENT_ADDRESS}/g, recipientAddress || '[Recipient Address]')
      .replace(/{HEARING_DATE}/g, hearingDate ? new Date(hearingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Hearing Date]')
      .replace(/{HEARING_TIME}/g, '10:30 AM')
      .replace(/{JUDGE_NAME}/g, courtUser?.name || '[Judge Name]')
      .replace(/{JUDGE_DESIGNATION}/g, courtUser?.designation || '[Designation]')
      .replace(/{CUSTOM_CONTENT}/g, customContent || '[Order Details]')
      .replace(/{PREVIOUS_DATE}/g, '[Previous Date]')
      .replace(/{JUDGMENT_DATE}/g, new Date().toLocaleDateString('en-IN'))
      .replace(/{JAIL_NAME}/g, 'Central Jail')
      .replace(/{BOND_AMOUNT}/g, '50,000');

    setPreview(previewContent);
    setShowPreview(true);
  };

  const generateNotice = async () => {
    if (!hasPermission(PERMISSIONS.NOTICE_CREATE)) {
      alert('You do not have permission to create notices');
      return;
    }

    const noticeNumber = generateNoticeNumber(courtUser?.courtId || 'CRT', noticeType);
    const contentHash = await generateHash(preview);

    const notice: Notice = {
      id: `notice-${Date.now()}`,
      noticeNumber,
      noticeType,
      caseId: selectedCase || 'unknown',
      caseNumber: selectedCase || '[Case Number]',
      caseTitle: '[Case Title]',
      recipientName,
      recipientAddress,
      recipientEmail: recipientEmail || undefined,
      recipientPhone: recipientPhone || undefined,
      subject: noticeTemplates[noticeType].subject,
      content: preview,
      hearingDate: hearingDate ? new Date(hearingDate) : undefined,
      issuedDate: new Date(),
      issuedBy: courtUser?.uid || '',
      issuedByName: courtUser?.name || '',
      deliveryStatus: 'pending',
      isSigned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setGeneratedNotice(notice);
    
    // Save to database (mock)
    console.log('Notice generated:', notice);
    alert('Notice generated successfully! You can now sign and send it.');
  };

  const downloadNotice = () => {
    const blob = new Blob([preview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notice-${noticeType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printNotice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Court Notice</title>
            <style>
              body {
                font-family: 'Times New Roman', serif;
                padding: 40px;
                line-height: 1.8;
              }
              pre {
                white-space: pre-wrap;
                font-family: 'Times New Roman', serif;
                font-size: 14px;
              }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            <pre>${preview}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-3xl shadow-xl p-8 mb-6 text-white relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-4xl font-serif font-bold text-white mb-2">Notice Generator</h1>
              <p className="text-slate-200 font-medium">Create official court notices and orders with professional templates</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
              <FileText className="w-12 h-12 text-amber-400" />
            </div>
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-slate-100 animate-slide-up delay-100">
            {/* Notice Type */}
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                  Notice Type *
                </label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value as NoticeType)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-800 transition-all hover:border-slate-300"
                >
                  <option value="summons">Summons</option>
                  <option value="warrant">Warrant of Arrest</option>
                  <option value="adjournment">Adjournment Notice</option>
                  <option value="judgment">Judgment Notice</option>
                  <option value="bail_order">Bail Order</option>
                  <option value="interim_order">Interim Order</option>
                  <option value="final_order">Final Order</option>
                </select>
              </div>

              {/* Case Number */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                  Case Number
                </label>
                <input
                  type="text"
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  placeholder="e.g., CC-DLI-12345/2026"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-800 placeholder-slate-500 transition-all hover:border-slate-300"
                />
              </div>

              {/* Recipient Details */}
              <div className="border-t-2 border-slate-200 pt-6">
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-amber-600" />
                  Recipient Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-800 placeholder-slate-500 transition-all hover:border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                      Address *
                    </label>
                    <textarea
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Complete postal address"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-800 placeholder-slate-500 transition-all hover:border-slate-300 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                        Email
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-800 placeholder-slate-500 transition-all hover:border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={recipientPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setRecipientPhone(val);
                          }}
                          placeholder="9876543210"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          title="Please enter a valid 10-digit mobile number"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-800 placeholder-slate-500 transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hearing Date */}
              {['summons', 'adjournment', 'interim_order'].includes(noticeType) && (
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                    Hearing Date
                  </label>
                  <input
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-800 transition-all hover:border-slate-300"
                  />
                </div>
              )}

              {/* Custom Content */}
              {['interim_order', 'final_order'].includes(noticeType) && (
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                    Order Details
                  </label>
                  <textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Enter the order details..."
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-800 placeholder-slate-500 transition-all hover:border-slate-300 resize-none"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={generatePreview}
                  className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-lg shadow-slate-900/30 flex items-center justify-center gap-2 group"
                >
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Generate Preview
                </button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-slide-up delay-200">
              {showPreview ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Notice Preview</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={downloadNotice}
                        className="p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all border-2 border-slate-200 hover:border-slate-300"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={printNotice}
                        className="p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all border-2 border-slate-200 hover:border-slate-300"
                        title="Print"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-0 rounded-lg border-4 border-slate-900 mb-4 max-h-[700px] overflow-y-auto shadow-xl">
                    {/* Court Header with Border */}
                    <div className="border-b-4 border-slate-900 bg-slate-50 p-6 text-center">
                      <div className="inline-block border-4 border-slate-900 px-8 py-3 bg-white">
                        <h2 className="font-serif font-bold text-lg uppercase tracking-wider">
                          {preview.split('\n')[0]}
                        </h2>
                      </div>
                    </div>

                    {/* Notice Body */}
                    <div className="p-10 space-y-6">
                      {/* Notice Type Header */}
                      <div className="text-center border-b-2 border-slate-900 pb-4">
                        <h3 className="font-serif font-bold text-2xl uppercase tracking-wide">
                          {preview.split('\n')[2]}
                        </h3>
                        <div className="mt-3 flex justify-center gap-8 text-sm">
                          <span className="font-semibold">{preview.split('\n')[3]}</span>
                          <span className="font-semibold">{preview.split('\n')[4]}</span>
                        </div>
                      </div>

                      {/* Case Details Box */}
                      <div className="border-2 border-slate-900 p-4 bg-slate-50">
                        <div className="space-y-1">
                          <p className="font-semibold">{preview.split('\n').find(l => l.includes('Case No:'))}</p>
                          <p className="font-semibold">{preview.split('\n').find(l => l.includes('Case Title:')) || preview.split('\n')[7]}</p>
                        </div>
                      </div>

                      {/* Recipient Box */}
                      <div className="border-2 border-slate-900 p-4 bg-white">
                        <p className="font-bold mb-2">To,</p>
                        <div className="pl-4 space-y-1">
                          {preview.split('\n').slice(
                            preview.split('\n').findIndex(l => l.trim() === 'To,') + 1,
                            preview.split('\n').findIndex(l => l.trim() === 'To,') + 3
                          ).map((line, idx) => (
                            <p key={idx} className="font-medium">{line}</p>
                          ))}
                        </div>
                      </div>

                      {/* Notice Content */}
                      <div className="space-y-4 text-justify leading-relaxed">
                        {preview.split('\n').slice(
                          preview.split('\n').findIndex(l => l.includes('WHEREAS')) || 10
                        ).map((line, idx) => {
                          if (line.trim().startsWith('WHEREAS') || line.trim().startsWith('TAKE NOTICE')) {
                            return (
                              <p key={idx} className="font-bold text-base mt-4">
                                {line}
                              </p>
                            );
                          }
                          if (line.trim() && !line.includes('Given under') && !line.includes('SEAL OF')) {
                            return <p key={idx} className="font-serif">{line}</p>;
                          }
                          return null;
                        })}
                      </div>

                      {/* Signature Section */}
                      <div className="mt-8 pt-6 border-t-2 border-slate-900">
                        <p className="italic text-sm mb-6">Given under my hand and seal of this court.</p>
                        <div className="mt-8 text-right space-y-1">
                          <p className="font-bold text-lg">{courtUser?.name || 'Judge User'}</p>
                          <p className="font-semibold">{courtUser?.designation || 'District Judge'}</p>
                          <p className="font-medium">{courtUser?.courtName || 'District Court, Delhi'}</p>
                        </div>
                        
                        {/* Court Seal Placeholder */}
                        <div className="mt-6 flex justify-center">
                          <div className="border-4 border-slate-900 rounded-full w-32 h-32 flex items-center justify-center bg-slate-50">
                            <div className="text-center">
                              <p className="font-bold text-xs">SEAL OF</p>
                              <p className="font-bold text-xs">THE COURT</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {hasPermission(PERMISSIONS.NOTICE_CREATE) && (
                    <button
                      onClick={generateNotice}
                      className="w-full px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 hover:scale-[1.02] transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 group"
                    >
                      <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Generate Notice
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                  <div className="p-6 bg-white rounded-2xl shadow-md mb-4">
                    <FileText className="w-20 h-20 text-slate-400" />
                  </div>
                  <p className="text-slate-900 text-xl font-bold mb-2">No Preview Generated Yet</p>
                  <p className="text-slate-600 text-sm max-w-xs">
                    Fill in the notice details and click <span className="font-bold text-slate-900">"Generate Preview"</span> to see the formatted document
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeGenerator;
