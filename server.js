import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import zeroShotRouter from "./routes/zeroShot.js";
import systemUserPrompt from "./routes/systemUserPrompt.js";
import dynamicPrompt from "./routes/dynamicPrompt.js";
import oneShotRouter from "./routes/oneShotPrompt.js";
import multiShotRouter from "./routes/fewShotPrompt.js";
import cotPromptRouter from "./routes/COTPrompting.js";
import functionCall from "./routes/functionCalling.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/zero-shot", zeroShotRouter);
app.use("/api/systemuser", systemUserPrompt);
app.use("/api/dynamic-prompt", dynamicPrompt);
app.use("/api/one-shot", oneShotRouter);
app.use("/api/few-shot", multiShotRouter);
app.use("/api/cot-prompt", cotPromptRouter);
app.use("/api/function-call", functionCall);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
