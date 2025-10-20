// src/store/jobStore.ts
import { create } from 'zustand';
import { jobsApi } from '../api/jobsApi';
import { type Job, type JobFilters, type Pagination, JobStatus } from '../types';

interface LastAction {
  type: 'archive' | 'reorder' | 'bulkArchive';
  data: any;
  timestamp: number;
}

interface JobStore {
  jobs: Job[];
  filters: JobFilters;
  pagination?: Pagination;
  isLoading: boolean;
  error?: string;
  lastAction?: LastAction;

  setFilter: (key: keyof JobFilters, value: any) => void;
  setTagsFilter: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  fetchJobs: () => Promise<void>;
  createJob: (job: Job) => Promise<Job>;
  updateJob: (id: string, job: Partial<Job>) => Promise<Job>;
  archiveJob: (jobId: string) => Promise<boolean>;
  bulkArchive: (jobIds: string[]) => Promise<boolean>;
  reorderJob: (fromIndex: number, toIndex: number) => Promise<boolean>;
  clearError: () => void;
  syncFiltersFromUrl: (searchParams: URLSearchParams) => void;
  updateUrlFromFilters: () => string;
  getCurrentUrl: () => string;

  getJobById: (id: string) => Job | undefined;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  filters: { search: '', status: 'all', tags: [], sort: 'order', page: 1, pageSize: 10 },
  pagination: undefined,
  isLoading: false,
  error: undefined,
  lastAction: undefined,

  // Sync filters from URL
  syncFiltersFromUrl: (searchParams: URLSearchParams) => {
    const statusParam = searchParams.get('status') as JobStatus | null;
    const sortParam = searchParams.get('sort');

    const newFilters: Partial<JobFilters> = {
      search: searchParams.get('search') || '',
      status: statusParam === 'active' || statusParam === 'archived' ? statusParam : 'all',
      sort:
        sortParam === 'order' ||
        sortParam === 'title' ||
        sortParam === 'createdAt' ||
        sortParam === 'updatedAt'
          ? sortParam
          : 'order',
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
    };

    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      newFilters.tags = tagsParam.split(',').map((tag) => decodeURIComponent(tag.trim())).filter(Boolean);
    }

    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  // Generate URL from filters
  updateUrlFromFilters: () => {
    const { filters } = get();
    const params = new URLSearchParams();

    if (filters.search?.trim()) params.set('search', encodeURIComponent(filters.search.trim()));
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.tags?.length) params.set('tags', filters.tags.map((t) => encodeURIComponent(t)).join(','));
    if (filters.sort && filters.sort !== 'order') params.set('sort', filters.sort);
    params.set('page', filters.page.toString());
    if (filters.pageSize && filters.pageSize !== 10) params.set('pageSize', filters.pageSize.toString());

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({ ...window.history.state, filters }, '', newUrl);
    return newUrl;
  },

  getCurrentUrl: () => get().updateUrlFromFilters(),

  // Get single job by ID
  getJobById: (id: string) => get().jobs.find((job) => job.id === id),

  setFilter: (key, value) => {
    const resetPage = ['search', 'status', 'tags', 'sort'].includes(key);
    set((state) => ({ filters: { ...state.filters, [key]: value, page: resetPage ? 1 : state.filters.page } }));
    setTimeout(() => get().updateUrlFromFilters(), 100);
  },

  setTagsFilter: (tags) => {
    set((state) => ({ filters: { ...state.filters, tags, page: 1 } }));
    setTimeout(() => get().updateUrlFromFilters(), 100);
  },

  toggleTag: (tag) => {
    set((state) => {
      const currentTags = state.filters.tags || [];
      const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
      return { filters: { ...state.filters, tags: newTags, page: 1 } };
    });
    setTimeout(() => get().updateUrlFromFilters(), 100);
  },

  clearFilters: () => {
    const defaultFilters: JobFilters = {
      search: '',
      status: 'all',
      tags: [],
      sort: 'order',
      page: 1,
      pageSize: 10,
    };
    set({ filters: defaultFilters });
    get().updateUrlFromFilters();
  },

  clearError: () => set({ error: undefined }),

  fetchJobs: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const { filters } = get();
      const { data, meta } = await jobsApi.fetchJobs(filters);
      set({ jobs: data, pagination: meta });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load jobs' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new job
  createJob: async (job: Job) => {
    try {
      const newJob = await jobsApi.createJob(job);
      set((state) => ({ jobs: [newJob, ...state.jobs] }));
      return newJob;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  // Update an existing job
  updateJob: async (id: string, job: Partial<Job>) => {
    try {
      const updatedJob = await jobsApi.updateJob(id, job);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? updatedJob : j)),
      }));
      return updatedJob;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  reorderJob: async (fromIndex, toIndex) => {
    const { jobs } = get();
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= jobs.length ||
      toIndex >= jobs.length
    )
      return false;
    const previousJobs = [...jobs];

    set((state) => {
      const newJobs = [...state.jobs];
      const [movedJob] = newJobs.splice(fromIndex, 1);
      newJobs.splice(toIndex, 0, movedJob);
      return {
        jobs: newJobs.map((job, idx) => ({ ...job, order: idx * 10 })),
        lastAction: { type: 'reorder', data: { fromIndex, toIndex, previousJobs }, timestamp: Date.now() },
      };
    });

    try {
      const newOrder = jobs.map((job, idx) => ({ id: job.id, order: idx * 10 }));
      await jobsApi.reorderJobs({ fromIndex, toIndex, order: newOrder });
      return true;
    } catch (err: any) {
      set({ jobs: previousJobs, error: err.message });
      return false;
    }
  },

  archiveJob: async (jobId) => {
    const { jobs } = get();
    const jobIndex = jobs.findIndex((j) => j.id === jobId);
    if (jobIndex === -1) return false;

    const previousJob = { ...jobs[jobIndex] };
    const isActive = jobs[jobIndex].status === JobStatus.Active;
    const newStatus = isActive ? JobStatus.Archived : JobStatus.Active;

    set((state) => {
      const newJobs = [...state.jobs];
      newJobs[jobIndex].status = newStatus;
      newJobs[jobIndex].updatedAt = Date.now();
      return {
        jobs: newJobs,
        lastAction: { type: 'archive', data: { jobId, previousJob, wasActive: isActive }, timestamp: Date.now() },
      };
    });

    try {
      await jobsApi.archiveJob(jobId, newStatus);
      return true;
    } catch (err: any) {
      set((state) => {
        const newJobs = [...state.jobs];
        newJobs[jobIndex] = previousJob;
        return { jobs: newJobs, error: err.message };
      });
      return false;
    }
  },

  bulkArchive: async (jobIds) => {
    if (!jobIds?.length) return false;
    const { jobs } = get();
    const previousStates = new Map<string, Job>();

    jobIds.forEach((id) => {
      const job = jobs.find((j) => j.id === id);
      if (job) previousStates.set(id, { ...job });
    });

    if (!previousStates.size) return false;

    set((state) => {
      const newJobs = [...state.jobs];
      jobIds.forEach((id) => {
        const idx = newJobs.findIndex((j) => j.id === id);
        if (idx !== -1) {
          newJobs[idx].status = JobStatus.Archived;
          newJobs[idx].updatedAt = Date.now();
        }
      });
      return { jobs: newJobs };
    });

    try {
      await jobsApi.bulkArchive(jobIds, JobStatus.Archived);
      return true;
    } catch (err: any) {
      set((state) => {
        const newJobs = [...state.jobs];
        previousStates.forEach((prev, id) => {
          const idx = newJobs.findIndex((j) => j.id === id);
          if (idx !== -1) newJobs[idx] = prev;
        });
        return { jobs: newJobs, error: err.message };
      });
      return false;
    }
  },
}));
