import React from "react";
import { motion } from "framer-motion";

const ConfidenceGauge = ({ score }) => {
  const percentage = Math.round(score * 100);
  const color =
    percentage >= 80
      ? "#22c55e" // green
      : percentage >= 60
      ? "#eab308" // yellow
      : "#ef4444"; // red

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative w-48 h-48">
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="#1e293b"
            strokeWidth="14"
            fill="none"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke={color}
            strokeWidth="14"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {percentage}%
          </motion.span>
          <span className="text-gray-300 text-sm tracking-wider">
            {percentage >= 60 ? "REAL" : "FAKE"}
          </span>
        </div>
      </div>

      <p className="text-gray-400 text-sm">
        Detection Confidence:{" "}
        <span className="text-white font-medium">{score.toFixed(3)}</span>
      </p>
    </div>
  );
};

export default ConfidenceGauge;
