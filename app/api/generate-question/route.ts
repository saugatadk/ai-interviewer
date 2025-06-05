// /app/api/generate-question/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      question_amount = 5,
      title = "",
      level = "",
      type = "",
      company = "",
      industry = "",
      description = "",
      requirements,
      responsibilities,
    } = body ?? {};

    const reqs = Array.isArray(requirements) ? requirements : [];
    const resps = Array.isArray(responsibilities) ? responsibilities : [];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert HR interviewer and assessment expert. Your task is to generate concise, specific, and relevant interview questions based on a given job description and its structured details.

Objective:
Generate exactly ${question_amount} high-quality questions to evaluate a candidate’s readiness and fit for the role.

Focus Areas:
- Role Title: ${title}
- Experience Level: ${level}
- Employment Type: ${type}
- Company: ${company}
- Industry: ${industry}
- Core Job Description: ${description}

- Key Requirements: 
${reqs.map((item: string) => `- ${item}`).join("\n")}

- Key Responsibilities: 
${resps.map((item: string) => `- ${item}`).join("\n")} 

Guidelines:
  - Begin with basic questions, and gradually increase difficulty
  - Keep questions clear, focused, and to the point
  - Use the job data to assess:
    - Required technical skills and tools
    - Understanding of responsibilities
    - Candidate’s experience level and fit
    - Behavioral or situational thinking
  - Avoid over-explaining or adding fluff
  - Phrase questions as you would in a real interview
  - Do not include duplicates or generic questions

Avoid:
- Vague, repetitive, or off-topic questions
- Overly wordy or long-winded phrasing
- Hypothetical technologies not mentioned in the job data

Output Format:
Return only the questions in a valid JSON array of strings, like:
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse it as JSON
    let questions: string[] = [];
    try {
      questions = JSON.parse(text);
    } catch {
      // fallback: extract lines that look like questions
      questions = text
        .split("\n")
        .map((line) => line.trim().replace(/^[-*\d.]\s*/, ""))
        .filter((line) => line.length > 5);
    }

    return Response.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("error while generating questions", error);
    return Response.json(
      {
        success: false,
        message: "Error while generating questions",
      },
      { status: 500 }
    );
  }
}
