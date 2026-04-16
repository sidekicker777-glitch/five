import { NextRequest, NextResponse } from 'next/server';
import { buildDocsBotAuthorization } from '@/lib/docsbot';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = body as {
    teamId?: string;
    botId?: string;
    payload?: {
      question?: string;
      conversationId?: string;
      stream?: boolean;
      metadata?: Record<string, unknown>;
    };
  };

  const teamId = parsed.teamId || process.env.DOCSBOT_TEAM_ID || process.env.NEXT_PUBLIC_DEFAULT_TEAM_ID;
  const botId = parsed.botId || process.env.DOCSBOT_BOT_ID || process.env.NEXT_PUBLIC_DEFAULT_BOT_ID;

  if (!teamId || !botId) {
    return NextResponse.json(
      { message: 'Missing teamId or botId. Provide them in the request body or environment variables.' },
      { status: 400 }
    );
  }

  if (!parsed.payload?.question) {
    return NextResponse.json({ message: 'Missing payload.question.' }, { status: 400 });
  }

  const authHeader = await buildDocsBotAuthorization(teamId, botId);

  const response = await fetch(`https://api.docsbot.ai/teams/${teamId}/bots/${botId}/chat-agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(parsed.payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let data: unknown = text;

  try {
    data = JSON.parse(text);
  } catch {
    // leave raw text as-is
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        message: 'DocsBot request failed.',
        status: response.status,
        details: data,
      },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
