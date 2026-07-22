/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BookType =
  | 'alphabet'
  | 'numbers'
  | 'phonics'
  | 'arabic'
  | 'english'
  | 'french'
  | 'german'
  | 'vocabulary'
  | 'coloring'
  | 'tracing'
  | 'logic'
  | 'math'
  | 'worksheets'
  | 'flashcards'
  | 'teacher_resources';

export type BookLanguage = 'ar' | 'en' | 'fr' | 'de';

export interface BookMetadata {
  title: string;
  subtitle?: string;
  author?: string;
  ageGroup: 'toddlers' | 'preschool' | 'early_grade' | 'middle_grade' | 'teacher';
  targetAge?: string;
  bookType: BookType;
  language: BookLanguage;
  targetCurriculum: 'montessori' | 'british_national' | 'common_core' | 'pyp_ib' | 'traditional';
  pedagogicalGoal: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'in' | 'mm';
  };
  bleed: number; // in inches or mm
  margin: number; // in inches or mm
  coverImage?: string;
  themeColor?: string;
  targetPages?: number;
  customBookName?: string;
  platformName?: string;
  paperSize?: 'A4' | 'A3' | 'Letter' | 'Custom';
  customDimensions?: {
    width: number;
    height: number;
    unit: 'cm' | 'in' | 'mm';
  };
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  pageRange: [number, number];
}

export type LayoutType =
  | 'title'
  | 'full-illustration'
  | 'text-illustration'
  | 'activity'
  | 'tracing'
  | 'coloring'
  | 'vocabulary-grid';

export interface PageActivity {
  id: string;
  type: 'tracing' | 'coloring' | 'match-up' | 'fill-blank' | 'puzzle' | 'math-problems';
  instructions: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt?: string;
  contentData?: any; // Questions, tracing vectors, matching pairs
}

export interface Page {
  id: string;
  pageNumber: number;
  chapterId?: string;
  layoutType: LayoutType;
  title?: string;
  textContent?: string;
  illustrationPrompt?: string;
  illustrationAssetId?: string;
  illustrationUrl?: string;
  activity?: PageActivity;
  isDoublePage: boolean;
  bleedSafetyZone: boolean;
  cropMarksEnabled: boolean;
  reviewStatus: 'pending' | 'reviewed' | 'approved';
  pedagogicalCritique?: string;
  colorsUsed?: string[];
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'illustration' | 'character' | 'background' | 'icon' | 'pdf_resource';
  url: string;
  prompt?: string;
  costEstimate?: number;
  mimeType: string;
  createdAt: string;
}

export interface PreflightCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  module: 'educational' | 'print' | 'resolution' | 'consistency';
}

export interface QualityReport {
  isPreflightPassed: boolean;
  educationalConsistencyScore: number; // 0-100
  printSafetyScore: number; // 0-100
  imageResolutionScore: number; // 0-100
  finalScore: number; // 0-100
  checks: PreflightCheck[];
  preflightRunAt?: string;
}

export interface Book {
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata: BookMetadata;
  chapters: Chapter[];
  pages: Page[];
  assets: Asset[];
  qualityReport?: QualityReport;
  exportConfig?: {
    cmykEnabled: boolean;
    highRes300Dpi: boolean;
    bleedIncluded: boolean;
    cropMarksEnabled: boolean;
    registrationMarksEnabled: boolean;
    colorBarsEnabled: boolean;
  };
}

export type WorkflowStage =
  | 'dashboard'
  | 'workspace'
  | 'planning'
  | 'plan-review'
  | 'composer'
  | 'quality-review'
  | 'export'
  | 'done';

export interface WorkflowTransitionGuard {
  from: WorkflowStage;
  to: WorkflowStage;
  canTransition: (book: Book | null) => { allowed: boolean; reason?: string };
}

export interface TranslationDictionary {
  [key: string]: {
    ar: string;
    en: string;
    fr: string;
    de: string;
  };
}
