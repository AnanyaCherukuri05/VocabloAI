import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content:
            "You are an intelligent vocabulary assistant. Always respond in JSON with the following keys: definition, synonyms, antonyms, usageExample. Keep responses concise and clear.",
        },
        {
          role: "user",
          content: `Explain the word "${word}" in JSON format.`,
        },
      ],
      temperature: 0.7,
    });

    const aiMessage = response.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(aiMessage);
    } catch (err) {
      return res.json({
        raw: aiMessage,
        note: "Could not parse JSON, check output format.",
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
