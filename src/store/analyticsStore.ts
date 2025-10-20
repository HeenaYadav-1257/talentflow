// src/store/analyticsStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { db } from '../db/db';
import {
  type AnalyticsDashboard,
  type JobMetrics,
  type OverallMetrics,
  type ReportFilter,
  type PipelineFunnel,
  Stage
} from '../types';
import { ExportService } from '../services/exportService';

interface AnalyticsState {
  dashboard: AnalyticsDashboard | null;
  isLoading: boolean;
  error: string | null;
  filters: ReportFilter;

  fetchDashboard: (filters?: Partial<ReportFilter>) => Promise<void>;
  calculateMetrics: (jobId?: string) => Promise<JobMetrics>;
  exportReport: (format: 'pdf' | 'csv' | 'excel', data?: AnalyticsDashboard | null) => Promise<string>;
  getInterviewerInsights: () => Promise<any>;
  clearCache: () => Promise<void>;
  setFilters: (filters: Partial<ReportFilter>) => void;
  clearError: () => void;
}

// =====================
// HELPER FUNCTIONS
// =====================

// Overall metrics for dashboard
const calculateOverallMetrics = async (): Promise<OverallMetrics> => {
  const jobs = await db.jobs.toArray();
  const allMetrics = await Promise.all(jobs.map(job => db.calculateHiringMetrics(job.id)));

  const totalCandidates = allMetrics.reduce((sum, m) => sum + m.totalApplications, 0);
  const totalHired = allMetrics.reduce((sum, m) => sum + (m.hired || 0), 0);
  const avgTimeToHire = allMetrics.reduce((sum, m) => sum + m.avgTimeToHire, 0) / (allMetrics.length || 1);
  const avgCostPerHire = allMetrics.reduce((sum, m) => sum + (m.costPerHire || 0), 0) / (allMetrics.length || 1);
  const hireRate = totalCandidates > 0 ? (totalHired / totalCandidates) * 100 : 0;

  return {
    totalCandidates,
    totalHired,
    avgTimeToHire,
    hireRate,
    avgCostPerHire
  };
};

// Funnel metrics
const calculateFunnels = async (): Promise<Record<string, PipelineFunnel[]>> => {
  const overall: PipelineFunnel[] = [
    { stage: Stage.Applied, count: 0, percentage: 0, conversionRate: 0 },
    { stage: Stage.Screen, count: 0, percentage: 0, conversionRate: 0 },
    { stage: Stage.Tech, count: 0, percentage: 0, conversionRate: 0 },
    { stage: Stage.Offer, count: 0, percentage: 0, conversionRate: 0 },
    { stage: Stage.Hired, count: 0, percentage: 0, conversionRate: 0 },
  ];

  const jobs = await db.jobs.toArray();
  for (const job of jobs) {
    const metrics = await db.calculateHiringMetrics(job.id);
    overall[0].count += metrics.totalApplications;
    overall[4].count += metrics.hired || 0;
  }

  overall.forEach(stage => {
    stage.percentage = overall[0].count > 0 ? (stage.count / overall[0].count) * 100 : 0;
    stage.conversionRate = stage.percentage;
  });

  return { overall };
};

// Trends metrics
const calculateTrends = async () => ({
  applications: [],
  hires: [],
  dates: []
});

// =====================
// ZUSTAND STORE
// =====================

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      dashboard: null,
      isLoading: false,
      error: null,
      filters: {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        }
      },

      fetchDashboard: async (customFilters) => {
        set({ isLoading: true, error: null });
        try {
          const filters = { ...get().filters, ...customFilters };

          // Cache check
          const cacheKey = `dashboard-${JSON.stringify(filters)}`;
          const cached = await db.getCachedAnalytics(cacheKey);
          if (cached) {
            set({ dashboard: cached, isLoading: false });
            return;
          }

          const overallMetrics = await calculateOverallMetrics(); // returns OverallMetrics
          const jobs = await db.jobs.toArray();
          const jobMetrics: JobMetrics[] = await Promise.all(jobs.map(job => db.calculateHiringMetrics(job.id)));
          const funnels = await calculateFunnels();
          const interviewerPerformance = await db.getInterviewerPerformance();
          const trends = await calculateTrends();

          const dashboard: AnalyticsDashboard = {
            overallMetrics,
            jobs: jobMetrics,
            funnels,
            interviewerPerformance,
            trends
          };

          await db.cacheAnalytics(cacheKey, dashboard, 15);
          set({ dashboard, isLoading: false });

        } catch (err: any) {
          set({ isLoading: false, error: err.message });
        }
      },

      calculateMetrics: async (jobId) => db.calculateHiringMetrics(jobId),

      getInterviewerInsights: async () => db.getInterviewerPerformance(),

      exportReport: async (format, data = get().dashboard) => {
        if (!data) throw new Error("No data to export");
        try {
          const fileUrl = await ExportService.exportReport(format, data, get().filters);
          return fileUrl;
        } catch (err: any) {
          set({ error: `Export failed: ${err.message}` });
          throw err;
        }
      },

      setFilters: (filters) => set(state => ({
        filters: { ...state.filters, ...filters }
      })),

      clearCache: async () => {
        await db.analyticsCache.clear();
        set({ dashboard: null });
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'AnalyticsStore' }
  )
);
