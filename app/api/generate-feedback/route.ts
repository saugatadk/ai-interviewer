import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import InterviewFeedbackGenerator from "@/lib/generate-feedback";

export async function POST(request: Request) {
  try {
    const { transcript, job, userId, interviewId, interviewQs, userName } = await request.json();

    if (!transcript || !job || !interviewId || !userId) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      );
    }

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const generator = new InterviewFeedbackGenerator(
      job,
      formattedTranscript,
      interviewQs,
      userName
    );

    const result = await generator.generateCompleteFeedback();

    if (userId && interviewId) {
      const cleanJob = {
        title: job.title,
        company: job.company,
        level: job.level,
        type: job.type,
        location: job.location,
        description: job.description,
      };

      await db
        .collection("users")
        .doc(userId)
        .collection("interviews")
        .doc(interviewId)
        .set({
          job: cleanJob,
          transcript,
          feedback: result,
          createdAt: new Date(),
        });
    }

    return NextResponse.json({ success: true, feedback: result });
  } catch (error) {
    console.error("Error generating feedback:", error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json(
      { success: false, message: "Failed to generate or save feedback." },
      { status: 500 }
    );
  }
}
