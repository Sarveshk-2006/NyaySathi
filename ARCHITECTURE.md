# Nyay Saathi - Modular Architecture Map

## Application Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx (Router)                      │
│                                                               │
│  • Manages navigation state                                  │
│  • Routes to different pages based on currentPage state     │
│  • Handles user authentication check                        │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │  Pages  │    │ Features │    │ Layout  │
    │Components│    │Components│   │Components│
    └────┬────┘    └────┬────┘    └────┬────┘
         │               │               │
         │               │               │
    ┌────▼─────────────────────────────────────────────┐
    │              Utilities & Constants                │
    │  • helpers.ts      (functions)                   │
    │  • constants.ts    (mock data)                   │
    │  • types/index.ts  (TypeScript interfaces)      │
    └────────────────────────────────────────────────┘
```

## Component Tree

```
App
├── HomePage
│   ├── Hero Section
│   ├── How It Works
│   ├── Tools Grid
│   └── Knowledge Base
├── AuthPage
│   ├── Left Panel (Branding)
│   └── Right Panel (Login/Signup Form)
├── SmartLegalChat
│   ├── Chat History
│   ├── Starter Prompts
│   └── Input Area
├── LegalLiteracy
│   ├── Progress Sidebar
│   ├── Modules Grid
│   └── Quiz/Module Player
├── CommunityForum
│   ├── Sidebar (Filters)
│   ├── Posts Feed
│   └── Comments Section
├── SmartLegalChat
├── RecentVerdicts
├── CaseLawDatabase
├── DocumentGenerator
├── IPCLookup
├── PenaltyCalculator
├── DocumentAnalyzer
├── CasePredictor
├── CaseOutcomePredictor
├── HistoryPage
├── Bookmarks
├── ConstitutionalRights
├── AdvocateFinder
├── AdvocateProfile
└── MultiLanguageVoice
```

## Data Flow

```
┌──────────────────────────────────────────────────┐
│           Firebase Realtime Database              │
├──────────────────────────────────────────────────┤
│  Collections:                                    │
│  ├── users/{uid}/progress/                      │
│  ├── users/{uid}/bookmarks/                     │
│  ├── users/{uid}/history/queries                │
│  ├── forum_posts/                               │
│  ├── forum_posts/{id}/comments/                 │
│  ├── leaderboards/nyayVidya/scores/             │
│  └── ...                                         │
└──────────────────────────────────────────────────┘
         ▲                                    │
         │                                    │
         │ Realtime Listeners                │ Write Operations
         │ onSnapshot()                      addDoc(), updateDoc()
         │                                    │
    ┌────┴─────────────────────────────┬──────▼──────────────────┐
    │       Page Components            │   External APIs         │
    │                                  │                         │
    │ • CommunityForum (forum posts)  │ • /api/smart-chat      │
    │ • LegalLiteracy (progress)      │ • /api/predict-case    │
    │ • AdvocateFinder (lawyers)      │ • /api/generate-doc    │
    │ • etc.                           │ • /api/analyze-doc     │
    │                                  │ • /api/advocates       │
    └──────────────────────────────────┴──────────────────────────┘
```

## Module Dependencies

```
Reusable Components (Layout)
    ▲
    │ imports
    │
┌───┴──────────────────────────────┐
│  Page Components                  │
│  (HomePage, AuthPage, etc.)      │
└───┬──────────────────────────────┘
    │ imports
    │
┌───▼──────────────────────────────┐
│  Utilities & Constants            │
│  • helpers.ts                     │
│  • constants.ts                   │
│  • Firebase config                │
└───┬──────────────────────────────┘
    │ imports
    │
┌───▼──────────────────────────────┐
│  External Libraries               │
│  • React, Lucide Icons           │
│  • Firebase SDK                   │
│  • jsPDF, etc.                   │
└───────────────────────────────────┘
```

## Feature Organization

```
CORE FEATURES (Pages)
├── 📱 Smart Legal Chat
│   ├── Context-aware responses
│   ├── Multi-language support
│   └── Reference sources
│
├── 🎓 Legal Literacy (Gamified)
│   ├── Quiz modules
│   ├── Scenario-based learning
│   ├── XP & Leaderboard
│   └── Badge system
│
├── 📚 Knowledge Base
│   ├── IPC Lookup
│   ├── Case Law Database
│   ├── Constitutional Rights
│   └── Penalty Calculator
│
├── 📄 Document Tools
│   ├── Document Generator
│   ├── Document Analyzer
│   └── Case Predictor
│
├── 👥 Community & Advocates
│   ├── Community Forum
│   ├── Advocate Finder
│   └── Advocate Profiles
│
└── 🔊 Accessibility
    ├── Voice Assistant
    ├── Text-to-Speech
    └── Multi-language support

UTILITY FUNCTIONS (utils/)
├── helpers.ts
│   ├── getVerdictImage()
│   └── parseVerdicts()
│
└── constants.ts
    ├── MOCK_VERDICTS
    ├── MOCK_FORUM_POSTS
    ├── LEARNING_MODULES
    └── LOGO_URL

LAYOUT COMPONENTS (layout/)
├── PageContainer
├── Card
└── LegalDisclaimer
```

## File Import Pattern

### Current Way (Before Refactoring)
```tsx
// Everything was in one file
import App from './App';
// 4065 lines in App.tsx
```

### New Way (After Refactoring)
```tsx
// Main Router
import { HomePage } from './components/pages/HomePage';
import { AuthPage } from './components/pages/AuthPage';
import { SmartLegalChat } from './components/pages/SmartLegalChat';

// Layout Wrappers
import { PageContainer, Card, LegalDisclaimer } from './components/layout/PageContainer';

// Features
import { AdvocateFinder } from './components/features/AdvocateFinder';

// Utilities
import { getVerdictImage, parseVerdicts } from './utils/helpers';
import { LEARNING_MODULES, MOCK_VERDICTS } from './utils/constants';
```

## Scalability Path

```
Current (v2.0)
├── 15 Page Components
├── 3 Feature Components
├── 2 Layout Components
├── 2 Utility Files
└── Total: ~4200 lines distributed

Future Enhancements
├── Add Chat History Component
├── Add Analytics Dashboard
├── Add Admin Panel
├── Add Subscription Management
├── Add Multi-language i18n
├── Add Tests (Jest, React Testing Library)
└── Easy to add with modular structure!
```

## Code Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Main File Size | 4065 lines | 300-500 lines | **88% smaller** |
| Components per File | 20+ (monolithic) | 1-2 (focused) | **Clearer** |
| Average Component | N/A | 200-400 lines | **Optimal** |
| Import Clarity | Low | High | **Much better** |
| Maintainability | Hard | Easy | **Significant** |
| Testing | Difficult | Simple | **Much easier** |
| Collaboration | Blocked | Parallel | **Enabled** |
| IDE Performance | Slow | Fast | **Noticeably** |
| Code Reuse | Low | High | **Better** |

---

**Key Benefit**: With modular structure, developers can work on different features simultaneously without conflicts!
