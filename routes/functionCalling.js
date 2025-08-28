import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Define function schema
const tools = [
  {
    functionDeclarations: [
      {
        name: "defineVocabulary",
        description: "Provide meaning, synonyms, antonyms, and example usage for a word",
        parameters: {
          type: "object",
          properties: {
            definition: { type: "string", description: "Definition of the word" },
            synonyms: { type: "array", items: { type: "string" }, description: "Synonyms list" },
            antonyms: { type: "array", items: { type: "string" }, description: "Antonyms list" },
            usageExample: { type: "string", description: "Example sentence using the word" }
          },
          required: ["definition", "synonyms", "antonyms", "usageExample"]
        }
      }
    ]
  }
];

router.post("/", async (req, res) => {
  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `Explain the word "${word}"` }] }
      ],
      tools,
      toolConfig: { functionCallingConfig: { mode: "AUTO" } }
    });

    // Extract the function call output
    const functionCall = result.response.candidates[0].content.parts.find(
      (p) => p.functionCall
    );

    if (!functionCall) {
      return res.json({ raw: result.response.text(), note: "No structured output, check schema." });
    }

    const structuredData = functionCall.functionCall.args;

    res.json({
      word,
      ...structuredData
    });
  } catch (error) {
    console.error("Function Calling Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
