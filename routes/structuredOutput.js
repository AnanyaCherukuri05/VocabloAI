import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const router = express.Router();

const VocabSchema = z.object({
  word: z.string().min(1),
  definition: z.string().min(1),
  partOfSpeech: z.string().optional(),
  synonyms: z.array(z.string()).default([]),
  example: z.string().min(1),
});

const vocabResponseSchema = {
  type: "OBJECT",
  properties: {
    word: { type: "STRING", description: "The queried word." },
    definition: { type: "STRING", description: "A clear definition." },
    partOfSpeech: { type: "STRING", description: "Noun, verb, adjective, etc.", nullable: true },
    synonyms: { type: "ARRAY", items: { type: "STRING" }, description: "List of synonyms." },
    example: { type: "STRING", description: "Example sentence." }
  },
  required: ["word", "definition", "synonyms", "example"]
};

async function generateVocabEntry(word) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const systemPreamble =
    "You are a precise lexical assistant. Respond ONLY with valid JSON that matches the schema.";

  const userPrompt = `Provide a lexical entry for "${word}" with definition, synonyms, and an example.`;

  const result = await model.generateContent({
    systemInstruction: systemPreamble,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: vocabResponseSchema
    }
  });

  const raw = result.response.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error("Invalid JSON returned from Gemini.");
  }

  return VocabSchema.parse(parsed);
}

router.post("/structured/vocab", async (req, res) => {
  try {
    const { word } = req.body || {};
    if (!word || typeof word !== "string") {
      return res.status(400).json({ error: "Please provide 'word' as a non-empty string." });
    }
    const data = await generateVocabEntry(word);
    return res.json(data);
  } catch (err) {
    console.error("Structured output error:", err);
    return res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

export default router;
