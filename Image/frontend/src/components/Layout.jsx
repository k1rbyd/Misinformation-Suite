// src/components/Layout.jsx
import React from "react";
import { motion } from "framer-motion";

const Layout = ({ children }) => {
  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-gray-900 to-black 
      text-white flex flex-col items-center justify-start overflow-y-auto select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

export default Layout;
