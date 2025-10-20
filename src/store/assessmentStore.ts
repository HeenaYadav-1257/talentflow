import { create } from "zustand";
import { persist, devtools } from 'zustand/middleware';
// NOTE: Assuming assessmentsApi and types.ts exist with necessary definitions
import type { Assessment, AssessmentSection, Question, Result } from "../types.ts";
import { toast } from 'react-hot-toast'; 

type AssessmentCreationData = Omit<Assessment, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'sections'>;

interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  isLoading: boolean;
  results: Result[];
  error: string | null;
  previewMode: boolean;

  // Builder-compatible add-ons
  questions: Question[];
  setCurrentAssessment: (assessment: Assessment) => void;
  setLoading: (loading: boolean) => void;

  fetchAssessments: () => Promise<void>;
  fetchAssessmentByJobId: (jobId: string) => Promise<void>;
  createAssessment: (data: AssessmentCreationData & { jobId: string }) => Promise<Assessment>;
  updateAssessment: (assessment: Partial<Assessment>) => Promise<void>;
  addSection: (title: string, description?: string) => Promise<void>;
  updateSection: (sectionId: string, updates: Partial<AssessmentSection>) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  addQuestion: (sectionId: string, question: Partial<Question>) => Promise<void>;
  updateQuestion: (questionId: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  reorderQuestions: (sectionId: string, startIndex: number, endIndex: number) => Promise<void>;
  togglePreview: () => void;
  publishAssessment: () => Promise<void>;
  fetchResults: (assessmentId: string) => Promise<void>;
  
  // FIX: Added the missing signature for candidate submission
  submitAssessment: (candidateId: string, assessmentId: string, answers: any[]) => Promise<any>;
  clearError: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  devtools(
    persist(
      (set, get) => ({
        assessments: [],
        currentAssessment: null,
        isLoading: false,
        results: [],
        error: null,
        previewMode: false,

        // ========================
        // BUILDER-ADDITIONAL METHODS
        // ========================
        setCurrentAssessment: (assessment: Assessment) => set({ currentAssessment: assessment }),
        setLoading: (loading: boolean) => set({ isLoading: loading }),
        get questions() {
          return get().currentAssessment?.sections.flatMap(s => s.questions) || [];
        },

        // ========================
        // CORE FUNCTIONS (MOCKING assessmentsApi CALLS)
        // ========================
        fetchAssessments: async () => {
          set({ isLoading: true, error: null });
          try {
            // await assessmentsApi.getAllAssessments(); // Real API call
            await new Promise(r => setTimeout(r, 50)); // Mock delay
            set({ assessments: [], isLoading: false });
          } catch (err: any) {
            set({ isLoading: false, error: err.message || "Failed to fetch assessments." });
          }
        },

        fetchAssessmentByJobId: async (_jobId: string) => {
          set({ isLoading: true, error: null });
          try {
            // const assessment = await assessmentsApi.getAssessmentForJob(jobId); // Real API call
            await new Promise(r => setTimeout(r, 50)); // Mock delay
            set({ currentAssessment: null, isLoading: false });
          } catch (err: any) {
            set({ isLoading: false, error: err.message || "Assessment not found." });
          }
        },

        fetchResults: async (_assessmentId: string) => {
          set({ isLoading: true, error: null });
          try {
            // const results: Result[] = await assessmentsApi.getResultsForAssessment(assessmentId); // Real API call
            await new Promise(r => setTimeout(r, 50)); // Mock delay
            set({ results: [], isLoading: false });
          } catch (err: any) {
            set({ isLoading: false, error: err.message || "Failed to fetch results." });
          }
        },

        createAssessment: async (data) => {
          set({ isLoading: true, error: null });
          try {
            // const response = await assessmentsApi.createAssessmentForJob(data.jobId, data); // Real API call
            await new Promise(r => setTimeout(r, 50)); // Mock delay
            const mockResponse: Assessment = {
              id: 'new-id',
              title: data.title,
              jobId: data.jobId,
              sections: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              status: 'draft',
              config: { timeLimit: 60 },
              questionCount: 0,
              version: 0,
              isPublished: false
            };
            set((state) => ({
              assessments: [...state.assessments, mockResponse],
              currentAssessment: mockResponse,
              isLoading: false
            }));
            return mockResponse;
          } catch (err: any) {
            set({ isLoading: false, error: err.message || "Failed to create assessment." });
            throw err;
          }
        },

        // ... other update/delete methods are stubbed or simplified for focus ...

        // NEW: Implementation for candidate submission
        submitAssessment: async (candidateId, assessmentId, answers) => {
          set({ isLoading: true, error: null });
          try {
            // In a real app, this would call assessmentsApi.submitAssessment
            console.log(`[MOCK] Submitting answers for Assessment ${assessmentId} by Candidate ${candidateId}:`, answers);
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            const mockResult = { 
              success: true, 
              score: Math.floor(Math.random() * 100), 
              message: 'Assessment results processing initiated (Mocked).' 
            };
            
            toast.success('Assessment submission simulated successfully!');
            set({ isLoading: false });
            return mockResult;

          } catch (err: any) {
            set({ isLoading: false, error: err.message || "Failed to submit assessment." });
            throw err;
          }
        },
        
        // --- Placeholder methods to satisfy TS for this demo ---
        updateAssessment: async () => {},
        addSection: async () => {},
        updateSection: async () => {},
        deleteSection: async () => {},
        addQuestion: async () => {},
        updateQuestion: async () => {},
        deleteQuestion: async () => {},
        reorderQuestions: async () => {},
        togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),
        publishAssessment: async () => {},
        clearError: () => set({ error: null }),
      }),
      { name: 'assessment-storage' }
    ),
    { name: 'AssessmentStore' }
  )
);