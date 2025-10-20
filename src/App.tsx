import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AssessmentsPage from './pages/AssessmentsPage';
import JobsBoard from './pages/JobsBoard';
import CandidatesPage from './pages/CandidatesPage';
import JobDetail from './pages/JobDetail';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* ✅ Navbar only on the home page */}
      {isHomePage && <Navbar />}

      <Routes>
        {/* ===== HOME / LANDING PAGE ===== */}
        <Route
          path="/"
          element={
            <>
              <section className="hero-section">
                <h1 className="talentflow-heading">
                  TALENTFLOW – A MINI HIRING PLATFORM
                </h1>
                <p className="talentflow-subtitle">
                  Manage jobs, candidates, and assessments efficiently
                </p>

                <div className="hero-tab-panel">
                  <Link to="/jobs" className="hero-tab">Jobs</Link>
                  <Link to="/candidates" className="hero-tab">Candidates</Link>
                  <Link to="/assessments" className="hero-tab">Assessments</Link>
                </div>
              </section>

              <section className="cta-section">
                <div className="max-w-6xl mx-auto px-6">
                  <h2 className="cta-title">Ready to Transform Your Hiring?</h2>
                  <p className="cta-subtitle">
                    Join thousands of leading companies streamlining their
                    talent acquisition process.
                  </p>
                  <Link to="/jobs">
                    <button className="cta-button">Start Free Trial</button>
                  </Link>
                </div>
              </section>
            </>
          }
        />

        {/* ===== APP ROUTES ===== */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/jobs" element={<JobsBoard />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
          </Route>
        </Route>

        {/* ===== CATCH-ALL ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
