// src/components/LoadingSpinner.jsx
import React from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-2xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Brain size={36} className="text-white" />
      </motion.div>
      <motion.p
        className="text-gray-300 font-medium text-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Analyzing image...
      </motion.p>
    </motion.div>
  );
};

export default LoadingSpinner;
