// src/pages/CandidatesPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCandidateStore } from '../store/candidateStore';
import { useJobStore } from '../store/jobStore';
import KanbanBoard from '../components/Candidates/KanbanBoard';
import { CandidateListView } from '../components/Candidates/CandidateListView';
import { Squares2X2Icon as ViewGridIcon, Bars3Icon as ViewListIcon } from '@heroicons/react/24/solid';

const CandidatesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { candidates, isLoading, error, fetchCandidates, setFilter, filters } = useCandidateStore();
  const { jobs, fetchJobs } = useJobStore();
  
  // State for toggling between views
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // State for the selected job filter
  const [selectedJobId, setSelectedJobId] = useState<string>(filters.jobId || '');

  // Initial data fetch for jobs
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Refetch candidates whenever filters change
  useEffect(() => {
    fetchCandidates();
  }, [filters, fetchCandidates]);

  // Handler for the job dropdown filter
  const handleJobFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newJobId = e.target.value;
    setSelectedJobId(newJobId);
    setFilter('jobId', newJobId || undefined);
    
    // Update URL search params
    if (newJobId) {
      searchParams.set('jobId', newJobId);
    } else {
      searchParams.delete('jobId');
    }
    setSearchParams(searchParams);
  };

  // Handler for the text search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('search', e.target.value);
  };

  return (
  <div className="candidate-page">
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

      <div className="mb-6">
        <Link to="/" className="btn btn-secondary">
          ← Back to Home
        </Link>
      </div>

      <div className="max-w-full mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidate Pipeline</h1>
            <p className="text-gray-600 mt-1">{candidates.length} total candidates found</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* View Toggle Buttons */}
            {/* View Toggle Buttons */}
<div className="view-toggle flex items-center rounded-lg border p-1 bg-gray-100">
  <button 
    onClick={() => setViewMode('kanban')} 
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
  >
    <ViewGridIcon className="h-5 w-5" />
    Kanban
  </button>
  <button 
    onClick={() => setViewMode('list')} 
    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
  >
    <ViewListIcon className="h-5 w-5" />
    List
  </button>
</div>

            {/* Filter Controls */}
            <select
              value={selectedJobId}
              onChange={handleJobFilterChange}
              className="input w-full sm:w-64"
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={handleSearchChange}
              className="input w-full sm:w-72"
            />
          </div>
        </header>

        {/* Conditional Rendering based on state */}
        {isLoading && <div className="text-center p-10">Loading candidates...</div>}
        {error && <div className="text-center p-10 text-danger">Error: {error}</div>}
        
        {!isLoading && !error && (
          viewMode === 'kanban' 
            ? <KanbanBoard /> 
            : <CandidateListView candidates={candidates} />
        )}
      </div>
    </div>
  </div>
);
};


export default CandidatesPage;