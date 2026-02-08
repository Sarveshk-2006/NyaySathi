// Constants and Mock Data for the Application

import { Shield, Search, Scale, BookUser, Landmark, MessageSquare, Scroll, Trophy, Gavel, Globe, FileSearch, BookOpen } from 'lucide-react';

export const LOGO_URL = "/logo.png";

export const MOCK_VERDICTS = [
  {
    id: 101,
    caseName: "X vs. Union of India (Digital Privacy)",
    court: "Supreme Court of India",
    date: "15 Jan 2026",
    summary: "A landmark judgment reinforcing the right to be forgotten in the digital age. The court held that individuals have the right to request the removal of personal data from search engines under specific circumstances.",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=600",
    link: "#"
  },
  {
    id: 102,
    caseName: "State vs. ABC Corp (Environmental Compliance)",
    court: "National Green Tribunal",
    date: "10 Jan 2026",
    summary: "Strict penalties imposed on industrial units for failing to meet new emission standards. The tribunal emphasized the 'Polluter Pays' principle and mandated immediate corrective measures.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=600",
    link: "#"
  },
  {
    id: 103,
    caseName: "In Re: Guidelines for Workplace Safety",
    court: "Supreme Court of India",
    date: "05 Jan 2026",
    summary: "New guidelines issued to ensure the safety of gig workers. The court directed platform aggregators to provide basic social security benefits and accident insurance coverage.",
    imageUrl: "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&q=80&w=800&h=600",
    link: "#"
  }
];

export const MOCK_FORUM_POSTS = [
  { id: 'mock1', title: "Landlord refusing to return security deposit", author: "Rohan123", isLawyer: false, category: "Property", upvotes: 45, comments: 12, time: "2h ago", content: "I vacated my flat in Pune last month after giving 1 month notice. Now landlord is making excuses..." },
  { id: 'mock2', title: "Can I file an FIR online for a lost mobile phone?", author: "Adv. Priya Sharma", isLawyer: true, category: "Criminal", upvotes: 120, comments: 34, time: "5h ago", content: "Yes, you can. Most state police portals allow online lost article reports. Here is the process..." },
  { id: 'mock3', title: "Employment bond validity in India", author: "Techie_99", isLawyer: false, category: "Corporate", upvotes: 89, comments: 21, time: "1d ago", content: "My company is asking me to pay 2 lakhs for leaving before 2 years. Is this legal?" }
];

export const LEARNING_MODULES = [
  {
    id: 1,
    title: "Rights Upon Arrest",
    desc: "Know your fundamental rights if detained by police.",
    xp: 120,
    icon: Shield,
    type: 'quiz',
    questions: [
      { q: "Can you be arrested without a warrant?", options: ["Yes, for cognizable offenses", "No, never", "Only at night"], ans: 0 },
      { q: "What is the time limit to produce an arrested person before a magistrate?", options: ["12 hours", "24 hours", "48 hours"], ans: 1 },
      { q: "Which right allows you to inform a relative about the arrest?", options: ["Right to Silence", "Right to Legal Aid", "Right to Inform"], ans: 2 },
    ]
  },
  {
    id: 2,
    title: "Consumer Rescue Scenario",
    desc: "Choose the best step in real‑life consumer disputes.",
    xp: 160,
    icon: Scale,
    type: 'scenario',
    scenarios: [
      {
        story: "You bought a mobile online. It stopped working in 10 days, and the seller refuses replacement.",
        question: "What is the BEST next step?",
        options: ["Post on social media", "File a consumer complaint online", "Threaten a defamation case"],
        ans: 1
      },
      {
        story: "A restaurant refuses to share a tax invoice after charging GST.",
        question: "What should you do first?",
        options: ["Ask for invoice in writing and keep proof", "Call police immediately", "Ignore it"],
        ans: 0
      },
    ]
  },
  {
    id: 3,
    title: "Cyber Safety Rapid Fire",
    desc: "Quick true/false checks to build digital safety reflexes.",
    xp: 180,
    icon: Globe,
    type: 'rapid',
    items: [
      { statement: "Sharing OTP with customer care is safe.", ans: false },
      { statement: "You should report a UPI fraud to 1930 immediately.", ans: true },
      { statement: "Installing APKs from unknown sources is low risk.", ans: false },
    ]
  },
  {
    id: 4,
    title: "FIR First Response",
    desc: "Pick the correct legal response in common FIR situations.",
    xp: 140,
    icon: Gavel,
    type: 'scenario',
    scenarios: [
      {
        story: "Your phone is stolen. The police station says to come later and refuses to take your complaint.",
        question: "What is the correct next step?",
        options: ["Leave and try another day", "Send written complaint to SP/Senior officer", "Pay a fee to register"],
        ans: 1
      },
      {
        story: "You lost your wallet; you need proof for insurance.",
        question: "What should you file first?",
        options: ["A Non‑Cognizable report / Lost report", "A civil suit", "A defamation complaint"],
        ans: 0
      },
    ]
  },
  {
    id: 5,
    title: "FIR Filing Timeline",
    desc: "Arrange the steps to file an FIR correctly.",
    xp: 180,
    icon: Scroll,
    type: 'ordering',
    steps: [
      "Give a written complaint at the police station",
      "Receive a signed copy of FIR with FIR number",
      "Narrate the incident details to the duty officer",
      "If refused, send complaint to SP/DCP in writing",
    ],
    correctOrder: [2, 0, 1, 3]
  },
  {
    id: 6,
    title: "Rights Match‑Up",
    desc: "Match the right with its correct protection.",
    xp: 200,
    icon: BookOpen,
    type: 'match',
    pairs: [
      { left: "Article 21", right: "Right to life and personal liberty" },
      { left: "Article 22", right: "Protection against arbitrary arrest" },
      { left: "Article 19", right: "Freedom of speech and expression" },
    ]
  },
  {
    id: 7,
    title: "Spot the Clause",
    desc: "Fill in the missing legal term.",
    xp: 160,
    icon: FileSearch,
    type: 'fill',
    prompts: [
      { text: "An arrested person must be produced before a magistrate within ____ hours.", answer: "24" },
      { text: "The national cyber crime helpline number is ____.", answer: "1930" },
      { text: "FIR stands for First Information ____.", answer: "Report" },
    ]
  }
];
