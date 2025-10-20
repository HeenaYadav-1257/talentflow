// ===================================================
// ===================== JOB TYPES ===================
// ===================================================

import type { ReactNode } from "react";

export enum JobStatus {
  Active = "active",
  Archived = "archived",
  Open = "Open",
}

export enum EmploymentType {
  FullTime = "full-time",
  PartTime = "part-time",
  Contract = "contract",
  Internship = "internship",
  Freelance = "freelance",
}

export interface Job {
  isPublished: any;
  id: string;
  title: string;
  department: string;
  location: string;
  type: EmploymentType | string;
  slug?: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  status: JobStatus;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  candidateCount?: number;
  order: number;
  stages?: Stage[];
}

export interface ReorderPayload {
  order: Array<{ id: string; order: number }>;
  fromIndex?: number;
  toIndex?: number;
}

export interface JobFilters {
  search: string;
  status: "all" | JobStatus;
  tags?: string[];
  sort?: "order" | "title" | "createdAt" | "updatedAt";
  page: number;
  pageSize?: number;
}

export const JOB_STATUS_COLORS: Record<JobStatus, { label: string; color: string; bgColor: string }> = {
  [JobStatus.Active]: { label: "Active", color: "text-green-700", bgColor: "bg-green-100" },
  [JobStatus.Archived]: { label: "Archived", color: "text-gray-700", bgColor: "bg-gray-100" },
  [JobStatus.Open]: { label: "Open", color: "text-blue-700", bgColor: "bg-blue-100" },
};

// ===================================================
// ================= CANDIDATE TYPES =================
// ===================================================

export enum Stage {
  Applied = "applied",
  Screen = "screen",
  Tech = "tech",
  Offer = "offer",
  Hired = "hired",
  Rejected = "rejected",
  map = "map",
}


export const ALL_STAGES: Stage[] = [
  Stage.Applied,
  Stage.Screen,
  Stage.Tech,
  Stage.Offer,
  Stage.Hired,
  Stage.Rejected,
];

export const STAGE_LABELS: Record<Stage, string> = {
  [Stage.Applied]: "Applied",
  [Stage.Screen]: "Screening",
  [Stage.Tech]: "Technical",
  [Stage.Offer]: "Offer",
  [Stage.Hired]: "Hired",
  [Stage.Rejected]: "Rejected",
  [Stage.map]: ""
};

export const STAGE_COLORS: Record<Stage, { bg: string; text: string; border: string }> = {
  [Stage.Applied]: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  [Stage.Screen]: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  [Stage.Tech]: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  [Stage.Offer]: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  [Stage.Hired]: { bg: "bgm-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  [Stage.Rejected]: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  [Stage.map]: {
    bg: "",
    text: "",
    border: ""
  }
};

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  stage: Stage;
  appliedAt: number;
  notes: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  skills?: string[];
  timeline?: CandidateTimeline[];
  assessments?: any;
  isArchived?: boolean;
  source?: string;
  resumeFile?: string;
  status?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CandidateNote {
  id: string;
  candidateId: string;
  content: string;
  createdAt: number;
  createdBy: string;
  mentions?: string[];
}

export type TimelineType =
  | "stage_change"
  | "note_added"
  | "interview_scheduled"
  | "offer_sent"
  | "application"
  | "bulk_stage_change"
  | "archived"
  | "email_sent"
  | "update"; // ✅ Added 'update' for API timeline

export interface CandidateTimeline {
  id: string;
  candidateId: string;
  type: TimelineType;
  description: string;
  fromStage?: Stage;
  toStage?: Stage;
  timestamp: number;
  createdBy?: string;
  metadata?: any;
}

export interface CandidateFilters {
  search: string;
  stage: Stage | "all";
  jobId?: string;
  page: number;
  pageSize?: number;
}

// ===================================================
// ================= ASSESSMENT TYPES ================
// ===================================================

export enum QuestionType {
  ShortText = "short-text",
  LongText = "long-text",
  Numeric = "numeric",
  SingleChoice = "single-choice",
  MultiChoice = "multi-choice",
  FileUpload = "file-upload",
  MCQ = "mcq",
  TrueFalse = "true_false",
  ShortAnswer = "short_answer",
  LongAnswer = "long_answer",
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface AnalyticsCache {
  id: string;
  data: any;
  generatedAt: number;
  expiresAt: number;
}

export interface InterviewSlot {
  id: string;
  interviewerId: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: "available" | "booked" | "blocked";
}

export interface ConditionalLogic {
  showWhen: string | number | string[];
  questionId: string;
  operator: "equals" | "not_equals" | "contains";
  value: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  fileTypes?: string[];
  maxFileSize?: number;
}


export type FilterType = "search" | "sort" | "status" | "page" | "tag";

export interface Question {
  content: ReactNode;
  timeLimit: string;
  id: string;
  type: QuestionType;
  text: string;
  title?: string;
  description?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number | string;
  validation?: any;
  maxLength?: number;
  accept?: string;
  conditional?: { questionId: string; showWhen: string };
  correctAnswer?: string;
  order: number;
  sectionId?: string;
  score?: number;
}

export interface AssessmentSection {
  id: string;
  assessmentId: string;
  title: string;
  description?: string;
  questions: Question[];
  order: number;
  config?: Record<string, any>;
}

export interface Assessment {
  id: string;
  questionCount: number;
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  status: "draft" | "published" | string;
  version: number;
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
  config?: {
    timeLimit?: number;
    maxAttempts?: number;
    allowResume?: boolean;
    autoGrade?: boolean;
    passThreshold?: number;
    instructions?: string;
  };
}
export interface AssessmentResult {
  id: string;
  candidateId: string;
  candidateName: string;
  score: number;
  totalScore: number;
  pass: boolean;
  timeTaken: number; // in milliseconds
  completedAt: string | number | Date;
}
export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  answers: Record<string, any>;
  submittedAt: number;
  score?: number;
}
export interface Result {
  id: string;
  candidateId: string;
  candidateName: string;
  score: number;
  totalScore: number;
  pass: boolean;
  timeTaken: number; // in milliseconds
  completedAt: string | number | Date;
}


export interface AssessmentInvite {
  token: string;
  id: string;
  assessmentId: string;
  candidateId: string;
  candidateEmail: string;
  status: "pending" | "sent" | "completed";
  sentAt?: number;
  attempts: number;
  expiresAt: number;
  completedAt?: number;
}

// ===================================================
// ================== INTERVIEW TYPES =================
// ===================================================

export enum InterviewType {
  Phone = "phone",
  Video = "video",
  Technical = "technical",
  Behavioral = "behavioral",
  Panel = "panel",
  Final = "final",
}

export enum InterviewStatus {
  Scheduled = "scheduled",
  InProgress = "in-progress",
  Completed = "completed",
  Rescheduled = "rescheduled",
  Cancelled = "cancelled",
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  role: string;
  availability?: {
    weekdays: number[];
    startTime: string;
    endTime: string;
    timeZone: string;
  };
  expertise?: string[];
}

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  type: InterviewType;
  status: InterviewStatus;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  duration: number;
  interviewers: string[];
  location?: string;
  calendarEventId?: string;
  feedbackRequired: boolean;
  scheduledBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  candidateId: string;
  rating: number;
  strengths: string[];
  areasForImprovement: string[];
  technicalScore?: number;
  culturalFitScore?: number;
  hireRecommendation: "strong-yes" | "yes" | "no" | "strong-no";
  comments: string;
    createdAt: number;
  updatedAt: number;
  submittedAt: number;
}

export interface AvailabilityCalendar {
  interviewerId: string;
  date: string;
  slots: Array<{ start: string; end: string; available: boolean }>;
}

// ===================================================
// ================== ANALYTICS TYPES =================
// ===================================================


export type JobMetrics = {
  jobId: string;               // <--- required
  title?: string;              // optional job title
  totalApplications: number;
  hired: number;
  avgTimeToHire: number;
  hireRate: number;
    totalCandidates: number;
  totalOffers: number;
  totalHires: number;
  offerAcceptanceRate: number;

  costPerHire: number;
};
// types.ts
export interface OverallMetrics {
  totalCandidates: number;
  totalHired: number;
  avgTimeToHire: number;
  hireRate: number;
  avgCostPerHire: number;
}


export type HiringMetric = JobMetrics;

export interface PipelineFunnel {
  stage: Stage;
  count: number;
  percentage: number;
  conversionRate: number;
}
// types.ts
export type AnalyticsDashboard = {
  overallMetrics: OverallMetrics; // <- change here
  jobs: JobMetrics[];
  funnels: Record<string, PipelineFunnel[]>;
  interviewerPerformance: any;
  trends: {
    applications: number[];
    hires: number[];
    dates: string[];
  };
};



export interface ReportFilter {
  dateRange: { start: string; end: string };
  jobIds?: string[];
  departments?: string[];
  sources?: string[];
  stages?: Stage[];
}

export interface ExportFormat {
  type: "pdf" | "csv" | "excel";
  includeCharts?: boolean;
  customFields?: string[];
}

export enum BiasType {
  Gender = "gender",
  Experience = "experience",
  Location = "location",
  Education = "education",
}

export interface BiasMetric {
  interviewerId: string;
  biasType: BiasType;
  score: number;
  sampleSize: number;
  recommendations: string[];
}

// ===================================================
// ================= COMMON / UTILS =================
// ===================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    totalItems?: any;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ===================================================
// =============== ADDITIONAL MISSING TYPES =========
// ===================================================

export interface HiringReport {
  id: string;
  jobId?: string;
  title: string;
  filters: ReportFilter;
  metrics: {
    totalApplications?: number;
    screeningPassRate?: number;
    assessmentPassRate?: number;
    interviewPassRate?: number;
    offerAcceptanceRate?: number;
    timeToHire?: number;
    costPerHire?: number;
    sourceEffectiveness?: Record<string, number>;
    funnel?: PipelineFunnel[];
    interviewerPerformance?: any[];
  };
  generatedAt: number;
  exported: boolean;
}
export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
  
}


