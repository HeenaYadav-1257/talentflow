// src/components/Candidates/CandidateProfile.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Candidate } from '@/types';
import { formatDateTime, getInitials, getAvatarColor } from '@/utils/helpers';
import { STAGE_CONFIG } from '@/utils/constants';
import { useCandidateStore } from '@/store/candidateStore';

interface TimelineEvent {
  id: string;
  type: 'stage_change' | 'note' | 'assessment';
  timestamp: string | Date;
  description: string;
  from?: string;
  to?: string;
  author?: string;
}

export const CandidateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (id) {
      loadCandidate(id);
      loadTimeline(id);
    }
  }, [id]);

  const loadCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      if (!response.ok) throw new Error('Failed to load candidate');
      const data: Candidate = await response.json();
      setCandidate(data);
    } catch (error) {
      console.error('Error loading candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/timeline`);
      if (!response.ok) throw new Error('Failed to load timeline');
      const data: TimelineEvent[] = await response.json();
      setTimeline(
        data.map((event) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }))
      );
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !candidate) return;

    try {
      const newNote = {
        text: noteText.trim(),
        author: 'Current User',
        timestamp: new Date().toISOString(),
      };

      // Add note via store API
      const { addNote } = useCandidateStore.getState();
      await addNote(candidate.id, newNote.text);

      // Reload timeline after adding
      loadTimeline(candidate.id);
      setNoteText('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg mb-4">Candidate not found</p>
        <button
          onClick={() => navigate('/candidates')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Candidates
        </button>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIG[candidate.stage];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/candidates')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Candidates
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className={`${getAvatarColor(candidate.name)} w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold`}
              >
                {getInitials(candidate.name)}
              </div>

              {/* Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
                <p className="text-gray-600 mt-1">{candidate.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`${stageConfig.bgColor} ${stageConfig.color} px-3 py-1 rounded-full text-sm font-medium`}
                  >
                    {stageConfig.icon} {stageConfig.label}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Applied {formatDateTime(String(candidate.appliedAt))}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Download Resume
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Applied for: <span className="font-medium">{candidate.jobId}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Applied: <span className="font-medium">{formatDateTime(String(candidate.appliedAt))}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Timeline</h2>
              <div className="space-y-6">
                {timeline.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activity yet</p>
                ) : (
                  timeline.map((event) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {event.type === 'stage_change' && (
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          )}
                          {event.type === 'note' && (
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="text-gray-900 font-medium">{event.description}</p>
                        {event.author && (
                          <p className="text-gray-600 text-sm mt-1">by {event.author}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">{formatDateTime(event.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Notes */}
          <div className="space-y-6">
            {/* Add Note */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Note</h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note... Use @name to mention someone"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  📧 Send Email
                </button>
                <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  📅 Schedule Interview
                </button>
                <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  📝 Request Assessment
                </button>
                <button className="w-full text-left px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  ❌ Reject Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
