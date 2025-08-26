import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/zero-shot
router.post("/", async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Please provide a word" });
    }

    // Zero-Shot Prompt
    const prompt = `Give me the definition, synonyms, antonyms, 
    and an example sentence for the word "${word}". 
    Format it as:
    Definition: ...
    Synonyms: ...
    Antonyms: ...
    Example: ...`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    if (
      !response.choices ||
      !response.choices[0] ||
      !response.choices[0].message ||
      !response.choices[0].message.content
    ) {
      return res.status(500).json({ error: "Invalid response from OpenAI" });
    }

    res.json({
      word,
      result: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
