import React, { useState, useEffect, useRef } from "react";

const VerifyText = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // chat history
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const chatEndRef = useRef(null);

  // 🔁 Animate "Analyzing..."
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setLoadingDots("");
    }
  }, [loading]);

  // 🧭 Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleVerify = async () => {
    if (!input.trim()) return;

    // add user message
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

      // build assistant message
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
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-between p-4">
      {/* Header */}
      <header className="text-2xl font-semibold text-blue-400 my-4">
        Misinformation Detection Suite
      </header>

      {/* Chat Window */}
      <div className="w-full max-w-3xl flex-1 overflow-y-auto bg-[#1e1e1e] rounded-2xl shadow-md p-6 space-y-4 border border-gray-800">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-100"
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
                  <p className="mt-2 text-gray-200 leading-relaxed">
                    {msg.content.explanation}
                  </p>
                </>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Loading message */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 px-4 py-3 rounded-2xl">
              Analyzing{loadingDots}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="w-full max-w-3xl mt-4 flex items-center space-x-3">
        <textarea
          className="flex-1 h-16 p-3 rounded-xl bg-[#1e1e1e] border border-gray-700 text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter text or claim to verify..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default VerifyText;
