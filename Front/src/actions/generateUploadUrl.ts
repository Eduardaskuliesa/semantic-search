"use server";
import { validateSession } from "@/helpers/validateSession";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AwsClient } from "aws4fetch";

export async function generateUploadUrl(fileName: string) {
  try {
    const session = await validateSession();
    const { env } = await getCloudflareContext();

    const key = `${session.user.id}/${fileName}`;

    const aws = new AwsClient({
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      service: "s3",
      region: "auto",
    });

    const url = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/semantic-search-files/${key}`;

    const signedRequest = await aws.sign(url, {
      method: "PUT",
      aws: {
        signQuery: true,
      },
    });

    return { uploadUrl: signedRequest.url, key };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    throw error;
  }
}