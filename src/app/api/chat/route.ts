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

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = chatResponse.body?.getReader();
      if (!reader) {
        controller.enqueue(encoder.encode("event: done\ndata: \n\n"));
        controller.close();
        return;
      }
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          controller.enqueue(
            encoder.encode(`event: message\ndata: ${JSON.stringify(chunk)}\n\n`)
          );
        }
        controller.enqueue(encoder.encode("event: done\ndata: \n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
