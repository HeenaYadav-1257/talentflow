// src/components/Candidates/CandidateListItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Candidate } from '../../types';
import { STAGE_LABELS } from '../../types';

interface CandidateListItemProps {
  candidate: Candidate;
}

export const CandidateListItem: React.FC<CandidateListItemProps> = ({ candidate }) => {
  return (
    <Link to={`/candidates/${candidate.id}`} className="flex items-center px-4 py-3 border-b hover:bg-gray-50 transition-colors" style={{ height: '75px' }}>
      <img
        className="h-10 w-10 rounded-full object-cover mr-4"
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=003087&color=fff`}
        alt={candidate.name}
      />
      <div className="flex-1">
        <p className="font-semibold text-gray-900 truncate">{candidate.name}</p>
        <p className="text-sm text-gray-500 truncate">{candidate.email}</p>
      </div>
      <div className="text-right ml-4">
        <span className="badge bg-blue-100 text-blue-800">{STAGE_LABELS[candidate.stage]}</span>
        <p className="text-xs text-gray-400 mt-1">Applied on {new Date(candidate.appliedAt).toLocaleDateString()}</p>
      </div>
    </Link>
  );
};
