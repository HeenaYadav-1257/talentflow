import Dexie from 'dexie';
import type { Job, Candidate, Assessment, AssessmentResponse } from '@/types';


export class AppDB extends Dexie {
  jobs!: Dexie.Table<Job, string>;
  candidates!: Dexie.Table<Candidate, string>;
  assessments!: Dexie.Table<Assessment, string>;
  assessmentResponses!: Dexie.Table<AssessmentResponse, string>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id,title,status,tags,createdAt,updatedAt',
      candidates: 'id,name,email,jobId,stage',
      assessments: 'id,jobId,title,questions',
      assessmentResponses: 'id,candidateId,assessmentId,responses',
    });
  }
}

export const db = new AppDB();
