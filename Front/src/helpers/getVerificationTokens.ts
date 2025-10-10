import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

export default async function getVerificationTokens() {
  const { env } = await getCloudflareContext({ async: true });
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token");

  return {
    apiKey: env.SEMANTIC_SEARCH_API_KEY!,
    sessionToken: sessionCookie?.value || "",
  };
}
