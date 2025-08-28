import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * @param {string} word - the vocabulary word
 * @param {string} difficulty - explanation level (easy, medium, hard)
 * @param {string} style - tone/style (simple, formal, fun, academic, etc.)
 * @returns {Promise<string>} - AI-generated response
 */
async function getDynamicPrompt(word, difficulty = "medium", style = "simple") {
  try {
    const systemPrompt = `
      You are VocabloAI, a smart vocabulary assistant.
      - Explain words in a ${style} style.
      - Adjust explanation difficulty to ${difficulty}.
      - Always provide:
        1. Definition
        2. Synonyms
        3. Example sentence
    `;

    const userPrompt = `Explain the word: "${word}"`;

    const prompt = `${systemPrompt}\n\n${userPrompt}`;

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

    return response.response.text().trim();
  } catch (error) {
    console.error("Dynamic Prompt Error:", error);
    throw new Error("Failed to generate response");
  }
}

router.post("/", async (req, res) => {
  try {
    const { word, difficulty, style } = req.body;
    const result = await getDynamicPrompt(word, difficulty, style);
    res.json({ word, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
