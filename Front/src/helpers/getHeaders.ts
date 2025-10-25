import getVerificationTokens from "./getVerificationTokens";

export async function getHeaders() {
  const { apiKey, sessionToken } = await getVerificationTokens();
  return {
    "x-api-key": apiKey!,
    "Content-Type": "application/json",
    "better-auth-session-token": sessionToken,
  };
}
