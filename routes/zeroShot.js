import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// 🔹 helper to strip markdown ```json blocks
function cleanJSON(text) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}


router.post("/", async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Please provide a word" });
    }


    const prompt = `
You are an intelligent vocabulary assistant.
ONLY respond in strict JSON format, with no extra text, no Markdown, no explanations.

The JSON should look like this:
{
  "definition": "string",
  "synonyms": ["string", "string", ...],
  "antonyms": ["string", "string", ...],
  "example": "string"
}

Now generate the JSON for the word: "${word}"
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

    const aiMessage = response.response.text();


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


    let parsed;
    try {
      const cleanText = cleanJSON(aiMessage);
      parsed = JSON.parse(cleanText);
    } catch (err) {
      return res.json({
        raw: aiMessage,
        note: "Could not parse JSON, check output format.",
      });
    }

    res.json({
      word,
      ...parsed,
    });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Something went wrong with Gemini API" });
  }
});

export default router;
