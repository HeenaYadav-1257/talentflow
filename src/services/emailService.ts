// src/services/emailService.ts - COMPLETE EMAIL SERVICE
import emailjs from '@emailjs/browser';
import { db } from '../db/db';
import { type Interview, type Assessment, InterviewType, Stage } from '../types';

// Use placeholder keys since no .env file is available in this environment.
// This allows the service to initialize without crashing the app, but actual emails will fail.
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'placeholder_public_key';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'placeholder_service_id';


class EmailService {
  static init() {
    // FIX: Use the resolved variable, which defaults to a placeholder if the environment key is missing.
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY,
    });
  }

  static async sendEmail(params: {
    to: string;
    template: keyof typeof EmailService.templates; 
    variables: Record<string, any>;
    subject?: string;
  }) {
    // If we're using placeholders, log a warning instead of trying to send a real email
    if (EMAILJS_PUBLIC_KEY === 'placeholder_public_key' || EMAILJS_SERVICE_ID === 'placeholder_service_id') {
      console.warn('⚠️ EmailService is using placeholder keys. Email sending is simulated and will fail in production.');
      console.log('Simulated Email Params:', params);
      return { success: true, status: 200, text: 'Simulated success due to placeholder keys.' };
    }

    try {
      const templateConfig = this.templates[params.template];
      if (!templateConfig) {
        throw new Error(`Template ${params.template} not found`);
      }

      // Use the resolved service ID
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        templateConfig.templateId,
        {
          to_email: params.to,
          to_name: params.variables.candidateName || 'Candidate',
          ...params.variables,
          subject: params.subject || templateConfig.subject,
        }
      );

      console.log('✅ Email sent:', result.status, result.text);
      return { success: true, status: result.status };
    } catch (error: any) {
      console.error('❌ Email failed:', error);
      return { success: false, error: error.text || error.message };
    }
  }

  // ===== ASSESSMENT EMAILS =====
  static async sendAssessmentInvite(candidateId: string, assessment: Assessment) {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) return { success: false, error: 'Candidate not found' };

    const inviteLink = `${window.location.origin}/assessment/${assessment.id}?token=${this.generateToken(candidateId, assessment.id)}`;

    return this.sendEmail({
      to: candidate.email,
      template: 'assessment_invite',
      variables: {
        candidateName: candidate.name,
        assessmentTitle: assessment.title,
        jobTitle: 'Job Title',
        inviteLink,
        instructions: 'Complete this assessment within 7 days. Good luck!'
      }
    });
  }

  static async sendAssessmentCompletion(candidateId: string, assessment: Assessment, score?: number) {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) return { success: false };

    return this.sendEmail({
      to: candidate.email,
      template: 'assessment_completed',
      variables: {
        candidateName: candidate.name,
        assessmentTitle: assessment.title,
        score: score?.toFixed(1) || 'Pending review',
        nextSteps: 'Our team will review your submission and contact you soon.'
      }
    });
  }

  // ===== INTERVIEW EMAILS =====
  static async sendInterviewInvite(candidateId: string, interview: Interview) {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) return { success: false, error: 'Candidate not found' };

    const videoLink = interview.location || this.generateVideoLink(interview);
    const interviewers = await Promise.all(
      interview.interviewers.map((id: string) => db.interviewers.get(id))
    ).then(interviewers => interviewers.filter(Boolean).map(i => i!.name).join(', '));

    return this.sendEmail({
      to: candidate.email,
      template: 'interview_invite',
      variables: {
        candidateName: candidate.name,
        interviewTitle: interview.title,
        interviewType: interview.type,
        dateTime: new Date(interview.startTime).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        duration: `${interview.duration} minutes`,
        videoLink,
        interviewers,
        instructions: 'Please join 10 minutes early to test your connection and setup.'
      }
    });
  }

  static async sendInterviewerNotification(interviewerId: string, interview: Interview) {
    const interviewer = await db.interviewers.get(interviewerId);
    if (!interviewer) return { success: false, error: 'Interviewer not found' };

    const candidate = await db.candidates.get(interview.candidateId);
    
    return this.sendEmail({
      to: interviewer.email,
      template: 'interviewer_assignment',
      variables: {
        interviewerName: interviewer.name,
        candidateName: candidate?.name || 'Candidate',
        interviewTitle: interview.title,
        interviewType: interview.type,
        dateTime: new Date(interview.startTime).toLocaleString(),
        duration: `${interview.duration} minutes`,
        videoLink: interview.location || 'TBD',
        preparation: this.getInterviewerPrep(interview.type),
        feedbackLink: `${window.location.origin}/feedback/${interview.id}?interviewer=${interviewerId}`
      }
    });
  }

  static async sendInterviewReminder(interview: Interview) {
    const [candidateResult, interviewerResults] = await Promise.all([
      this.sendInterviewInvite(interview.candidateId, interview),
      ...interview.interviewers.map((id: string) => this.sendInterviewerNotification(id, interview))
    ]);

    return { candidate: candidateResult, interviewers: interviewerResults };
  }

  static async sendFeedbackSummary(candidateId: string, interview: Interview) {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) return { success: false };

    const feedback = await db.getInterviewFeedback(interview.id);
    const avgRating = feedback.reduce((sum: any, f: { rating: any; }) => sum + (f.rating || 0), 0) / feedback.length;

    return this.sendEmail({
      to: candidate.email,
      template: 'interview_feedback', // ✅ Now exists in templates
      variables: {
        candidateName: candidate.name,
        interviewTitle: interview.title,
        avgRating: avgRating.toFixed(1),
        feedbackSummary: 'Your interview was successful! Team feedback is being compiled.',
        nextSteps: 'Expect an update within 48 hours.'
      }
    });
  }

  // ===== CANDIDATE EMAILS =====
  static async sendStageUpdate(candidateId: string, newStage: Stage, jobTitle: string) {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) return { success: false };

    return this.sendEmail({
      to: candidate.email,
      template: 'stage_update',
      variables: {
        candidateName: candidate.name,
        jobTitle,
        newStage: newStage,
        stageLabel: this.getStageLabel(newStage),
        instructions: 'Continue your application process by completing the next steps.'
      }
    });
  }

  static async sendOfferLetter(candidateId: string, jobId: string) {
    const [candidate, job] = await Promise.all([
      db.candidates.get(candidateId),
      db.jobs.get(jobId)
    ]);

    if (!candidate || !job) return { success: false };

    return this.sendEmail({
      to: candidate.email,
      template: 'offer_letter',
      variables: {
        candidateName: candidate.name,
        jobTitle: job.title,
        salary: job.salary,
        instructions: 'Please review and respond within 48 hours.',
        acceptLink: `${window.location.origin}/offer/${jobId}/accept`,
        declineLink: `${window.location.origin}/offer/${jobId}/decline`
      }
    });
  }

  // ===== UTILITY METHODS =====
  private static generateToken(candidateId: string, assessmentId: string): string {
    return btoa(`${candidateId}-${assessmentId}-${Date.now()}`);
  }

  private static generateVideoLink(interview: Interview): string {
    const baseUrl = interview.type === 'technical' 
      ? 'https://zoom.us/j/' 
      : 'https://meet.google.com/';
    return `${baseUrl}${Math.random().toString(36).substring(7)}`;
  }

  private static getInterviewerPrep(type: InterviewType): string {
    const prep: Record<InterviewType, string> = {
      [InterviewType.Phone]: 'Review candidate resume and basic qualifications.',
      [InterviewType.Video]: 'Prepare behavioral and cultural fit questions.',
      [InterviewType.Technical]: 'Prepare coding challenges and technical questions.',
      [InterviewType.Behavioral]: 'Focus on soft skills, teamwork, and experience.',
      [InterviewType.Panel]: 'Coordinate with panel members on evaluation criteria.',
      [InterviewType.Final]: 'Discuss compensation expectations and closing questions.'
    };
    return prep[type] || 'Review candidate profile and prepare questions.';
  }

  private static getStageLabel(stage: Stage): string {
    const labels: Record<Stage, string> = {
      [Stage.Applied]: 'Application Received',
      [Stage.Screen]: 'Phone Screening',
      [Stage.Tech]: 'Technical Assessment',
      [Stage.Offer]: 'Offer Extended',
      [Stage.Hired]: 'Onboarding',
      [Stage.Rejected]: 'Not Selected',
      [Stage.map]: ''
    };
    return labels[stage];
  }

  // EMAIL TEMPLATES CONFIGURATION
  static templates = {
    assessment_invite: {
      templateId: 'assessment_invite_template',
      subject: '📝 Assessment Invitation - {{assessmentTitle}}',
      html: `...`
    },

    assessment_completed: {
      templateId: 'assessment_completed_template',
      subject: '✅ Assessment Submitted - Thank You!',
      html: `...`
    },

    interview_invite: {
      templateId: 'interview_invite_template',
      subject: '📅 Interview Scheduled: {{interviewTitle}}',
      html: `...`
    },

    interviewer_assignment: {
      templateId: 'interviewer_assignment_template',
      subject: '👤 New Interview Assignment: {{interviewTitle}}',
      html: `...`
    },

    stage_update: {
      templateId: 'stage_update_template',
      subject: '📈 Application Update: {{newStage}}',
      html: `...`
    },

    offer_letter: {
      templateId: 'offer_letter_template',
      subject: '🎉 Job Offer: {{jobTitle}}',
      html: `...`
    },

    // ✅ New template added
    interview_feedback: {
      templateId: 'interview_feedback_template',
      subject: '📝 Interview Feedback - {{interviewTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #1e40af;">Interview Feedback</h2>
          <p>Dear {{candidateName}},</p>
          <p>Your interview for <strong>{{interviewTitle}}</strong> has been evaluated.</p>
          <div style="background: #e0f7fa; padding: 20px; border-radius: 8px;">
            <p><strong>Average Rating:</strong> {{avgRating}}</p>
            <p>{{feedbackSummary}}</p>
            <p>{{nextSteps}}</p>
          </div>
          <p>Best regards,<br/>TalentFlow Team</p>
        </div>
      `
    }
  };
}

// Initialize on app start
EmailService.init();

export default EmailService;
