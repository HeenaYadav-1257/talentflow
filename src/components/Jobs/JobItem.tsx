// src/components/Jobs/JobItem.tsx
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Link } from 'react-router-dom';
import { ItemTypes } from './dragTypes';
import { JobStatus, type Job } from '../../types';
import {
  ArchiveBoxIcon,
  UsersIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface JobItemProps {
  job: Job;
  index: number;
  moveJob: (dragIndex: number, hoverIndex: number) => void;
  onEdit: () => void;
  onArchive: () => void;
}

export const JobItem: React.FC<JobItemProps> = ({
  job,
  index,
  moveJob,
  onEdit,
  onArchive
}) => {
  // ✅ THE FIX: We'll create one ref and attach both drag and drop to it.
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isHovering }, drop] = useDrop({
    accept: ItemTypes.JOB,
    hover(item: DragItem) {
      if (!ref.current || item.index === index) return;
      moveJob(item.index, index);
      item.index = index;
    },
    collect: (monitor) => ({
      isHovering: monitor.isOver(),
    }),
  });

  const [{ isBeingDragged }, drag] = useDrag({
    type: ItemTypes.JOB,
    item: { id: job.id, index } as DragItem,
    collect: (monitor) => ({
      isBeingDragged: monitor.isDragging(),
    }),
  });

  // ✅ THIS IS THE KEY: Chain the connectors and attach them to the single ref.
  // This pattern is fully type-safe.
  drag(drop(ref));

  const tags = job.tags || [];

  return (
    <div
      ref={ref} // Attach the combined, type-safe ref here.
      style={{ opacity: isBeingDragged ? 0.4 : 1 }}
      className={`card card-hover flex flex-col justify-between relative cursor-grab active:cursor-grabbing ${isHovering ? 'bg-blue-50' : ''}`}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 pr-2 flex-1">
            {job.title}
          </h3>
          <span
            className={`badge ${
              job.status === JobStatus.Active ? 'badge-success' : 'badge-danger'
            }`}
          >
            {job.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge bg-gray-100 text-gray-700">{tag}</span>
          ))}
          {tags.length > 3 && <span className="badge bg-gray-100 text-gray-500">+{tags.length - 3}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
        <Link to={`/jobs/${job.id}`} className="flex items-center gap-2 hover:text-primary ml-2">
          <UsersIcon className="w-5 h-5" />
          <span>{job.candidateCount || 0} Applicants</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Add stopPropagation to prevent a drag from starting when a button is clicked */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit job"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onArchive(); }}
            className="p-2 text-gray-500 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
            title={job.status === JobStatus.Active ? 'Archive Job' : 'Unarchive Job'}
          >
            <ArchiveBoxIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};