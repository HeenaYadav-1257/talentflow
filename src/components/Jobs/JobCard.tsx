import React, { useState } from "react";
import { useJobStore } from "../../store/jobStore";
import { jobsApi } from "../../api/jobsApi";
import { JobStatus, type Job } from "../../types";

const JobForm = () => {
  const { fetchJobs } = useJobStore(); // To refresh the list after creation

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const newJob: Omit<Job, "id" | "order" | "createdAt" | "updatedAt" | "candidateCount"> = {
        title,
        department,
        location,
        type,
        salary,
        description,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: JobStatus.Active,
        isPublished: undefined,
        requirements: [],
        postedDate: ""
      };

      await jobsApi.createJob(newJob);
      await fetchJobs(); // Refresh jobs list
      // Reset form
      setTitle("");
      setDepartment("");
      setLocation("");
      setType("Full-time");
      setSalary("");
      setDescription("");
      setTags("");
    } catch (err: any) {
      console.error("Failed to create job:", err);
      setError(err.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block font-medium mb-1">Job Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Internship</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Salary</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={4}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Job"}
      </button>
    </form>
  );
};

export default JobForm;
