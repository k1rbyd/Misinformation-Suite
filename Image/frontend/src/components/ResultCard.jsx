import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const ResultCard = ({ file, result }) => {
  const { score, label, features } = result;

  const fakeScore = (1 - score) * 100;
  const realScore = score * 100;

  const uploadedImage = file ? URL.createObjectURL(file) : null;

  // Simulated tampering radar data
  const radarData = useMemo(() => {
    return [
      { metric: "Noise Analysis", confidence: Math.random() * 100 },
      { metric: "JPEG Artifacts", confidence: Math.random() * 100 },
      { metric: "Color Inconsistency", confidence: Math.random() * 100 },
      { metric: "Edge Discontinuity", confidence: Math.random() * 100 },
      { metric: "Lighting Mismatch", confidence: Math.random() * 100 },
      { metric: "Shadow Irregularity", confidence: Math.random() * 100 },
    ];
  }, [result]);

  return (
    <motion.div
      className="grid grid-cols-2 gap-10 p-8 bg-gray-900/60 rounded-3xl shadow-2xl backdrop-blur-xl border border-gray-700"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left - Image + Confidence Bars */}
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {uploadedImage && (
            <motion.img
              src={uploadedImage}
              alt="Uploaded"
              className="rounded-2xl w-80 h-80 object-cover shadow-lg border border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
          <div className="absolute bottom-3 right-3 bg-gray-800/80 text-xs px-3 py-1 rounded-full border border-gray-700 text-gray-300">
            {label === "Real" ? "🟢 Real" : "🔴 Fake"}
          </div>
        </div>

        {/* Confidence Bars */}
        <div className="w-80 space-y-2">
          <p className="text-gray-300 text-sm font-medium">Confidence Levels</p>
          <div className="flex flex-col space-y-2">
            <div>
              <p className="text-xs text-green-400 mb-1">
                Real ({realScore.toFixed(1)}%)
              </p>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-green-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${realScore}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-red-400 mb-1">
                Fake ({fakeScore.toFixed(1)}%)
              </p>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-red-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${fakeScore}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Detection Confidence Radar */}
      <motion.div
        className="flex flex-col items-center justify-center space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-indigo-300">
          🧠 Detection Confidence Radar
        </h2>

        <div className="relative w-[320px] h-[320px] bg-gray-800/50 rounded-2xl border border-gray-700 shadow-inner p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#555" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#ccc", fontSize: 10 }}
              />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar
                name="Tampering Confidence"
                dataKey="confidence"
                stroke="#8B5CF6"
                fill="url(#colorGradient)"
                fillOpacity={0.6}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>

          {/* Floating Badge in Center */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-gray-900/80 border border-indigo-500 rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-xl">
              <p className="text-sm text-gray-400">Confidence</p>
              <p className="text-xl font-bold text-indigo-300">
                {(realScore).toFixed(1)}%
              </p>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          {radarData.map((d, i) => (
            <div
              key={i}
              className="bg-gray-800/40 px-3 py-2 rounded-xl border border-gray-700 text-center"
            >
              <p className="font-semibold text-indigo-400">{d.metric}</p>
              <p>{d.confidence.toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultCard;
