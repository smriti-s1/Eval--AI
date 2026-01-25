import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// --- DEBUG: API KEY CHECK ---
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is missing in .env file!");
}

// --- GEMINI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: { responseMimeType: "application/json" }
});

const parseAIJSON = (text) => {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
    return {};
  } catch (e) {
    return {};
  }
};

// ==========================================================
// 1. PROCESS DOCS (OCR)
// ==========================================================
app.post('/api/process-docs', async (req, res) => {
  const { qpList = [], ansList = [] } = req.body;
  console.log(`📡 Processing: ${qpList.length} QP, ${ansList.length} Answer Sheets`);

  try {
    if (ansList.length === 0) throw new Error("No answer sheets received.");

    const fileNamesString = ansList.map(f => f.filename).join(", ");
    
    const prompt = `
      I have uploaded ${ansList.length} ANSWER SHEET IMAGES.
      The filenames are: [ ${fileNamesString} ].

      TASK:
      1. Analyze the filenames strictly. 
      2. Group images by student (e.g., "12_Page1.jpg" and "12_Page2.jpg" = same student "12").
      3. If I uploaded 3 different files, I expect 3 entries in the output.
      
      OUTPUT JSON:
      {
        "questionText": "Question extracted...",
        "students": [
          { "studentId": "Filename 1", "answerText": "Transcribed text..." },
          { "studentId": "Filename 2", "answerText": "Transcribed text..." }
        ]
      }
    `;

    const parts = [
      { text: prompt },
      ...qpList.map(f => ({ inlineData: { data: f.data, mimeType: f.type } })),
      ...ansList.flatMap(f => [
          { text: `\n\n--- IMAGE START: ${f.filename} ---\n` },
          { inlineData: { data: f.data, mimeType: f.type } }
      ])
    ];

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const parsedData = parseAIJSON(result.response.text());
    
    console.log(`✅ OCR Success: Detected ${parsedData.students?.length || 0} students.`);
    res.json(parsedData);

  } catch (e) {
    console.error("❌ OCR Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ==========================================================
// 2. GENERATE MODEL ANSWER
// ==========================================================
app.post('/api/generate-answer', async (req, res) => {
  try {
    const result = await model.generateContent(`Question: ${req.body.question}. Write a concise model answer. Return JSON: {"answer": "..."}`);
    res.json(parseAIJSON(result.response.text()));
  } catch(e) {
    res.status(500).json({ error: "Failed to generate model answer" });
  }
});

// ==========================================================
// 3. BATCH EVALUATE (Teacher Note + Improvement Tip)
// ==========================================================
app.post('/api/evaluate-text', async (req, res) => {
  const { question, modelAnswer, students, strictness } = req.body;

  if (!students || !Array.isArray(students)) return res.status(400).json({ error: "No students provided" });

  console.log(`📝 Evaluating ${students.length} students (Mode: ${strictness})...`);
  
  let results = [];
  let totalScore = 0;
  let mistakes = {};

  for (const s of students) {
    if(!s.answerText || s.answerText.length < 5) continue;

    const prompt = `
      Question: ${question}
      Model Answer: ${modelAnswer}
      Student Answer: ${s.answerText}
      EVALUATION MODE: ${strictness || "Moderate"}
      
      Instructions:
      - If 'Strict': Deduct marks heavily.
      - If 'Lenient': Ignore minor errors.
      
      Task: Evaluate out of 10.
      Return JSON: { "score": "X/10", "feedback": "Short feedback (max 20 words)." }
    `;

    try {
      const r = await model.generateContent(prompt);
      const data = parseAIJSON(r.response.text());
      const scoreNum = parseFloat(data.score) || 0;
      totalScore += scoreNum;
      
      const fb = (data.feedback || "").toLowerCase();
      if(fb.includes("miss")) mistakes["Missing Concepts"] = (mistakes["Missing Concepts"] || 0) + 1;
      if(fb.includes("wrong")) mistakes["Incorrect Logic"] = (mistakes["Incorrect Logic"] || 0) + 1;

      results.push({ studentId: s.studentId, score: data.score || "0/10", feedback: data.feedback || "Checked" });
    } catch (e) {
      results.push({ studentId: s.studentId, score: "0/10", feedback: "AI Error" });
    }
  }

  const avg = (totalScore / (results.length || 1)).toFixed(1);
  const commonMistakes = Object.keys(mistakes).slice(0,3);
  
  //  Generate Smart Teacher Note
  const improvementTip = commonMistakes.length > 0 
    ? `Class is struggling with: ${commonMistakes.join(", ")}. Consider revising these topics.` 
    : "Excellent performance! No major gaps found.";

  res.json({
    results,
    teacherInsights: {
      classAverage: avg + "/10",
      totalStudents: results.length,
      commonMistakes: commonMistakes.length ? commonMistakes : ["None"],
      improvementTip 
    }
  });
});


export default app;


