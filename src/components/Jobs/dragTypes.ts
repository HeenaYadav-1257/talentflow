// src/components/Jobs/dragTypes.ts
export const ItemTypes = {
  JOB: 'job',
  CANDIDATE: 'candidate',
};

export interface DragItem {
  index: number;
  id: string;
  type: string;
}
