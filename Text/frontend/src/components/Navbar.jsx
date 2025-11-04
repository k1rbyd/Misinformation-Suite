import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full bg-[#0f0f0f]/90 border-b border-gray-800 px-6 py-4 flex justify-between items-center backdrop-blur-sm sticky top-0 z-50">
      <a
        href="https://k1rbyd.github.io/MultiGuard/"
        className="text-lg font-semibold text-white hover:text-blue-400 transition"
      >
        MultiGuard
      </a>

      <div className="space-x-6 text-sm">
        <a
          href="https://k1rbyd.github.io/MultiGuard/"
          className="text-gray-300 hover:text-white transition"
        >
          Home
        </a>
        <a
          href="#"
          className="text-gray-400 cursor-default"
        >
          Text Verifier
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
