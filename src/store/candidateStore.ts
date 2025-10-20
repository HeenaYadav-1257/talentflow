// src/store/candidateStore.ts
import { create } from "zustand";
import { candidatesApi } from "../api/candidatesApi";
import { type Candidate, type CandidateFilters, type Stage, type CandidateTimeline } from "../types";
import { type Job } from "../types";

interface CandidateState {
  candidates: Candidate[];
  filters: CandidateFilters & { jobId?: string };
  pagination: any;
  isLoading: boolean;
  error: string | null;
  selectedCandidate: Candidate | null;
  selectedCandidates: Set<string>;
  timeline: CandidateTimeline[];
  currentJob: Job | null;

  fetchCandidates: (jobId?: string) => Promise<void>;
  setFilter: (key: keyof (CandidateFilters & { jobId?: string }), value: any) => void;
  updateCandidateStage: (candidateId: string, newStage: Stage) => Promise<void>;
  bulkUpdateStage: (candidateIds: string[], newStage: Stage) => Promise<void>;
  archiveCandidates: (candidateIds: string[]) => Promise<void>;
  fetchCandidateById: (id: string) => Promise<void>;
  fetchTimeline: (candidateId: string) => Promise<void>;
  addNote: (candidateId: string, content: string) => Promise<void>;
  applyToJob: (jobId: string, candidateData: Omit<Candidate, 'id' | 'appliedAt' | 'stage' | 'timeline'>) => Promise<Candidate | null>;
  resetFilters: () => void;
  clearError: () => void;
  setCurrentJob: (job: Job) => void;
  toggleCandidateSelection: (candidateId: string) => void;
}

const defaultFilters: CandidateFilters & { jobId?: string } = {
  search: "",
  stage: "all",
  page: 1,
  pageSize: 20,
  jobId: undefined
};

export const useCandidateStore = create<CandidateState>((set, get) => ({
  candidates: [],
  filters: defaultFilters,
  pagination: null,
  isLoading: false,
  error: null,
  selectedCandidate: null,
  selectedCandidates: new Set(),
  timeline: [],
  currentJob: null,

  setCurrentJob: (job: Job) => set({ currentJob: job }),

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: key !== "page" ? 1 : value,
      },
    }));
    get().fetchCandidates();
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchCandidates();
  },

  fetchCandidates: async (jobId?: string) => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      const effectiveJobId = jobId || filters.jobId;
      const { data, meta } = await candidatesApi.fetchCandidates({
        ...filters,
        jobId: effectiveJobId,
        pageSize: filters.pageSize || 20,
      });

      set({
        candidates: data,
        pagination: meta,
        isLoading: false,
      });
    } catch (err: any) {
      console.error("Failed to fetch candidates:", err);
      set({ isLoading: false, error: err.message || "Failed to fetch candidates." });
    }
  },

  updateCandidateStage: async (candidateId: string, newStage: Stage) => {
    const oldCandidates = [...get().candidates];
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === candidateId ? { ...c, stage: newStage } : c
      ),
    }));

    try {
      const updatedCandidate = await candidatesApi.updateCandidateStage(candidateId, newStage);
      if (updatedCandidate) {
        set((state) => ({
          candidates: state.candidates.map(c => c.id === candidateId ? updatedCandidate : c)
        }));
      }
    } catch (err: any) {
      console.error("Failed to update candidate stage:", err);
      set({ candidates: oldCandidates, error: err.message || "Failed to update stage." });
    }
  },

  bulkUpdateStage: async (candidateIds: string[], newStage: Stage) => {
    const oldCandidates = [...get().candidates];
    set((state) => ({
      candidates: state.candidates.map(c =>
        candidateIds.includes(c.id) ? { ...c, stage: newStage } : c
      ),
    }));

    try {
      await Promise.all(candidateIds.map(id => candidatesApi.updateCandidateStage(id, newStage)));
    } catch (err: any) {
      console.error("Failed to bulk update stages:", err);
      set({ candidates: oldCandidates, error: err.message || "Failed to bulk update stages." });
    }
  },

  archiveCandidates: async (candidateIds: string[]) => {
    const oldCandidates = [...get().candidates];
    set((state) => ({
      candidates: state.candidates.filter(c => !candidateIds.includes(c.id))
    }));

    try {
      await Promise.all(candidateIds.map(id => candidatesApi.archiveCandidate(id)));
    } catch (err: any) {
      console.error("Failed to archive candidates:", err);
      set({ candidates: oldCandidates, error: err.message || "Failed to archive candidates." });
    }
  },

  fetchCandidateById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const candidate = await candidatesApi.getCandidateById(id);
      set({ selectedCandidate: candidate, isLoading: false });
    } catch (err: any) {
      console.error("Failed to fetch candidate:", err);
      set({ isLoading: false, error: err.message || "Failed to fetch candidate." });
    }
  },

  fetchTimeline: async (candidateId: string) => {
    try {
      const timeline = await candidatesApi.getCandidateTimeline(candidateId);
      set({ timeline });
    } catch (err: any) {
      console.error("Failed to fetch timeline:", err);
      set({ error: err.message || "Failed to fetch timeline." });
    }
  },

  addNote: async (candidateId: string, content: string) => {
    try {
      await candidatesApi.addNote(candidateId, content);
      await get().fetchTimeline(candidateId);
    } catch (err: any) {
      console.error("Failed to add note:", err);
      set({ error: err.message || "Failed to add note." });
    }
  },

  applyToJob: async (jobId: string, candidateData: Omit<Candidate, 'id' | 'appliedAt' | 'stage' | 'timeline'>) => {
    set({ isLoading: true });
    try {
      const newCandidate = await candidatesApi.applyToJob(jobId, candidateData);
      if (newCandidate) {
        set((state) => ({
          candidates: [...state.candidates, newCandidate]
        }));
      }
      return newCandidate;
    } catch (err: any) {
      console.error("Failed to apply to job:", err);
      set({ error: err.message || "Failed to apply." });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleCandidateSelection: (candidateId: string) => {
    set((state) => {
      const newSet = new Set(state.selectedCandidates);
      if (newSet.has(candidateId)) newSet.delete(candidateId);
      else newSet.add(candidateId);
      return { selectedCandidates: newSet };
    });
  },

  clearError: () => set({ error: null })
}));
