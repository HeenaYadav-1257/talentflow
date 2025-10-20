import React from "react";
import * as ReactWindow from "react-window"; // ✅ Fix: use namespace import

const { FixedSizeList } = ReactWindow;

// --- Candidate Data and Types ---

interface DummyCandidate {
  id: string;
  name: string;
}

const dummyCandidates: DummyCandidate[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `id_${i}`,
  name: `Test Candidate ${i + 1}`,
}));

// --- Row Component ---

const Row = ({
  index,
  style,
}: {
  index: number;
  style: React.CSSProperties;
}) => (
  <div
    style={style}
    className="flex items-center px-4 py-2 border-b hover:bg-gray-50 transition"
  >
    {dummyCandidates[index].name}
  </div>
);

// --- Main List View Component ---

export const CandidateListView: React.FC<{ candidates?: any[] }> = () => {
  return (
    <div className="bg-white rounded-lg shadow border w-full h-[600px]">
      <FixedSizeList
        height={600}
        itemCount={dummyCandidates.length}
        itemSize={40}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
};
