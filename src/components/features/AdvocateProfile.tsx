import React from 'react';
import { Star, CalendarDays } from 'lucide-react';
import { PageContainer, Card } from '../shared';

interface AdvocateProfileProps {
  lawyer: any;
  onBack: () => void;
}

const AdvocateProfile = ({ lawyer, onBack }: AdvocateProfileProps) => (
  <PageContainer title="Advocate Profile" subtitle="">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 w-fit">&larr; Back to Directory</button>
    <Card className="overflow-hidden shadow-2xl">
      <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        
        <img src={lawyer.imageUrl} className="w-48 h-48 rounded-full border-8 border-white/10 shadow-2xl relative z-10" alt="" onError={(e:any)=>e.target.src='https://placehold.co/100'} />
        <div className="text-center md:text-left relative z-10">
          <h2 className="text-5xl font-serif font-bold mb-3">{lawyer.name}</h2>
          <p className="text-amber-400 text-xl font-bold tracking-wide uppercase mb-6 flex items-center justify-center md:justify-start gap-3">
            {lawyer.specialty} <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span> {lawyer.city}
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium border border-white/10 text-slate-200">Exp: {lawyer.experience} Years</span>
            <span className="px-5 py-2 bg-amber-500 text-white rounded-full text-sm font-bold flex items-center gap-1 shadow-lg"><Star className="w-4 h-4 fill-current"/> {lawyer.rating} Rating</span>
          </div>
        </div>
      </div>
      <div className="p-12 grid md:grid-cols-3 gap-12 bg-white">
        <div className="md:col-span-2 space-y-10">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Biography</h3>
            <p className="text-slate-600 leading-relaxed text-lg font-light">{lawyer.bio || "Experienced legal practitioner with a proven track record in high-stakes litigation..."}</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Contact & Enrollment</h3>
            <div className="grid md:grid-cols-2 gap-4 text-slate-700 text-lg">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Enrollment No.</div>
                <div className="font-semibold">{lawyer.enrollmentNo || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Phone</div>
                <div className="font-semibold">{lawyer.phone || 'N/A'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Address</div>
                <div className="font-semibold">{lawyer.address || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Credentials</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-2 text-lg">
              <li>{lawyer.education || "LL.B (Hons) - National Law School of India University"}</li>
              <li>Member of Bar Council of India</li>
              <li>Specialized Certification in Constitutional Law</li>
            </ul>
          </div>
        </div>
        <div>
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl sticky top-24">
            <h3 className="font-bold text-slate-900 mb-6 text-xl font-serif">Contact {lawyer.name.split(' ')[0]}</h3>
            <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all mb-4 flex items-center justify-center gap-2">
              <CalendarDays className="w-5 h-5"/> Book Consultation
            </button>
            <button className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">Send Message</button>
            <div className="mt-6 text-center text-xs text-slate-400">Response time: usually within 24 hours</div>
          </div>
        </div>
      </div>
    </Card>
  </PageContainer>
);

export default AdvocateProfile;
