// src/components/UploadForm.js
import React from "react";
import { motion } from "framer-motion";
import { useAnalyzer } from "../hooks/useAnalyzer";
import LoadingSpinner from "./LoadingSpinner";
import ResultCard from "./ResultCard";


const UploadForm = () => {
  const { file, result, loading, error, handleFileChange, handleAnalyze } =
    useAnalyzer();

  return (
    <div className="flex flex-col items-center justify-center w-full p-6 bg-gradient-to-br from-slate-900 via-gray-900 to-black min-h-screen text-white">
      <motion.h1
        className="text-4xl font-bold mb-10 bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🧠 Image Tampering Detector
      </motion.h1>

      {/* Upload Card */}
      <motion.div
        className="p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 border border-gray-700 rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-600 text-white font-medium transition-all"
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mt-3">{error}</p>
        )}
      </motion.div>

      {/* Result / Loading */}
      <div className="mt-10 w-full max-w-6xl flex flex-col items-center">
        {loading ? (
          <LoadingSpinner />
        ) : result ? (
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-8 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Image + result */}
            <ResultCard file={file} result={result} />

          
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default UploadForm;
