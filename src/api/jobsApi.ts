// src/api/jobsApi.ts
import { db } from '../db/db';
import type { Job, JobFilters, JobStatus } from '../types';

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class JobsApi {
  // Fetch jobs with filters, sorting, and pagination
  async fetchJobs(filters: JobFilters): Promise<{ data: Job[]; meta: PaginationMeta }> {
    const { search, status, tags, sort, page = 1, pageSize = 10 } = filters;

    let query = db.jobs.toCollection();

    // Search filter
    if (search?.trim()) {
      const lowerSearch = search.toLowerCase();
      query = query.filter((job: Job) =>
        job.title.toLowerCase().includes(lowerSearch) ||
        job.description?.toLowerCase().includes(lowerSearch) ||
        job.tags?.some(tag => tag.toLowerCase().includes(lowerSearch)) || false
      );
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.filter((job: Job) => job.status === status);
    }

    // Tags filter (AND logic)
    if (tags && tags.length > 0) {
      query = query.filter((job: Job) =>
        job.tags ? tags.every(tag => job.tags!.includes(tag)) : false
      );
    }

    // Count total before pagination
    const total = await query.count();
    const totalPages = Math.ceil(total / pageSize);

    // Sorting
   // Sorting
let jobsArray: Job[] = await query.toArray(); // convert collection to array

switch (sort) {
  case 'title':
    jobsArray.sort((a, b) => a.title.localeCompare(b.title));
    break;

  case 'createdAt':
    jobsArray.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    break;

  case 'updatedAt':
    jobsArray.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    break;

  case 'order':
  default:
    jobsArray.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    break;
}

    // Pagination
    const offset = (page - 1) * pageSize;
    const paginatedJobs = jobsArray.slice(offset, offset + pageSize);

    return {
      data: paginatedJobs,
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

  // Reorder jobs
  async reorderJobs(payload: { fromIndex: number; toIndex: number; order: Array<{ id: string; order: number }> }) {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    if (Math.random() < 0.05) {
      throw new Error('Simulated database timeout during reorder');
    }

    const { order } = payload;
    const bulkUpdates: Job[] = [];
    for (const { id, order: newOrder } of order) {
      const job = await db.jobs.get(id);
      if (job) {
        bulkUpdates.push({ ...job, order: newOrder, updatedAt: Date.now() });
      }
    }

    await db.jobs.bulkPut(bulkUpdates);
    return { success: true, updated: order.length };
  }

  // Archive or unarchive a single job
  async archiveJob(jobId: string, status: JobStatus) {
    const job = await db.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    await db.jobs.update(jobId, {
      status,
      updatedAt: new Date().toISOString(),
    });

    return await db.jobs.get(jobId);
  }

  // Bulk archive multiple jobs
  async bulkArchive(jobIds: string[], status: JobStatus) {
    const updates: Job[] = [];
    for (const id of jobIds) {
      const job = await db.jobs.get(id);
      if (job) updates.push({ ...job, status, updatedAt:  Date.now() });
    }

    await db.jobs.bulkPut(updates);
    return { success: true, updated: jobIds.length };
  }

  // Create a new job
  async createJob(jobData: Omit<Job, 'id' | 'order' | 'createdAt' | 'updatedAt'>) {
    const totalJobs = await db.jobs.count();
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: totalJobs * 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      candidateCount: 0,
    };

    const id = await db.jobs.add(newJob);
    return { ...newJob, id };
  }

  // Update an existing job
  async updateJob(jobId: string, updates: Partial<Job>) {
    const job = await db.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    const updatedJob = { ...job, ...updates, updatedAt: Date.now() };
    await db.jobs.put(updatedJob);
    return updatedJob;
  }
}

// Export a single instance
export const jobsApi = new JobsApi();
