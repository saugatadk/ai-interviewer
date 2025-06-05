import { GoogleGenerativeAI } from "@google/generative-ai";
import { InterviewFeedbackResult, LLMResponse } from "@/types/feedback";
import { Job } from "@/types/feedback";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class InterviewFeedbackGenerator {
  private jobDetails: Job;
  private transcript: string;
  private questions: string[];
  private userName: string;

  constructor(jobDetails: Job, transcript: string, questions: string[], userName: string) {
    this.jobDetails = jobDetails;
    this.transcript = transcript;
    this.questions = questions;
    this.userName = userName;
  }

  async generateInterviewSummary() {
    const prompt = `
      As a senior interview coach, analyze this candidate's overall performance:
      
      Job Data:
      Position: ${this.jobDetails.title} at ${this.jobDetails.company}
      Employment Type: ${this.jobDetails.type}
      Experience Level: ${this.jobDetails.level}
      Industry: ${this.jobDetails.industry}
      Role Description: ${this.jobDetails.description}

      Candidate's Name: ${this.userName}

      KEY REQUIREMENTS:
      ${(this.jobDetails.requirements?.map(item => `- ${item}`).join("\n")) || "Not specified"}

      Focus on:
      - Overall impression and themes
      - Observable strengths across all answers
      - Areas needing improvement
      - Overall rating (0-10)

      Interview transcript or conversation:
      ${this.transcript}

      Return only JSON:
      {
        "overall_analysis": "string",
        "notable_strengths": ["array of strings"],
        "areas_for_improvement": ["array of strings"],
        "overall_rating": "float (0.0 to 10.0)"
      }`;

    return this.callLLM(prompt);
  }

  async generateScorecard() {
    const prompt = `
      As a senior interview coach, evaluate this candidate's performance:
      
      Position: ${this.jobDetails.title} at ${this.jobDetails.company}
      Employment Type: ${this.jobDetails.type}
      Experience Level: ${this.jobDetails.level}
      Industry: ${this.jobDetails.industry}
      Role Description: ${this.jobDetails.description}

      Candidate's Name: ${this.userName}

      KEY REQUIREMENTS:
      ${this.jobDetails.requirements.map(item => `- ${item}`).join("\n")}

      MAIN RESPONSIBILITIES:
      ${this.jobDetails.responsibilities.map(item => `- ${item}`).join("\n")}

      Transcript:
      ${this.transcript}

      Score each area 0-10 with detailed specific commentary:

      Return only JSON:
      {
        "technical_skills": {"score": number, "commentary": "string"},
        "problem_solving": {"score": number, "commentary": "string"},
        "communication": {"score": number, "commentary": "string"},
        "confidence": {"score": number, "commentary": "string"}
      }`;

    return this.callLLM(prompt);
  }

  async generateQuestionFeedback() {
    const questionFeedback = [];

    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];

      if (!question || question.trim().length < 5) continue; // Skip empty or invalid questions

      const candidateAnswer = await this.extractAnswerForQuestion(question);

      const prompt = `
        As an interview coach, evaluate this single Q&A:

        Position: ${this.jobDetails.title} at ${this.jobDetails.company}
        Employment Type: ${this.jobDetails.type}
        Experience Level: ${this.jobDetails.level}
        Industry: ${this.jobDetails.industry}
        Role Description: ${this.jobDetails.description}

        Candidate's Name: ${this.userName}

        Question: "${question}"
        Candidate Answer: "${candidateAnswer}"

        Job Requirements:
        ${this.jobDetails.requirements.map(item => `- ${item}`).join("\n")}

        Provide detailed feedback:
        1. Ideal answer for this role
        2. Key points a strong candidate should mention
        3. Evaluation of the candidate's answer
        4. Missed opportunities
        5. Depth and insight
        6. Coaching recommendation

        Return ONLY JSON:
        {
          "question_id": ${i + 1},
          "question": "${question}",
          "candidate_answer": "${candidateAnswer}",
          "actual_answer": "ideal response for this role",
          "expected_ideal_points": ["key points array"],
          "evaluation": {
            "score": number,
            "coverage": "coverage analysis",
            "missed_points": ["missed points array"],
            "depth": "depth evaluation"
          },
          "recommendation": "coaching suggestion"
        }`;

      const feedback = await this.callLLM(prompt);
      questionFeedback.push(Array.isArray(feedback) ? feedback[0] : feedback);
    }

    return questionFeedback;
  }

  async generateFinalRecommendations() {
    const prompt = `
      As a senior interview coach, give final recommendations:

      JOB: ${this.jobDetails.title} at ${this.jobDetails.company}
      INDUSTRY: ${this.jobDetails.industry}
      LEVEL: ${this.jobDetails.level}
      Role Description: ${this.jobDetails.description}

      Candidate's Name: ${this.userName}

      KEY REQUIREMENTS:
      ${this.jobDetails.requirements.map(item => `- ${item}`).join("\n")}

      MAIN RESPONSIBILITIES:
      ${this.jobDetails.responsibilities.map(item => `- ${item}`).join("\n")}

      TRANSCRIPT:
      ${this.transcript}

      Provide:
      1. Practice areas to focus on
      2. Readiness assessment
      3. One actionable tip

      Return ONLY JSON:
      {
        "practice_focus_areas": ["..."],
        "overall_impression": "...",
        "final_tip": "..."
      }`;

    return this.callLLM(prompt);
  }

  async generateCompleteFeedback(): Promise<InterviewFeedbackResult> {
    try {
      const [summary, scorecard, questionFeedback, recommendations] = await Promise.all([
        this.generateInterviewSummary(),
        this.generateScorecard(),
        this.generateQuestionFeedback(),
        this.generateFinalRecommendations(),
      ]);

      return {
        interview_summary: summary,
        scorecard,
        per_question_feedback: questionFeedback,
        final_recommendations: recommendations,
      };
    } catch (error) {
      console.error("Error generating feedback:", error);
      throw new Error("Failed to generate complete feedback");
    }
  }

  async extractAnswerForQuestion(question: string): Promise<string> {
    const prompt = `
      You are an expert assistant.

      Given the question:
      "${question}"

      Extract the exact candidate answer (word-for-word) from this transcript:

      ${this.transcript}

      If no answer is found, return "Answer not found".

      Return JSON:
      {
        "exact_answer": "string"
      }`;

    const response: LLMResponse = await this.callLLM(prompt);
    return response?.exact_answer || "Answer not found";
  }

  async callLLM(prompt: string): Promise<any> {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      var text = response.text();

      // Remove Markdown code block if present
      text = text.trim();
      if (text.startsWith("```")) {
      // Remove the first line (```json or ```) and the last line (```)
      text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
      }
      
      try {
        return JSON.parse(text);
      } catch {
        console.warn("⚠️ Failed to parse JSON, returning raw text:", text);
        return text;
      }
    } catch (error) {
      console.error("Error calling Gemini LLM:", error);
      throw error;
    }
  }
}

export default InterviewFeedbackGenerator;