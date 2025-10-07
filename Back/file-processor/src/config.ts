import * as dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = {
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  QUEUE_NAME: process.env.QUEUE_NAME,
  HOTFOLDER_PATH: process.env.HOTFOLDER_PATH,
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
  redis: {
    port: process.env.REDIS_PORT!,
    domain: process.env.REDIS_HOST!,
  },
  queue: {
    name: process.env.QUEUE_NAME!,
  },
  hotfolder: {
    processPath: process.env.HOTFOLDER_PATH!,
  },
} as const;

export default config;
