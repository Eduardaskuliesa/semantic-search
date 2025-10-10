"use server";
import { unstable_cache } from "next/cache";

async function fetchDummyData(userId: string) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    id: userId,
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date().toISOString(),
  };
}

const getCachedUserData = unstable_cache(
  async (userId: string) => {
    console.log("🔴 Cache MISS");
    return await fetchDummyData(userId);
  },
  ["user-data"],
  {
    revalidate: 60,
    tags: ["users"],
  }
);

export async function getDummyUserAction(userId: string) {
  const userData = await getCachedUserData(userId);
  return userData;
}
