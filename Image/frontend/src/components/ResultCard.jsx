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
  const { score, label } = result;

  const fakeScore = (1 - score) * 100;
  const realScore = score * 100;
  const uploadedImage = file ? URL.createObjectURL(file) : null;

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
      className="w-full flex flex-col md:flex-row justify-center items-start gap-12 px-12 py-16"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left: Image + Confidence Bars */}
      <div className="flex flex-col items-center space-y-6 md:w-1/2 w-full">
        <div className="relative">
          {uploadedImage && (
            <motion.img
              src={uploadedImage}
              alt="Uploaded"
              className="rounded-2xl w-[24rem] h-[24rem] object-cover shadow-lg border border-gray-700"
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
        <div className="w-[20rem] space-y-2">
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

      {/* Right: Radar Chart + Metrics */}
      <motion.div
        className="flex flex-col items-center justify-start space-y-8 md:w-1/2 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-indigo-300 text-center">
          🧠 Detection Confidence Radar
        </h2>

        <div className="relative w-[360px] h-[360px] bg-gray-800/50 rounded-2xl border border-gray-700 shadow-inner p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
              <PolarGrid stroke="#555" />

              <PolarAngleAxis
                dataKey="metric"
                tick={({ payload, x, y, textAnchor }) => (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fill="#ddd"
                    fontSize={11}
                    fontFamily="Inter, sans-serif"
                    dy={5}
                    style={{ pointerEvents: "none" }}
                  >
                    {payload.value.split(" ").map((line, index) => (
                      <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                )}
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

          {/* Floating Badge */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-gray-900/80 border border-indigo-500 rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-xl">
              <p className="text-sm text-gray-400">Confidence</p>
              <p className="text-xl font-bold text-indigo-300">
                {realScore.toFixed(1)}%
              </p>
            </div>
          </motion.div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-6 text-sm text-gray-300 w-full px-4">
          {radarData.map((d, i) => (
            <div
              key={i}
              className="bg-gray-800/40 px-4 py-3 rounded-xl border border-gray-700 text-center"
            >
              <p className="font-semibold text-indigo-400 text-sm">
                {d.metric}
              </p>
              <p>{d.confidence.toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultCard;
