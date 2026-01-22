import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

interface ChatRequest {
  message: string;
  sessionId: string;
}

interface ExternalChatResponse {
  response: string;
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub, enterpriseId } = session.user;

  if (!enterpriseId) {
    return NextResponse.json(
      { error: "Enterprise ID not found" },
      { status: 400 }
    );
  }

  if (!sub) {
    return NextResponse.json(
      { error: "User ID not found" },
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

  const externalPayload = {
    session_id: sessionId,
    user_id: sub,
    query: message,
    patient_token: crypto.randomUUID(),
    e_id: enterpriseId,
  };

  const chatResponse = await fetch(process.env.CHAT_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(externalPayload),
  });

  if (!chatResponse.ok) {
    console.error("Chat API error:", chatResponse.status);
    return NextResponse.json(
      { error: "Failed to get response from chat service" },
      { status: 502 }
    );
  }

  const data: ExternalChatResponse = await chatResponse.json();

  return NextResponse.json({
    message: data.response,
    sessionId,
  });
}
