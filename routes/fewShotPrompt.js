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

    // Few-shot prompt (multi-shot examples)
    const fewShotPrompt = `
You are VocabloAI, a smart vocabulary assistant.
Always respond ONLY in valid JSON format with the following structure:
{
  "definition": "...",
  "synonyms": ["..."],
  "antonyms": ["..."],
  "usageExample": "..."
}

Here are some examples:

Word: "serendipity"
Output:
{
  "definition": "the occurrence of events by chance in a happy or beneficial way",
  "synonyms": ["luck", "chance", "fortune"],
  "antonyms": ["misfortune", "bad luck"],
  "usageExample": "By sheer serendipity, she found her lost wallet in the park."
}

Word: "ephemeral"
Output:
{
  "definition": "lasting for a very short time",
  "synonyms": ["short-lived", "transient", "momentary"],
  "antonyms": ["enduring", "lasting", "permanent"],
  "usageExample": "The beauty of a rainbow is ephemeral, fading in moments."
}

Now generate the JSON for the word: "${word}"
`;

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(fewShotPrompt);

    let aiMessage = response.response.text().trim();

    if (aiMessage.startsWith("```")) {
      aiMessage = aiMessage.replace(/```json|```/g, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(aiMessage);
    } catch (err) {
      return res.json({
        raw: aiMessage,
        note: "Could not parse JSON, check output format.",
      });
    }

    res.json({ word, ...parsed });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
