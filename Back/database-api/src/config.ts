import * as dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = {
  SERVER_PORT: process.env.SERVER_PORT,
  SERVER_DOMAIN: process.env.SERVER_DOMAIN,
  SEMANTIC_SEARCH_API_KEY: process.env.SEMANTIC_SEARCH_API_KEY,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables:\n${missingEnvVars
      .map((variable) => `  - ${variable}`)
      .join(
        "\n"
      )}\n\nPlease check your .env file and ensure all required variables are defined.`
  );
}

const config = {
  server: {
    port: process.env.SERVER_PORT!,
    domain: process.env.SERVER_DOMAIN!,
  },
  frontEnd: {
    url: process.env.NEXT_PUBLIC_URL!,
    apiKey: process.env.SEMANTIC_SEARCH_API_KEY!,
  }
} as const;

export default config;
