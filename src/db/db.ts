// src/db/db.ts
import Dexie, { type Table } from "dexie";
import {
  EmploymentType,
  InterviewStatus,
  InterviewType,
  type Job, JobStatus,
  QuestionType,
  Stage,
  type Candidate, type CandidateNote, type CandidateTimeline,
  type Assessment, type AssessmentSection, type Question,
  type AssessmentResponse, type Interviewer, type Interview, type InterviewSlot,
  type InterviewFeedback, type AvailabilityCalendar,
  type HiringMetric, type PipelineFunnel,
  type AnalyticsCache, type HiringReport
} from "../types";

interface DatabaseSchema {
  jobs: Table<Job, string>;
  candidates: Table<Candidate, string>;
  assessments: Table<Assessment, string>;
  assessmentSections: Table<AssessmentSection, string>;
  questions: Table<Question, string>;
  candidateNotes: Table<CandidateNote, string>;
  candidateTimeline: Table<CandidateTimeline, string>;
  assessmentResponses: Table<AssessmentResponse, string>;
  interviewers: Table<Interviewer, string>;
  interviews: Table<Interview, string>;
  interviewSlots: Table<InterviewSlot, string>;
  interviewFeedback: Table<InterviewFeedback, string>;
  availabilityCalendars: Table<AvailabilityCalendar, string>;
  analyticsCache: Table<AnalyticsCache, string>;
  hiringReports: Table<HiringReport, string>;
}

class TalentFlowDB extends Dexie implements DatabaseSchema {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  assessments!: Table<Assessment, string>;
  assessmentSections!: Table<AssessmentSection, string>;
  questions!: Table<Question, string>;
  candidateNotes!: Table<CandidateNote, string>;
  candidateTimeline!: Table<CandidateTimeline, string>;
  assessmentResponses!: Table<AssessmentResponse, string>;
  interviewers!: Table<Interviewer, string>;
  interviews!: Table<Interview, string>;
  interviewSlots!: Table<InterviewSlot, string>;
  interviewFeedback!: Table<InterviewFeedback, string>;
  availabilityCalendars!: Table<AvailabilityCalendar, string>;
  analyticsCache!: Table<AnalyticsCache, string>;
  hiringReports!: Table<HiringReport, string>;
  calculateHiringMetrics: any;
  cacheAnalytics: any;
  getInterviewerPerformance: any;
  getCachedAnalytics: any;
  createInterview: any;
  releaseInterviewerSlots: any;
  submitFeedback: any;
  getInterviewerAvailability: any;
  getInterviewFeedback: any;
  assessmentInvites: any;
  results: any;
  updateCandidateStage: any;

  constructor() {
    super("TalentFlowDB");

    // ---------------- Version 11 ----------------
    this.version(11).stores({
      jobs: "id, title, department, location, type, status, slug, salary, order, [department+status]",
      candidates: "id, jobId, name, email, stage, appliedAt, [jobId+stage]",
      assessments: "id, jobId, title, isPublished, createdAt, updatedAt, [jobId]",
      assessmentSections: "id, assessmentId, title, order, [assessmentId]",
      questions: "id, sectionId, type, order, title, text, [sectionId], [type]",
      candidateNotes: "id, candidateId, createdBy, createdAt, [candidateId+createdAt]",
      candidateTimeline: "id, candidateId, type, timestamp, [candidateId+timestamp]",
      assessmentResponses: "id, assessmentId, candidateId, submittedAt, score, [assessmentId+candidateId]",
      interviewers: "id, name, email, role, [role+name]",
      interviews: "id, candidateId, jobId, type, status, startTime, [candidateId+type], [candidateId+startTime], [jobId]",
      interviewSlots: "id, interviewerId, startTime, endTime, status, [interviewerId+startTime]",
      interviewFeedback: "id, interviewId, interviewerId, rating, submittedAt, [interviewId+interviewerId]",
      availabilityCalendars: "id, interviewerId, date, [interviewerId]",
      hiringReports: "id, jobId, title, generatedAt, [jobId]"
      // analyticsCache not yet defined
    });

    this.version(11).upgrade(async (tx) => {
      await tx.table('hiringReports').toArray();
    });

    // ---------------- Version 12 ----------------
    this.version(12).stores({
      analyticsCache: "id, generatedAt, expiresAt"
    }).upgrade(async (tx) => {
      await tx.table('analyticsCache').toArray();
      await this.migrateToVersion12(tx);
    });

    this.tables.forEach((table) => {
      table.hook('creating', (primKey, obj, _trans) =>
        this.enforceDataIntegrity(table.name, primKey, obj)
      );
      table.hook('updating', (mods, primKey, obj, _trans) =>
        this.validateUpdates(table.name, primKey, obj, { ...obj, ...mods })
      );
    });
  }

  private async enforceDataIntegrity(tableName: string, _key: any, obj: any): Promise<void> {
    const now = Date.now();
    switch (tableName) {
      case 'jobs':
        if (!Object.values(JobStatus).includes(obj.status))
          throw new Error(`Invalid job status: ${obj.status}`);
        if (!Object.values(EmploymentType).includes(obj.type))
          throw new Error(`Invalid employment type: ${obj.type}`);
        break;
      case 'candidates':
        if (obj.jobId && !(await this.jobs.get(obj.jobId)))
          throw new Error(`Job ${obj.jobId} not found`);
        if (!Object.values(Stage).includes(obj.stage))
          throw new Error(`Invalid stage: ${obj.stage}`);
        break;
    }
    if (!obj.createdAt) obj.createdAt = now;
    if (!obj.updatedAt) obj.updatedAt = now;
  }

  private async validateUpdates(tableName: string, _key: any, _oldObj: any, newObj: any): Promise<void> {
    if (tableName === 'candidates' && newObj.stage && !Object.values(Stage).includes(newObj.stage))
      throw new Error(`Invalid stage: ${newObj.stage}`);
    newObj.updatedAt = Date.now();
  }

  private async migrateToVersion12(_tx: any): Promise<void> {}
}

export const db = new TalentFlowDB();
