import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const AIreply = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // 🔥 Use simplest working model
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
    });

    console.log(response.text);

    res.json({
      success: true,
      message: response.text,
    });

  } catch (error) {
    console.error("FULL ERROR:", error); // 👈 print full error

    res.status(500).json({
      success: false,
      message: error.message || "AI failed",
    });
  }
};