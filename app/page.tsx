"use client";

import { useState } from "react";
import CandidateForm from "@/app/components/CandidateForm";
import ResumePreview from "@/app/components/ResumePreview";

export default function Home() {
  const [resumeText, setResumeText] = useState("");

  const handleResumeUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/parseResume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          "Error uploading resume:",
          errorData.error || "Unknown error"
        );
        return;
      }

      const data = await res.json();
      console.log("data texxt::", data);
      if (!data.text) {
        console.warn("No text extracted from resume");
        return;
      }

      setResumeText(data.text);
      console.log("Resume text extracted successfully:", data.text);
    } catch (error) {
      console.error("Unexpected error while uploading resume:", error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Candidate Application</h1>
      <CandidateForm onUpload={handleResumeUpload} />
      <ResumePreview text={resumeText} />
    </div>
  );
}
