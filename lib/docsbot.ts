import { SignJWT } from 'jose';

export async function buildDocsBotAuthorization(teamId: string, botId: string): Promise<string | null> {
  const apiKey = process.env.DOCSBOT_API_KEY;
  if (apiKey) {
    return `Bearer ${apiKey}`;
  }

  const signatureKey = process.env.DOCSBOT_SIGNATURE_KEY;
  if (!signatureKey) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const secret = new TextEncoder().encode(signatureKey);

  const token = await new SignJWT({
    team_id: teamId,
    bot_id: botId,
    metadata: {},
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60)
    .sign(secret);

  return `Bearer ${token}`;
}
