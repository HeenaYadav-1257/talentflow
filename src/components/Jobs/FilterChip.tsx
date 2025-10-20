// src/components/Jobs/FilterChip.tsx - COMPLETE
import React from 'react';

interface FilterChipProps {
  label: string;
  onRemove?: () => void;
  removable?: boolean;
  type: 'search' | 'status' | 'tag' | 'page' | 'sort';
}

const TYPE_COLORS: Record<FilterChipProps['type'], { bg: string; text: string; border: string }> = {
  search: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  status: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  tag: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  page: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  sort: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' }
};

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  removable = false,
  type
}) => {
  const colors = TYPE_COLORS[type];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${colors.border} ${colors.bg} ${colors.text} border`}>
      <span>{label}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 w-4 h-4 flex items-center justify-center text-current rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          title={`Remove ${type} filter`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
