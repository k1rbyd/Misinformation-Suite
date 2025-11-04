import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "../components/Navbar";

const VerifyText = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const chatEndRef = useRef(null);

  // Animate "Analyzing..."
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 400);
      return () => clearInterval(interval);
    } else {
      setLoadingDots("");
    }
  }, [loading]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleVerify = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/verify-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      const botMessage = {
        role: "assistant",
        content: {
          verdict: data.verdict,
          confidence: data.confidence,
          explanation: data.explanation,
        },
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error connecting to backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <Navbar />

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg">💬 Ask me anything to verify it!</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } items-start gap-3`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-200" />
              </div>
            )}

            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl whitespace-pre-line leading-relaxed shadow-md ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a1a1a] text-gray-100 border border-gray-800"
              }`}
            >
              {msg.role === "assistant" && typeof msg.content === "object" ? (
                <>
                  <p>
                    <strong className="text-gray-300">Verdict:</strong>{" "}
                    {msg.content.verdict}
                  </p>
                  <p>
                    <strong className="text-gray-300">Confidence:</strong>{" "}
                    {msg.content.confidence}
                  </p>
                  <div className="mt-2 text-gray-200 leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content.explanation}
                    </ReactMarkdown>
                  </div>
                </>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-200" />
            </div>
            <div className="bg-[#1a1a1a] px-4 py-3 rounded-2xl text-gray-400">
              Analyzing{loadingDots}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-gray-800 bg-[#0d0d0d] p-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto relative">
          {/* Cool glowing input */}
          <textarea
            className="flex-1 h-14 p-3 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white resize-none outline-none transition-all focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 shadow-[0_0_10px_rgba(37,99,235,0.2)] custom-scrollbar"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleVerify()}
          />

          {/* Icon Button */}
          <button
            onClick={handleVerify}
            disabled={loading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              loading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95"
            }`}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-5 h-5"
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ repeat: loading ? Infinity : 0, duration: 1 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
                />
              </motion.svg>
            </button>
          </div>
        </div>
        <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
          <p className="mb-1">
            AI may occasionally be incorrect. Verify from reliable sources.
          </p>
          <p className="text-gray-700">
            © {new Date().getFullYear()} MultiGuard | Text Authenticity Verifier
          </p>
        </footer>
      </div>
    );

};

export default VerifyText;
