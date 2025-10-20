import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { useJobStore } from '../store/jobStore';
import { PlusIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import type { Assessment } from '@/types';

const AssessmentsPage: React.FC = () => {
  const { assessments, fetchAssessments, isLoading, publishAssessment } = useAssessmentStore();
  const { jobs } = useJobStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [jobFilter, setJobFilter] = useState('');

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const filteredAssessments = assessments.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) &&
    (!jobFilter || a.jobId === jobFilter) &&
    (statusFilter === 'all' || a.status === statusFilter)
  );

  const handlePublish = async (_assessment: Assessment) => {
    try {
      await publishAssessment();
      toast.success('Assessment published successfully!');
    } catch {
      toast.error('Failed to publish assessment');
    }
  };

  return (
  <div className="assessment-page">
    <div className="p-6 max-w-7xl mx-auto">

      {/* Back to Home Button */}
      <div className="mb-6">
        <Link to="/">
          <button className="cta-button">← Back to Home</button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">Create and manage technical assessments for your candidates</p>
        </div>
        <Link to="/assessments/new" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm">
          <PlusIcon className="w-5 h-5" /> Create Assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="text-2xl font-bold text-gray-900">{filteredAssessments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Published</h3>
          <p className="text-2xl font-bold text-green-600">{filteredAssessments.filter(a => a.status === 'published').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Draft</h3>
          <p className="text-2xl font-bold text-yellow-600">{filteredAssessments.filter(a => a.status === 'draft').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Archived</h3>
          <p className="text-2xl font-bold text-gray-600">{filteredAssessments.filter(a => a.status === 'archived').length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading assessments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{a.title}</h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    a.status === 'published' ? 'bg-green-100 text-green-800' :
                    a.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>{a.status}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{a.description || 'No description'}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Questions: {a.questionCount || 0}</span>
                  {a.jobId && <span className="flex items-center gap-1"><DocumentTextIcon className="w-4 h-4" /> Linked Job</span>}
                </div>
                <div className="flex gap-2">
                  <Link to={`/assessments/${a.id}`} className="flex-1 text-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit</Link>
                  {a.status === 'draft' && <button onClick={() => handlePublish(a)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Publish</button>}
                  <Link to={`/assessments/${a.id}/results`} className="p-2 text-gray-400 hover:text-gray-600" title="View Results"><EyeIcon className="w-5 h-5" /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAssessments.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-500 mb-6">Create your first assessment to get started</p>
          <Link to="/assessments/new" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create First Assessment</Link>
        </div>
      )}
    </div>
  </div>
);
};
export default AssessmentsPage;
