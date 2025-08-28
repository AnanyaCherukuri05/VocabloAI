import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }

    const prompt = `
You are VocabloAI, a smart vocabulary assistant. 
Think step by step about the meaning of the word, synonyms, antonyms, and usage.
Show your reasoning clearly, then finally give the structured JSON.

Final output must be in **valid JSON** format:
{
  "definition": "...",
  "synonyms": ["..."],
  "antonyms": ["..."],
  "usageExample": "..."
}

Word: "${word}"
`;

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

    let aiMessage = response.response.text().trim();

    // Clean ```json wrappers if present
    if (aiMessage.startsWith("```")) {
      aiMessage = aiMessage.replace(/```json|```/g, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(aiMessage);
    } catch (err) {
      return res.json({
        raw: aiMessage,
        note: "Could not parse JSON, maybe reasoning text leaked into output.",
      });
    }

    res.json({ word, ...parsed });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
