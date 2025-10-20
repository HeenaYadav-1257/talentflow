// src/api/candidatesApi.ts - COMPLETE API WITH BULK ACTIONS + RESUME + EMAIL
import { db } from '../db/db';
import type { Candidate, Stage, CandidateTimeline, CandidateNote } from '../types';
import type { Job } from '../types';
import { ResumeParser } from '../utils/resumeParser';
import  EmailService  from '../services/emailService';

export interface CandidateFilters {
  search?: string;
  stage?: Stage | 'all';
  jobId?: string;
  page: number;
  pageSize: number;
  archived?: boolean;
  skills?: string[];
  minAppliedDate?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class CandidatesApi {
  static getCandidateById: any;
  static getJobForCandidate: any;
  archiveCandidate: any;
   async fetchCandidates(filters: CandidateFilters): Promise<{ data: Candidate[]; meta: PaginationMeta }> {
    const { search, stage, jobId, page = 1, pageSize = 20, archived, skills, minAppliedDate } = filters;
    
    let query = db.candidates.toCollection();
    
    // Archived filter
    if (archived !== undefined) {
      query = query.filter(c => c.isArchived === archived);
    }
    
    // Job linking filter
    if (jobId) {
      query = query.filter(c => c.jobId === jobId);
    }
    
    // Stage filter
    if (stage && stage !== 'all') {
      query = query.filter(c => c.stage === stage);
    }
    
    // Skills filter
    if (skills && skills.length > 0) {
      query = query.filter(c => 
        skills.some(skill => 
          (c.skills || []).some((candidateSkill: string) => 
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    // Date filter
    if (minAppliedDate) {
      query = query.filter(c => c.appliedAt >= minAppliedDate);

    }
    
    // Search filter
    if (search?.trim()) {
      const searchLower = search.toLowerCase();
      query = query.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        (c.skills || []).some((skill: string) => skill.toLowerCase().includes(searchLower))
      );
    }
    
    const total = await query.count();
    const totalPages = Math.ceil(total / pageSize);
    
    // Sort by appliedAt descending, then stage
   const allCandidates = await query.toArray();
allCandidates.sort((a, b) => {
  const dateDiff = b.appliedAt - a.appliedAt;
  if (dateDiff !== 0) return dateDiff;
  return a.stage.localeCompare(b.stage);
});

    
    const offset = (page - 1) * pageSize;
    const candidates = await query.offset(offset).limit(pageSize).toArray();
    
    return {
      data: candidates,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
  
   async applyToJob(jobId: string, candidateData: Omit<Candidate, 'id' | 'appliedAt' | 'stage' | 'timeline'>): Promise<Candidate> {
    const newCandidate: Candidate = {
      ...candidateData,
      id: `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jobId,
      stage: 'applied' as Stage,
      appliedAt: Date.now(),
      timeline: [{
  id: `timeline-${Date.now()}`,
  candidateId: '', // will update later
  type: 'application',
  description: 'Application submitted',
  toStage: undefined, // don't call getCandidateById here, it's undefined
  timestamp: Date.now()

      }],
      isArchived: false,
      skills: candidateData.skills || []
    };
    
    const id = await db.candidates.add(newCandidate);
    
    // Update timeline with actual candidate ID
    if (newCandidate.timeline && newCandidate.timeline.length > 0) {
  await db.candidateTimeline.update(newCandidate.timeline[0].id, {
    candidateId: id.toString()
  });
}

    // Update candidate with correct ID
    const finalCandidate = { ...newCandidate, id: id.toString() };
    await db.candidates.put(finalCandidate);
    
    return finalCandidate;
  }
  
  async updateCandidateStage(candidateId: string, newStage: Stage): Promise<Candidate> {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) throw new Error('Candidate not found');
    
    const updatedCandidate = { ...candidate, stage: newStage };
    await db.candidates.put(updatedCandidate);
    
    // Add timeline entry
    const timelineEntry: CandidateTimeline = {
      id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      type: 'stage_change',
      description: `Stage updated to ${newStage}`,
      toStage: newStage,
      timestamp: Date.now()
    };
    
    await db.candidateTimeline.add(timelineEntry);
    
    // Send email notification
    await this.sendStageChangeEmail(candidateId, newStage);
    
    return updatedCandidate;
  }
  
  async bulkUpdateStage(candidateIds: string[], newStage: Stage): Promise<void> {
    const bulkUpdates = candidateIds.map(async (candidateId) => {
      try {
        const candidate = await db.candidates.get(candidateId);
        if (!candidate) return;
        
        const updatedCandidate = { ...candidate, stage: newStage };
        await db.candidates.put(updatedCandidate);
        
        // Add timeline entry for bulk action
        await db.candidateTimeline.add({
          id: `timeline-${Date.now()}-${candidateId}`,
          candidateId,
          type: 'bulk_stage_change',
          description: `Bulk moved to ${newStage}`,
          toStage: newStage,
          timestamp: Date.now()
        });
        
        // Send email for bulk actions (optional - could be throttled)
        if (candidateIds.length <= 10) { // Limit bulk emails
          await this.sendStageChangeEmail(candidateId, newStage);
        }
      } catch (error) {
        console.error(`Failed to update candidate ${candidateId}:`, error);
      }
    });
    
    await Promise.allSettled(bulkUpdates);
  }
  
  async archiveCandidates(candidateIds: string[]): Promise<void> {
    const bulkUpdates = candidateIds.map(async (candidateId) => {
      const candidate = await db.candidates.get(candidateId);
      if (!candidate) return;
      
      await db.candidates.put({ ...candidate, isArchived: true });
      
      // Add timeline entry
      await db.candidateTimeline.add({
        id: `timeline-${Date.now()}-${candidateId}`,
        candidateId,
        type: 'archived',
        description: 'Candidate archived',
        toStage: candidate.stage,
        timestamp: Date.now()
      });
    });
    
    await Promise.allSettled(bulkUpdates);
  }
  
  async unarchiveCandidates(candidateIds: string[]): Promise<void> {
    const bulkUpdates = candidateIds.map(async (candidateId) => {
      const candidate = await db.candidates.get(candidateId);
      if (!candidate || !candidate.isArchived) return;
      
      await db.candidates.put({ ...candidate, isArchived: false });
    });
    
    await Promise.allSettled(bulkUpdates);
  }
  
  async updateCandidate(candidateId: string, updates: Partial<Candidate>): Promise<Candidate> {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) throw new Error('Candidate not found');
    
    const updatedCandidate = { ...candidate, ...updates };
    await db.candidates.put(updatedCandidate);
    
    // Add timeline entry for significant updates
    if (updates.stage || updates.status) {
      await db.candidateTimeline.add({
        id: `timeline-${Date.now()}`,
        candidateId,
        type: 'update',
        description: `Candidate details updated`,
        toStage: updates.stage || candidate.stage,
        timestamp: Date.now()
      });
    }
    
    return updatedCandidate;
  }
  
  async getCandidateById(candidateId: string): Promise<Candidate | null> {
  const candidate = await db.candidates.get(candidateId);
  return candidate ?? null;
}

  
  async getCandidateTimeline(candidateId: string): Promise<CandidateTimeline[]> {
    return await (await db.candidateTimeline
      .where('candidateId')
      .equals(candidateId)
      .sortBy('timestamp'))
      .reverse();
  }
  
  async getCandidateNotes(candidateId: string): Promise<CandidateNote[]> {
    return await (await db.candidateNotes
      .where('candidateId')
      .equals(candidateId)
      .sortBy('createdAt'))
      .reverse();
  }
  
  async addNote(candidateId: string, content: string): Promise<CandidateNote> {
    const note: CandidateNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      content,
      createdAt: Date.now(),
      createdBy: 'system',
mentions: []
 // TODO: Get from auth context
    };
    
    await db.candidateNotes.add(note);
    
    // Add to timeline
    const candidate = await this.getCandidateById(candidateId);

await db.candidateTimeline.add({
  id: `timeline-${Date.now()}-note`,
  candidateId,
  type: 'note_added',
  description: `Note added: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
  toStage: candidate?.stage ?? undefined,
  timestamp: Date.now(),
});

    
    return note;
  }
  
  async deleteNote(noteId: string): Promise<void> {
    await db.candidateNotes.delete(noteId);
  }
  
  async parseAndCreateFromResume(jobId: string, resumeFile: File): Promise<Candidate> {
  const parsedData = await ResumeParser.parseResume(resumeFile);

  const candidateData: Omit<Candidate, 'id' | 'appliedAt' | 'stage' | 'timeline'> = {
    name: parsedData.name ?? "Unknown Candidate",
    email: parsedData.email ?? "unknown@example.com",
    phone: parsedData.phone ?? "0000000000",
    jobId,
    resumeFile: resumeFile.name,
    source: 'resume_upload',
    skills: parsedData.skills || [],
    assessments: undefined,
    notes: []
  };

  return await this.applyToJob(jobId, candidateData);
}

  async getJobForCandidate(candidateId: string): Promise<Job | null> {
  const candidate = await db.candidates.get(candidateId);
  if (!candidate?.jobId) return null;

  const job = await db.jobs.get(candidate.jobId);
  return job ?? null;
}

  
  async getCandidatesByJob(jobId: string): Promise<Candidate[]> {
    return await db.candidates.where('jobId').equals(jobId).toArray();
  }
  
  static async searchCandidates(query: string): Promise<Candidate[]> {
    const candidates = await db.candidates.toCollection().toArray();
    const searchLower = query.toLowerCase();
    
    return candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      (candidate.skills || []).some((skill: string) => skill.toLowerCase().includes(searchLower))
    );
  }
  
  async getCandidateStats(): Promise<{
    total: number;
    byStage: Record<Stage, number>;
    byJob: Record<string, number>;
    newThisWeek: number;
  }> {
    const candidates = await db.candidates.toCollection().toArray();
    
    const byStage = candidates.reduce((acc, c) => {
      acc[c.stage] = (acc[c.stage] || 0) + 1;
      return acc;
    }, {} as Record<Stage, number>);
    
    const byJob = candidates.reduce((acc, c) => {
      acc[c.jobId] = (acc[c.jobId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
   const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
const newThisWeek = candidates.filter(c => c.appliedAt > oneWeekAgo).length;

    return {
      total: candidates.length,
      byStage,
      byJob,
      newThisWeek
    };
  }
  
  async deleteCandidate(candidateId: string): Promise<void> {
    // Delete related timeline and notes first
    await db.candidateTimeline.where('candidateId').equals(candidateId).delete();
    await db.candidateNotes.where('candidateId').equals(candidateId).delete();
    
    // Delete candidate
    await db.candidates.delete(candidateId);
  }
  
  // PRIVATE METHODS
  private async sendStageChangeEmail(candidateId: string, newStage: Stage): Promise<void> {
    try {
      const candidate = await this.getCandidateById(candidateId);
      if (!candidate) return;
      
      const job = await this.getJobForCandidate(candidateId);
      
      await EmailService.sendEmail({
  to: candidate.email,
  subject: `Application Update: ${newStage} - ${job?.title}`,
  template: 'stage_update', // ✅ fix here
  variables: {
    candidateName: candidate.name,
    jobTitle: job?.title || 'position',
    nextStage: newStage.charAt(0).toUpperCase() + newStage.slice(1)
  }
});

      
      // Log email sent to timeline
      await db.candidateTimeline.add({
        id: `timeline-${Date.now()}-email`,
        candidateId,
        type: 'email_sent',
        description: `Status update email sent for ${newStage}`,
        toStage: newStage,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to send stage change email:', error);
    }
  }
  
  static async sendBulkEmail(
  candidateIds: string[],
  template: 'interview' | 'rejection' | 'status_update',
  variables: any
): Promise<void> {
  // Map your templates to allowed EmailService templates
  const templateMap: Record<string, 
    'stage_update' | 'assessment_invite' | 'assessment_completed' | 'interview_invite' | 'interviewer_assignment' | 'offer_letter' | 'interview_feedback'
  > = {
    status_update: 'stage_update',
    interview: 'interview_invite',
    rejection: 'offer_letter', // or another existing type
  };

  const emails = candidateIds.map(async (candidateId) => {
    const candidate = await this.getCandidateById(candidateId);
    if (!candidate) return;

    const job = await this.getJobForCandidate(candidateId);

    // Use static method correctly
    return EmailService.sendEmail({
      to: candidate.email,
      subject: `${template} - ${job?.title || 'Application Update'}`,
      template: templateMap[template], // <- mapped template
      variables: {
        ...variables,
        candidateName: candidate.name,
        jobTitle: job?.title || 'position'
      }
    });
  });

  await Promise.allSettled(emails);
}

}
 
export const candidatesApi = new CandidatesApi();