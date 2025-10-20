// src/components/Candidates/CandidateCard.tsx
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import type { Candidate } from '../../types';

interface CandidateCardProps {
  candidate: Candidate;
  index: number;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, index }) => {
  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        // The fix is to apply the ref and props directly to the Link component.
        // We also need to add the drag handle props to the outer div.
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'opacity-80' : ''}`}
        >
          <Link to={`/candidates/${candidate.id}`}>
            <div
              className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer ${
                snapshot.isDragging ? 'border-primary shadow-lg ring-2 ring-primary-200' : 'hover:border-primary-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=003087&color=fff`}
                    alt={candidate.name}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{candidate.email}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </Draggable>
  );
};

export default CandidateCard;