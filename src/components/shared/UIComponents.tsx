import React from 'react';
import { Shield } from 'lucide-react';

// Reusable UI Components

export const PageContainer = ({ 
  children, 
  title, 
  subtitle 
}: { 
  children: React.ReactNode; 
  title: string; 
  subtitle?: string;
}) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative z-10">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight drop-shadow-sm">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="h-1.5 w-24 bg-amber-500 mx-auto rounded-full mt-6 shadow-sm"></div>
    </div>
    {children}
  </div>
);

export const Card = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={`bg-white rounded-2xl shadow-xl border-t-4 border-amber-500 overflow-hidden hover:shadow-2xl transition-all duration-300 ${className || ''}`}>
    {children}
  </div>
);

export const LegalDisclaimer = () => (
  <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-5 rounded-r-xl my-8 shadow-sm flex items-start gap-4">
    <div className="p-2 bg-amber-100/50 rounded-full flex-shrink-0">
      <Shield className="w-5 h-5 text-amber-700" />
    </div>
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide font-serif text-amber-800 mb-1">
        Legal Disclaimer
      </h3>
      <div className="text-sm opacity-90 leading-relaxed font-medium">
        This AI assistant provides information for educational purposes only. It is not a substitute for professional legal advice. Always consult a qualified advocate.
      </div>
    </div>
  </div>
);
