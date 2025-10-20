import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { db } from '../db/db';
import { type Interview, type Interviewer, type InterviewFeedback, InterviewStatus } from '../types';
import EmailService from '../services/emailService';

interface InterviewState {
  interviews: Interview[];
  interviewers: Interviewer[];
  isLoading: boolean;
  error: string | null;

  fetchInterviews: (jobId?: string) => Promise<void>;
  fetchInterviewers: () => Promise<void>;
  createInterview: (data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Interview>;
  updateInterview: (interviewId: string, updates: Partial<Interview>) => Promise<void>;
  deleteInterview: (interviewId: string) => Promise<void>;
  submitFeedback: (feedback: Omit<InterviewFeedback, 'id' | 'submittedAt'>) => Promise<InterviewFeedback>;
  getAvailableSlots: (interviewerId: string, date: string) => Promise<Interview[]>;
  sendInterviewReminders: () => Promise<void>;
  clearError: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  devtools(
    persist(
      (set, get) => ({
        interviews: [],
        interviewers: [],
        isLoading: false,
        error: null,

        fetchInterviews: async (jobId?: string) => {
          set({ isLoading: true, error: null });
          try {
            const interviews = jobId 
              ? await db.interviews.where('jobId').equals(jobId).toArray()
              : await db.interviews.toArray();
            
            // Sort by start time, most recent first
            const sorted = interviews.sort((a, b) => b.startTime - a.startTime);
            set({ interviews: sorted, isLoading: false });
          } catch (err: any) {
            set({ isLoading: false, error: err.message });
          }
        },

        fetchInterviewers: async () => {
          try {
            const interviewers = await db.interviewers.toArray();
            set({ interviewers });
          } catch (err: any) {
            set({ error: err.message });
          }
        },

        createInterview: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const interview = await db.createInterview(data);
            
            // Send email notifications
            await Promise.all([
              EmailService.sendInterviewInvite(data.candidateId, interview),
              ...data.interviewers.map(interviewerId => 
                EmailService.sendInterviewerNotification(interviewerId, interview)
              )
            ]);

            set((state) => ({
              interviews: [...state.interviews, interview],
              isLoading: false
            }));

            return interview;
          } catch (err: any) {
            set({ isLoading: false, error: err.message });
            throw err;
          }
        },

        updateInterview: async (interviewId, updates) => {
          try {
            await db.interviews.update(interviewId, { ...updates, updatedAt: Date.now() });
            set((state) => ({
              interviews: state.interviews.map(i => 
                i.id === interviewId ? { ...i, ...updates } : i
              )
            }));
          } catch (err: any) {
            set({ error: err.message });
            throw err;
          }
        },

        deleteInterview: async (interviewId) => {
          if (!confirm('Cancel this interview?')) return;
          
          try {
            const interview = await db.interviews.get(interviewId);
            if (!interview) return;

            // Release blocked slots
            for (const interviewerId of interview.interviewers) {
              await db.releaseInterviewerSlots(interviewerId, interview.startTime, interview.endTime);
            }

            await db.interviews.delete(interviewId);
            set((state) => ({
              interviews: state.interviews.filter(i => i.id !== interviewId)
            }));
          } catch (err: any) {
            set({ error: err.message });
          }
        },

        submitFeedback: async (feedback) => {
          try {
            const savedFeedback = await db.submitFeedback(feedback);
            
            // Send feedback to candidate if completed
            const interview = await db.interviews.get(feedback.interviewId);
            if (interview?.status === InterviewStatus.Completed) {
              await EmailService.sendFeedbackSummary(feedback.candidateId, interview);
            }
            
            return savedFeedback;
          } catch (err: any) {
            set({ error: err.message });
            throw err;
          }
        },

        getAvailableSlots: async (interviewerId, date) => {
  const startOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);
  
  return await db.getInterviewerAvailability(interviewerId, startOfDay, endOfDay);
},

        sendInterviewReminders: async () => {
          const now = Date.now();
          const oneHourFromNow = now + (60 * 60 * 1000);
          
          const upcoming = get().interviews.filter(i => 
            i.status === InterviewStatus.Scheduled &&
            i.startTime <= oneHourFromNow &&
            i.startTime > now
          );

          for (const interview of upcoming) {
            await EmailService.sendInterviewReminder(interview);
          }
        },

        clearError: () => set({ error: null })
      }),
      { name: 'interview-storage' }
    ),
    { name: 'InterviewStore' }
  )
);
