// src/hooks/useAnalyzer.js
import { useState } from "react";
import { analyzeImage } from "../api/analyzeAPI";

export const useAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload an image first!");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await analyzeImage(file);
      setResult(data);
    } catch (err) {
      setError("Error analyzing image.");
    } finally {
      setLoading(false);
    }
  };

  return {
    file,
    result,
    loading,
    error,
    handleFileChange,
    handleAnalyze,
  };
};
