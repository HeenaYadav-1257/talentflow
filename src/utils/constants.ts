// src/utils/constants.ts
import { Stage, JobStatus } from '@/types';

/**
 * Candidate Stage Configuration
 */
export const STAGE_CONFIG: Record<
  Stage,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  [Stage.Applied]: {
    label: 'Applied',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '📝',
  },
  [Stage.Screen]: {
    label: 'Screening',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '🔍',
  },
  [Stage.Tech]: {
    label: 'Technical',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '💻',
  },
  [Stage.Offer]: {
    label: 'Offer',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '📄',
  },
  [Stage.Hired]: {
    label: 'Hired',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅',
  },
  [Stage.Rejected]: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌',
  },
  [Stage.map]: {
    label: '',
    color: '',
    bgColor: '',
    icon: ''
  }
};

/**
 * Candidate Stages in Order
 */
export const STAGES_ORDER: Stage[] = [
  Stage.Applied,
  Stage.Screen,
  Stage.Tech,
  Stage.Offer,
  Stage.Hired,
  Stage.Rejected,
];

/**
 * Job Status Configuration
 */
export const JOB_STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bgColor: string }
> = {
  [JobStatus.Active]: {
    label: 'Active',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  [JobStatus.Archived]: {
    label: 'Archived',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  [JobStatus.Open]: {
    label: 'Open',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
};

/**
 * Job Tags Preset
 */
export const JOB_TAGS = [
  'Remote',
  'Hybrid',
  'On-site',
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Senior',
  'Mid-level',
  'Junior',
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Urgent',
];

/**
 * Pagination Config
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_BUTTONS: 5,
};

/**
 * API Config
 */
export const API_CONFIG = {
  MIN_DELAY: 200,
  MAX_DELAY: 1200,
  ERROR_RATE: 0.07, // 7% error rate
};

/**
 * Validation Rules
 */
export const VALIDATION = {
  JOB_TITLE_MIN_LENGTH: 3,
  JOB_TITLE_MAX_LENGTH: 100,
  CANDIDATE_NAME_MIN_LENGTH: 2,
  CANDIDATE_NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NOTE_MAX_LENGTH: 1000,
  TAG_MAX_LENGTH: 30,
};

/**
 * LocalStorage Keys
 */
export const STORAGE_KEYS = {
  JOBS: 'talentflow_jobs',
  CANDIDATES: 'talentflow_candidates',
  ASSESSMENTS: 'talentflow_assessments',
  USER_PREFERENCES: 'talentflow_preferences',
};

/**
 * Route Paths
 */
export const ROUTES = {
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:jobId',
  CANDIDATES: '/candidates',
  CANDIDATE_DETAIL: '/candidates/:id',
  ASSESSMENTS: '/assessments',
  ASSESSMENT_DETAIL: '/assessments/:jobId',
};

/**
 * Question Type Labels
 */
export const QUESTION_TYPE_LABELS = {
  'single-choice': 'Single Choice',
  'multi-choice': 'Multiple Choice',
  'short-text': 'Short Text',
  'long-text': 'Long Text',
  numeric: 'Numeric',
  'file-upload': 'File Upload',
};

/**
 * Default Avatar Colors
 */
export const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];
