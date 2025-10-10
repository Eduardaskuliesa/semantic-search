"use server";
import { initAuth } from "@/lib/auth";
import { headers } from "next/headers";

interface SignInData {
  email: string;
  password: string;
}

export async function singInAction(formData: SignInData) {
  const auth = await initAuth();
  const response = await auth.api.signInEmail({
    body: {
      email: formData.email,
      password: formData.password,
    },
  });

  return { response };
}

export async function singUpAction(formData: SignInData & { name: string }) {
  const auth = await initAuth();
  await auth.api.signUpEmail({
    body: {
      email: formData.email,
      password: formData.password,
      name: formData.name,
    },
  });
}

export async function signOutAction() {
  const auth = await initAuth();
  await auth.api.signOut({
    headers: await headers(),
  });
}
