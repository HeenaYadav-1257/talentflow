// src/pages/JobDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useJobStore } from "../store/jobStore";
import { useCandidateStore } from "../store/candidateStore";
import { useAssessmentStore } from "../store/assessmentStore";
import { JobStatus } from "../types";

interface Tab {
  id: "overview" | "candidates" | "assessment";
  label: string;
  count?: number;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab["id"]>("overview");

  const { jobs } = useJobStore();
  const { fetchCandidates, candidates } = useCandidateStore();
  const { fetchAssessmentByJobId, currentAssessment } = useAssessmentStore();

  const job = jobs.find((j) => j.id === id);

  useEffect(() => {
    if (id) {
      fetchCandidates(id);
      fetchAssessmentByJobId(id);
    }
  }, [id, fetchCandidates, fetchAssessmentByJobId]);

  if (!job) {
    return <div className="p-6 text-gray-500">Loading job details...</div>;
  }

  const tabs: Tab[] = [
    { id: "overview", label: "Overview" },
    { id: "candidates", label: "Candidates", count: candidates.length },
    { id: "assessment", label: "Assessment", count: currentAssessment ? 1 : 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link
        to="/jobs"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Jobs
      </Link>

      <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="text-gray-600 mt-2">{job.description}</p>
        <div className="text-sm text-gray-500 mt-3 flex flex-wrap gap-4">
          <span>
            Status:{" "}
            <span
              className={
                job.status === JobStatus.Active
                  ? "text-green-600 font-medium"
                  : "text-gray-600"
              }
            >
              {job.status}
            </span>
          </span>
          <span>Candidates: {job.candidateCount || 0}</span>
          <span>Tags: {job.tags?.join(", ") || "None"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}{" "}
              {tab.count !== undefined && (
                <span className="text-gray-400">({tab.count})</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Job Overview</h2>
            <p>{job.description}</p>
          </div>
        )}

        {activeTab === "candidates" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Candidates for {job.title}
            </h2>
            {candidates.length === 0 ? (
              <p className="text-gray-500">No candidates yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white border rounded-lg p-4"
                  >
                    <h3 className="font-medium">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    <p className="text-sm text-gray-600">
                      Stage: {candidate.stage}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "assessment" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Assessment</h2>
            {currentAssessment ? (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium mb-2">{currentAssessment.title}</h3>
                <p className="text-sm text-gray-600">
                  Sections: {currentAssessment.sections.length}
                </p>
                <p className="text-sm text-gray-600">
                  Published: {currentAssessment.isPublished ? "Yes" : "No"}
                </p>
              </div>
            ) : (
              <p>
                No assessment yet.{" "}
                <button className="text-blue-600 underline">
                  Create one
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
