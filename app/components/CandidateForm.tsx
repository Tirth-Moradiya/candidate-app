"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface CandidateFormProps {
  onUpload: (file: File) => void;
}

export default function CandidateForm({ onUpload }: CandidateFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    skills: "",
    experience: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setResume(file);
      onUpload(file); // Upload resume file
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const payload = { ...formData };

    try {
      const response = await fetch("/api/storeCandidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      toast.success("Candidate stored successfully! 🎉");

      // Clear all fields
      setFormData({
        name: "",
        email: "",
        linkedin: "",
        skills: "",
        experience: "",
      });
      setResume(null);
      setLoading(false);
    } catch (error) {
      toast.error("Error submitting form. Please try again.");
      console.error("❌ Error submitting form:", error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-2">Candidate Application</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded mb-2"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        name="linkedin"
        placeholder="LinkedIn URL"
        value={formData.linkedin}
        onChange={handleChange}
        className="block w-full p-2 border rounded mb-2"
      />
      <textarea
        name="skills"
        placeholder="Skills"
        value={formData.skills}
        onChange={handleChange}
        className="block w-full p-2 border rounded mb-2"
      ></textarea>
      <textarea
        name="experience"
        placeholder="Experience"
        value={formData.experience}
        onChange={handleChange}
        className="block w-full p-2 border rounded mb-2"
      ></textarea>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block w-full p-2 border rounded mb-2"
      />
      <button
        type="submit"
        className={`px-4 py-2 text-white rounded ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
        }`}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
