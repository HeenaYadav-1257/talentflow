// src/components/Jobs/JobModal.tsx
import React, { useState, useEffect } from "react";
import { X, Briefcase, MapPin, DollarSign, Users } from "lucide-react";
import { useJobStore } from "../../store/jobStore";
import { EmploymentType, type Job, JobStatus } from "../../types";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, job }) => {
  const { createJob, updateJob, fetchJobs } = useJobStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    title: string;
    department: string;
    location: string;
    type: EmploymentType;
    salary: string;
    description: string;
    tags: string;
    postedDate: string;
    status: JobStatus;
  }>({
    title: "",
    department: "",
    location: "",
    type: EmploymentType.FullTime,
    salary: "",
    description: "",
    tags: "",
    postedDate: new Date().toISOString().split("T")[0],
    status: JobStatus.Open,
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type as EmploymentType,
        salary: job.salary,
        description: job.description,
        tags: job.tags ? job.tags.join(", ") : "",
        postedDate: job.postedDate,
        status: job.status,
      });
    } else {
      setFormData({
        title: "",
        department: "",
        location: "",
        type: EmploymentType.FullTime,
        salary: "",
        description: "",
        tags: "",
        postedDate: new Date().toISOString().split("T")[0],
        status: JobStatus.Open,
      });
    }
    setErrors({});
  }, [job, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.salary.trim()) newErrors.salary = "Salary range is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (formData.description.length < 50)
      newErrors.description = "Description must be at least 50 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "type" ? (value as EmploymentType) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const jobData: Partial<Job> = {
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (job) await updateJob(job.id, jobData);
      else await createJob(jobData as Job);

      await fetchJobs();
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Failed to save job. Try again." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            {job ? "Edit Job" : "Create Job"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-5">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Job Title *</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Department *</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.department ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. Engineering"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </div>
          </div>

          {/* Type & Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Employment Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value={EmploymentType.FullTime}>Full-time</option>
                <option value={EmploymentType.PartTime}>Part-time</option>
                <option value={EmploymentType.Contract}>Contract</option>
                <option value={EmploymentType.Internship}>Internship</option>
                <option value={EmploymentType.Freelance}>Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Salary Range *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.salary ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. $120k - $160k"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Provide detailed job description..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. React, TypeScript, Remote"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? (job ? "Updating..." : "Creating...") : job ? "Update Job" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
