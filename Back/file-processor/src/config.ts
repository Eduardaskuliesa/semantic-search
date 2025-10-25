import * as dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = {
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  HOTFOLDER_PATH: process.env.HOTFOLDER_PATH,
  LOCAL_QUEUE_NAME: process.env.LOCAL_QUEUE_NAME,
  S3_QUEUE_NAME: process.env.S3_QUEUE_NAME,
  CLOUD_QUEUE_NAME: process.env.CLOUD_QUEUE_NAME,
  GOOGLE_GEN_AI_API_KEY: process.env.GOOGLE_GEN_AI_API_KEY,
  ACCOUNT_ID: process.env.ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
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
    localQueue: process.env.LOCAL_QUEUE_NAME!,
    s3Queue: process.env.S3_QUEUE_NAME!,
    cloudQueue: process.env.CLOUD_QUEUE_NAME!,
  },
  hotfolder: {
    processPath: process.env.HOTFOLDER_PATH!,
  },
  google: {
    genAi: process.env.GOOGLE_GEN_AI_API_KEY!,
  },
  r2: {
    accountId: process.env.ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
  }
} as const;

export default config;
