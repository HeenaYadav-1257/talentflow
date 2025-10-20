import React, { useEffect, useState, useCallback, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSearchParams, Link } from "react-router-dom";
import { useJobStore } from "../store/jobStore";
import { JobItem } from "../components/Jobs/JobItem";
import JobModal from "../components/Jobs/JobModal";
import { JobStatus, type Job } from "../types";
import { PlusIcon } from "@heroicons/react/24/solid";
import { FilterChip } from "../components/Jobs/FilterChip";

const SORT_OPTIONS = [
  { value: "order", label: "Manual Order" },
  { value: "title", label: "Title A-Z" },
  { value: "createdAt", label: "Newest First" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: JobStatus.Active, label: "Active" },
  { value: JobStatus.Archived, label: "Archived" },
];

const JobsBoard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const {
    jobs,
    filters,
    pagination,
    isLoading,
    error,
    fetchJobs,
    setFilter,
    reorderJob,
    archiveJob,
    syncFiltersFromUrl,
  } = useJobStore();

  useEffect(() => {
    syncFiltersFromUrl(searchParams);
  }, [searchParams, syncFiltersFromUrl]);

  useEffect(() => {
    fetchJobs();
    const newParams = new URLSearchParams();
    if (filters.search) newParams.set('search', filters.search);
    if (filters.status !== 'all') newParams.set('status', filters.status);
    if (filters.sort && filters.sort !== 'order') newParams.set('sort', filters.sort);
    if (filters.page > 1) newParams.set('page', String(filters.page));
    setSearchParams(newParams, { replace: true });
  }, [filters.search, filters.status, filters.sort, filters.page, fetchJobs]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const moveJob = useCallback((fromIndex: number, toIndex: number) => {
    reorderJob(fromIndex, toIndex);
  }, [reorderJob]);

  const activeFilters = useMemo(() => {
    const chips = [];
    if (filters.search) {
      chips.push({ type: 'search' as const, label: `Search: "${filters.search}"`, onRemove: () => setFilter('search', '') });
    }
    if (filters.status !== 'all') {
      chips.push({ type: 'status' as const, label: `Status: ${filters.status}`, onRemove: () => setFilter('status', 'all') });
    }
    return chips;
  }, [filters.search, filters.status, setFilter]);

  return (
    <DndProvider backend={HTML5Backend}>
  <div className="jobs-page">
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Back to Home Button */}
      <div className="mb-6">
        <Link to="/">
          <button className="cta-button">← Back to Home</button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Job
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-white rounded-xl shadow-sm">
          <input
            type="text"
            placeholder="Search by title..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="input"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value as JobStatus | 'all')}
            className="input"
          >
            {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
          <select
            value={filters.sort || 'order'}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="input"
          >
            {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((chip) => (
              <FilterChip key={chip.label} label={chip.label} onRemove={chip.onRemove} removable type={chip.type} />
            ))}
          </div>
        )}

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, index) => (
                <JobItem
                  key={job.id}
                  job={job}
                  index={index}
                  moveJob={moveJob}
                  onEdit={() => handleOpenEditModal(job)}
                  onArchive={() => archiveJob(job.id)}
                />
              ))}
            </div>
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={() => setFilter('page', filters.page - 1)}
                disabled={!pagination?.hasPrev}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {pagination?.page} of {pagination?.totalPages}</span>
              <button
                onClick={() => setFilter('page', filters.page + 1)}
                disabled={!pagination?.hasNext}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    <JobModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      job={editingJob}
    />
  </div>
</DndProvider>

  );
};

export default JobsBoard;
