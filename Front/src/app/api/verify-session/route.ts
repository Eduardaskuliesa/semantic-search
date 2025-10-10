import { initAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = req.headers.get("x-api-key");

  if (apiKey !== env.SEMANTIC_SEARCH_API_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionToken } = (await req.json()) as { sessionToken: string };
  const auth = await initAuth();

  const session = await auth.api.getSession({
    headers: new Headers({
      Cookie: `better-auth.session_token=${sessionToken}`,
    }),
  });

  if (!session) {
    return Response.json({ error: "Invalid session" }, { status: 401 });
  }

  return Response.json({ sessionIsValid: true });
}
