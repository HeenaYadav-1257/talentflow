// src/components/Navbar.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">

      {/* ===== TOP ROW: MAIL, NOTIFICATION, PROFILE ===== */}
      <div className="navbar-top">
        {/* MAIL BUTTON */}
        <button className="icon-btn">
          <svg
            className="w-6 h-6" // adjust size if needed
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* NOTIFICATION BUTTON */}
        <button className="icon-btn">
          <img 
            src="/src/assets/bell.png" 
            alt="Notifications" 
            className="icon-btn-img"
          />
        </button>

        {/* PROFILE BADGE */}
        <div className="profile-badge">HR</div>
      </div>

      {/* ===== BOTTOM ROW: LOGO + SEARCH WITH TRANSPARENT BACKGROUND ===== */}
      <div className="navbar-bottom-wrapper">
        {/* Background rectangle */}
        <div className="navbar-bottom-bg"></div>

        {/* Actual content */}
        <div className="navbar-bottom">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/src/assets/duck.png"
              alt="TALENTFLOW Logo"
              className="w-10 h-10"
            />
            <h1 className="text-white font-bold text-2xl">
              talent
              <span className="text-accent-yellow">flow</span>
              <span className="text-xs align-super text-accent-yellow-light">
                .com
              </span>
            </h1>
          </Link>

          <div className="navbar-search">
            <input
              type="text"
              placeholder="Search jobs, candidates, assessments..."
              className="navbar-input"
            />
          </div>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <input
            type="text"
            placeholder="Search jobs, candidates..."
            className="w-full p-2 mb-2 border rounded text-base"
          />
          <Link to="/jobs" className="block px-4 py-2 hover:bg-neutral-100">
            Jobs
          </Link>
          <Link to="/candidates" className="block px-4 py-2 hover:bg-neutral-100">
            Candidates
          </Link>
          <Link to="/assessments" className="block px-4 py-2 hover:bg-neutral-100">
            Assessments
          </Link>
        </div>
      )}
    
      {/* ===== MOBILE MENU BUTTON ===== */}
      <button
        className="md:hidden mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7"/>
        </svg>
      </button>

    </nav>
  );
};

export default Navbar;
