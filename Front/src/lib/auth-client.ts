import { createAuthClient } from "better-auth/client";
import { cloudflareClient } from "better-auth-cloudflare/client";


console.log("Base URL:", process.env.NEXT_PUBLIC_APP_UR);
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_UR,
  plugins: [cloudflareClient()],
});

export default authClient;
