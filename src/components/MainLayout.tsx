// src/components/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    // This provides the clean background and padding for your pages
    <main className="bg-white pt-24">
      <Outlet />
    </main>
  );
};

export default MainLayout;
