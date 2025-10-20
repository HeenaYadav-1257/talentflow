// src/components/Jobs/JobForm.tsx
import { useState } from "react";
import { JobStatus, type Job } from "../../types";
import { useJobStore } from "../../store/jobStore";
import { jobsApi } from "../../api/jobsApi";

interface JobFormProps {
  job?: Job; // if provided, edit mode
  onClose: () => void;
}

export default function JobForm({ job, onClose }: JobFormProps) {
  const isEdit = !!job;
  const fetchJobs = useJobStore(state => state.fetchJobs);

  const [title, setTitle] = useState(job?.title || "");
  const [department, setDepartment] = useState(job?.department || "");
  const [location, setLocation] = useState(job?.location || "");
  const [type, setType] = useState(job?.type || "Full-time");
  const [salary, setSalary] = useState(job?.salary || "");
  const [description, setDescription] = useState(job?.description || ""); // ✅ THIS LINE IS NOW FIXED
  const [tags, setTags] = useState(job?.tags?.join(", ") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title || !department || !location) {
      setError("Title, Department, and Location are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const jobData: Partial<Job> = {
        title,
        department,
        location,
        type,
        salary,
        description,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        status: job?.status || JobStatus.Active,
      };

      if (isEdit && job) {
        await jobsApi.updateJob(job.id, jobData);
      } else {
        await jobsApi.createJob(jobData as Omit<Job, "id" | "order" | "createdAt" | "updatedAt" | "candidateCount">);
      }

      await fetchJobs();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Job" : "Add Job"}</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Title*"
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Department*"
            className="w-full border rounded px-3 py-2"
            value={department}
            onChange={e => setDepartment(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location*"
            className="w-full border rounded px-3 py-2"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <input
            type="text"
            placeholder="Type"
            className="w-full border rounded px-3 py-2"
            value={type}
            onChange={e => setType(e.target.value)}
          />
          <input
            type="text"
            placeholder="Salary"
            className="w-full border rounded px-3 py-2"
            value={salary}
            onChange={e => setSalary(e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            className="w-full border rounded px-3 py-2"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}