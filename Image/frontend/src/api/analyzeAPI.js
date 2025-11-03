// src/api/analyzeAPI.js
import axios from "axios";

// Update this to match your FastAPI port
const API_URL = "http://localhost:8080/analyze";

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error analyzing image:", error);
    throw error;
  }
};
