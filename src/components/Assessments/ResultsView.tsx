// src/components/Assessments/ResultsView.tsx - RESULTS DASHBOARD
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { 
  EyeIcon, UserIcon, 
  CheckCircleIcon, XCircleIcon 
} from '@heroicons/react/24/outline';
import { DownloadIcon } from 'lucide-react';


const ResultsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchResults, results } = useAssessmentStore();
  
  const [] = useState<any>({});
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    if (id) {
      fetchResults(id);
      // Fetch stats
    }
  }, [id, fetchResults]);

  const filteredResults = results.filter((result: { pass: any; }) => 
    filter === 'all' || (filter === 'passed' && result.pass) || (filter === 'failed' && !result.pass)
  );


  const passRate = results.length > 0 ? 
    (results.filter((r: { pass: any; }) => r.pass).length / results.length * 100).toFixed(1) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Assessment Results</h1>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Results</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
          <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2">
            <DownloadIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-gray-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              <p className="text-sm text-gray-500">Total Candidates</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-center">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {results.filter((r: { pass: any; }) => r.pass).length}
              </p>
              <p className="text-sm text-gray-500">Passed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-center">
            <XCircleIcon className="w-8 h-8 text-red-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-red-600">
                {results.filter((r: { pass: any; }) => !r.pass).length}
              </p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-center">
            <EyeIcon className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{passRate}%</p>
              <p className="text-sm text-gray-500">Pass Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Taken
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
  {filteredResults.map((result) => (
    <tr key={String(result.id)} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full"></div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {result.candidateName || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500">{String(result.candidateId)}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {Math.round(Number(result.score))} / {String(result.totalScore)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          result.pass 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {result.pass ? 'Passed' : 'Failed'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {Math.round(Number(result.timeTaken) / 1000 / 60)} min
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(result.completedAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900">
          View Details
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <EyeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
          <p className="text-gray-500">Results will appear here once candidates complete the assessment</p>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
