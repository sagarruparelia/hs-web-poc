import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

interface ChatRequest {
  message: string;
  sessionId: string;
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enterpriseId } = session.user;

  if (!enterpriseId) {
    return NextResponse.json(
      { error: "Enterprise ID not found" },
      { status: 400 }
    );
  }

  const body: ChatRequest = await request.json();
  const { message, sessionId } = body;

  if (!message || !sessionId) {
    return NextResponse.json(
      { error: "Message and sessionId are required" },
      { status: 400 }
    );
  }

  // TODO: Replace with actual chat API call
  // The chat API will use enterpriseId and sessionId for conversation context
  console.log("Chat request:", { enterpriseId, sessionId, message });

  // Placeholder response - replace with actual AI service call
  const response = {
    message: `This is a placeholder response. Your message: "${message}"`,
    sessionId,
  };

  return NextResponse.json(response);
}
