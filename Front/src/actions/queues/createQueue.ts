"use server";
import { getHeaders } from "@/helpers/getHeaders";

import { validateSession } from "@/helpers/validateSession";

export async function createQueue(queueName: string, key: string) {
  const session = await validateSession();
  const headers = await getHeaders();

  const response = await fetch(`http://localhost:4040/api/queue/${queueName}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      userId: session.user.id,
      key: key,
    }),
  });

  if (response.status !== 201) {
    return {
      success: false,
      error: "FAILED_TO_CREATE_QUEUE",
    };
  }

  return {
    success: true,
  };
}
