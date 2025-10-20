// src/components/HeroTabPanel.tsx
import React, { useState } from "react";

interface HeroTabPanelProps {
  className?: string; // allow className
  onChange?: (tab: string) => void;
}

const HeroTabPanel: React.FC<HeroTabPanelProps> = ({ className, onChange }) => {
  const [activeTab, setActiveTab] = useState("Jobs");
  const tabs = ["Jobs", "Candidates", "Assessments"];

  const handleClick = (tab: string) => {
    setActiveTab(tab);
    if (onChange) onChange(tab);
  };

  return (
    <div className={`hero-tab-panel ${className || ""}`}>
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`hero-tab ${activeTab === tab ? "hero-tab-active" : ""}`}
          onClick={() => handleClick(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};

export default HeroTabPanel;
