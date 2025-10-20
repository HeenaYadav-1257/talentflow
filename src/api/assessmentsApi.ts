import { db } from '../db/db';
import { QuestionType, type Assessment, type AssessmentInvite, type AssessmentSection, type Question } from '../types';
import { CandidatesApi } from './candidatesApi';
import EmailService from '../services/emailService';

export class AssessmentsApi {
  createAssessment: any;
  getAssessmentById: any;

  // Fetch all assessments
  async getAllAssessments(filters?: { jobId?: string; status?: string }): Promise<Assessment[]> {
    let query = db.assessments.toCollection();

    if (filters?.jobId) query = query.filter(a => a.jobId === filters.jobId);
    if (filters?.status) query = query.filter(a => a.status === filters.status);

    const assessments = (await query.sortBy('createdAt')).reverse();

    return await Promise.all(assessments.map(async (assessment) => {
      if (!assessment.id) return assessment;
      const sections = await db.assessmentSections.where('assessmentId').equals(assessment.id).sortBy('order');
      const fullSections = await Promise.all(sections.map(async (section) => {
        if (!section.id) return section;
        const questions = await db.questions.where('sectionId').equals(section.id).sortBy('order');
        return { ...section, questions };
      }));
      return { ...assessment, sections: fullSections };
    }));
  }

  // Fetch assessment for a specific job
  async getAssessmentForJob(jobId: string): Promise<Assessment | null> {
    const assessment = await db.assessments.where('jobId').equals(jobId).first();
    if (!assessment || !assessment.id) return null;

    const sections = await db.assessmentSections.where('assessmentId').equals(assessment.id).sortBy('order');
    const fullSections = await Promise.all(sections.map(async (section) => {
      if (!section.id) return section;
      const questions = await db.questions.where('sectionId').equals(section.id).sortBy('order');
      return { ...section, questions };
    }));

    return { ...assessment, sections: fullSections };
  }

  async createAssessmentForJob(jobId: string, data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'sections'>): Promise<Assessment> {
    if (!jobId) throw new Error("jobId is required");

    const assessment: Assessment = {
      ...data,
      id: `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      sections: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      config: {
        timeLimit: data.config?.timeLimit || 60,
        maxAttempts: data.config?.maxAttempts || 1,
        allowResume: data.config?.allowResume !== false,
        autoGrade: true,
        passThreshold: data.config?.passThreshold || 70,
        instructions: data.config?.instructions
      }
    };

    await db.assessments.add(assessment);

    const defaultSection = await this.addSection(assessment.id, 'Default Section', 'Add your questions here');
    return { ...assessment, sections: [defaultSection] };
  }

  async updateAssessment(jobId: string, assessment: Partial<Assessment>): Promise<Assessment> {
    if (!jobId) throw new Error("jobId is required");

    const existing = await db.assessments.where('jobId').equals(jobId).first();
    if (!existing) throw new Error('Assessment not found');

    const updated = { ...existing, ...assessment, updatedAt: Date.now(), version: (existing.version || 0) + 1 };
    await db.assessments.put(updated);
    return updated;
  }

  async addSection(assessmentId: string, title: string, description?: string): Promise<AssessmentSection> {
    if (!assessmentId) throw new Error("assessmentId is required");

    const sections = await db.assessmentSections.where('assessmentId').equals(assessmentId).count();
    const section: AssessmentSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assessmentId,
      title,
      description,
      questions: [],
      order: sections,
      config: {}
    };

    await db.assessmentSections.add(section);
    return section;
  }

  async updateSection(sectionId: string, updates: Partial<AssessmentSection>): Promise<AssessmentSection | null> {
    if (!sectionId) throw new Error("sectionId is required");
    const section = await db.assessmentSections.get(sectionId);
    if (!section) return null;

    const updated = { ...section, ...updates };
    await db.assessmentSections.put(updated);
    return updated;
  }

  async deleteSection(sectionId: string): Promise<void> {
    if (!sectionId) throw new Error("sectionId is required");
    const section = await db.assessmentSections.get(sectionId);
    if (!section) return;

    const questions = await db.questions.where('sectionId').equals(sectionId).toArray();
    await db.questions.bulkDelete(questions.map(q => q.id));
    await db.assessmentSections.delete(sectionId);

    const sections = await db.assessmentSections.where('assessmentId').equals(section.assessmentId).toArray();
    await Promise.all(sections.map((s, index) => db.assessmentSections.update(s.id, { order: index })));
  }

  async addQuestion(sectionId: string, questionData: Partial<Question>): Promise<Question> {
    if (!sectionId) throw new Error("sectionId is required");
    const section = await db.assessmentSections.get(sectionId);
    if (!section) throw new Error('Section not found');

    const questionsCount = await db.questions.where('sectionId').equals(sectionId).count();

const question: Question = {
  id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  sectionId,
  type: questionData.type ?? QuestionType.ShortText, // default type
  title: questionData.title ?? 'New Question', // default title
  text: questionData.text ?? '',
  required: questionData.required ?? false,
  options: questionData.options ?? [],
  score: questionData.score ?? 10,
  order: questionsCount,
  content: questionData.content ?? '',
  timeLimit: ''
};


    await db.questions.add(question);
    return question;
  }

  async updateQuestion(questionId: string, updates: Partial<Question>): Promise<Question | null> {
    if (!questionId) throw new Error("questionId is required");
    const question = await db.questions.get(questionId);
    if (!question) return null;

    const updated = { ...question, ...updates };
    await db.questions.put(updated);
    return updated;
  }

  async deleteQuestion(questionId: string): Promise<void> {
    if (!questionId) throw new Error("questionId is required");
    await db.questions.delete(questionId);
  }

  async reorderQuestions(sectionId: string, startIndex: number, endIndex: number): Promise<void> {
    if (!sectionId) throw new Error("sectionId is required");

    const questions = await db.questions.where('sectionId').equals(sectionId).sortBy('order');
    const [removed] = questions.splice(startIndex, 1);
    questions.splice(endIndex, 0, removed);

    await Promise.all(questions.map((q, index) => db.questions.update(q.id, { order: index })));
  }

  async publishAssessment(assessmentId: string): Promise<Assessment> {
    if (!assessmentId) throw new Error("assessmentId is required");
    const assessment = await db.assessments.get(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    const published = { ...assessment, status: 'published' as const, isPublished: true };
    await db.assessments.put(published);
    return published;
  }

  async sendInvite(candidateId: string, assessmentId: string): Promise<AssessmentInvite> {
    if (!candidateId) throw new Error("candidateId is required");
    if (!assessmentId) throw new Error("assessmentId is required");

    const invite: AssessmentInvite = {
      id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      assessmentId,
      token: Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      sentAt: Date.now(),
      status: 'pending',
      attempts: 0,
      candidateEmail: ''
    };

    await db.assessmentInvites.add(invite);

    const assessment = await db.assessments.get(assessmentId);
    const candidate = await CandidatesApi.getCandidateById(candidateId);

    if (assessment && candidate && candidate.email) {
      await EmailService.sendEmail({
        to: candidate.email,
        subject: `🎯 Complete Assessment: ${assessment.title}`,
        template: 'assessment_invite',
        variables: {
          candidateName: candidate.name,
          assessmentTitle: assessment.title,
          inviteLink: `${window.location.origin}/take-assessment/${invite.token}`,
          expiresIn: '7 days'
        }
      });
    }

    return invite;
  }

  // Optional: implement getResultsForAssessment if needed
  async getResultsForAssessment(assessmentId: string): Promise<any[]> {
    return db.results.where('assessmentId').equals(assessmentId).toArray();
  }
}

// Export instance
export const assessmentsApi = new AssessmentsApi();
