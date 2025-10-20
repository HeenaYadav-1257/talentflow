// src/components/Candidates/KanbanBoard.tsx
import React, { useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, type DropResult } from 'react-beautiful-dnd';
import { useCandidateStore } from '../../store/candidateStore';
import { CandidateCard } from './CandidateCard';
import { STAGE_LABELS, Stage, type Candidate } from '../../types';

const STAGES_ORDER: Stage[] = [
  Stage.Applied,
  Stage.Screen,
  Stage.Tech,
  Stage.Offer,
  Stage.Hired,
  Stage.Rejected,
];

const KanbanBoard: React.FC = () => {
  const { candidates, updateCandidateStage } = useCandidateStore();

  const candidatesByStage = useMemo(() => {
    const grouped = {} as Record<Stage, Candidate[]>;
    STAGES_ORDER.forEach(stage => { grouped[stage] = []; });
    candidates.forEach(candidate => {
      if (grouped[candidate.stage]) {
        grouped[candidate.stage].push(candidate);
      }
    });
    return grouped;
  }, [candidates]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId)) {
      return;
    }
    const newStage = destination.droppableId as Stage;
    updateCandidateStage(draggableId, newStage);
  }, [updateCandidateStage]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-4">
        {STAGES_ORDER.map(stage => (
          <div key={stage} className="min-w-[320px] bg-gray-100 rounded-2xl p-1 flex-shrink-0">
            <div className="p-3">
              <h3 className="text-md font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                {STAGE_LABELS[stage]}
                <span className="text-gray-400 ml-2">{candidatesByStage[stage]?.length || 0}</span>
              </h3>
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[500px] transition-colors duration-200 rounded-lg ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {candidatesByStage[stage]?.map((candidate, index) => (
                      <CandidateCard key={candidate.id} candidate={candidate} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;