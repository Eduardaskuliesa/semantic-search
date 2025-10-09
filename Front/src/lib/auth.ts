import type { D1Database, IncomingRequestCfProperties, } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema";

function createAuth(env?: CloudflareEnv, cf?: IncomingRequestCfProperties) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env ? drizzle(env.DB, { schema }) : ({}) as any;

  return betterAuth({
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf || {},
        d1: env
          ? {
              db,
              options: {
                usePlural: true,
                schema,
              },
            }
          : undefined,
      },
      {
        secret: env?.BETTER_AUTH_SECRET,
        baseURL: env?.BETTER_AUTH_URL,
        emailAndPassword: {
          enabled: true,
        },
        rateLimit: {
          enabled: true,
        },
      }
    ),
    ...(env
      ? {}
      : {
          database: drizzleAdapter({} as D1Database, {
            provider: "sqlite",
            usePlural: true,
            debugLogs: true,
          }),
        }),
  });
}

export const auth = createAuth();

export async function initAuth() {
  const { env, cf } = await getCloudflareContext({ async: true });
  return createAuth(env, cf);
}