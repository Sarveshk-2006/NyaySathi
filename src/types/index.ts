// src/types/index.ts
// TypeScript interfaces for Nyay Saathi Application

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface LegalCase {
  id: string | number;
  title: string;
  summary: string;
  court: string;
  year?: string | number;
  caseNumber?: string;
  category?: string;
  keyholding?: string;
  relatedSections?: string[];
  impact?: string;
}

export interface Lawyer {
  id: string;
  name: string;
  specialty: string;
  city: string;
  phone?: string;
  enrollmentNo?: string;
  rating: number;
  experience?: number;
  bio?: string;
  address?: string;
  imageUrl?: string;
  education?: string;
}

export interface Verdict {
  id: number;
  caseName: string;
  court: string;
  date: string;
  summary: string;
  imageUrl?: string;
  link?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  category: string;
  createdAt: any; // Firestore Timestamp
  upvotes: number;
  upvotedBy: string[];
  commentCount: number;
  isLawyer?: boolean;
}

export interface ForumComment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  createdAt: any; // Firestore Timestamp
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  sources?: any[];
}

export interface LearningModule {
  id: number;
  title: string;
  desc: string;
  xp: number;
  icon: any; // React component
  type: 'quiz' | 'scenario' | 'rapid' | 'ordering' | 'match' | 'fill';
  questions?: QuizQuestion[];
  scenarios?: Scenario[];
  items?: RapidItem[];
  steps?: string[];
  correctOrder?: number[];
  pairs?: MatchPair[];
  prompts?: FillPrompt[];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  ans: number;
}

export interface Scenario {
  story: string;
  question: string;
  options: string[];
  ans: number;
}

export interface RapidItem {
  statement: string;
  ans: boolean;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface FillPrompt {
  text: string;
  answer: string;
}

export interface IPCSection {
  section: number | string;
  title: string;
  description?: string;
}

export interface ConstitutionalRight {
  article?: string;
  title: string;
  description: string;
}

export interface ConstitutionalRightSection {
  rights: ConstitutionalRight[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  fields: DocumentField[];
}

export interface DocumentField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'email';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface UserProgress {
  uid: string;
  completedModules: number[];
  lastScore: number;
  xp: number;
  updatedAt: any; // Firestore Timestamp
}

export interface BookmarkedItem {
  id: string;
  type: 'Case' | 'IPCSection';
  data: LegalCase | IPCSection;
  createdAt: any; // Firestore Timestamp
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  relevance: number;
}

export interface CasePrediction {
  caseType: string;
  prediction: string;
  confidence: number;
  analysis: string;
}

export interface DocumentAnalysisResult {
  text: string;
  relevantSections: IPCSection[];
  summary: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SmartChatResponse {
  text: string;
  sources?: Array<{
    title: string;
    uri?: string;
  }>;
}

export interface AdvocateSearchFilters {
  specialty?: string;
  city?: string;
  name?: string;
  enrollmentNo?: string;
}

export interface LeaderboardEntry {
  id: string;
  uid: string;
  name: string;
  xp: number;
  updatedAt: any; // Firestore Timestamp
}

export interface HistoryEntry {
  id: string;
  type: 'SmartChat' | 'Document Generation' | 'Case Prediction' | 'Document Analysis';
  query: string;
  response: string;
  createdAt: any; // Firestore Timestamp
}

export interface FormData {
  [key: string]: string | number | boolean;
}

export interface PageProps {
  onNavClick?: (page: string) => void;
  onProfileSelect?: (lawyer: Lawyer) => void;
  lawyer?: Lawyer;
  onBack?: () => void;
}

export interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface FilterOptions {
  category?: string;
  sortBy?: string;
  range?: string;
  searchQuery?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
