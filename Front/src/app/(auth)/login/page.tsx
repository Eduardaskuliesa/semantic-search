import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import LoginForm from "../components/LoginForm";
import SocialLogin from "../components/SocialLogin";
import Link from "next/link";

const LoginPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Card className="p-6 w-96 mx-2 bg-neutral-800 border-neutral-600 rounded-md text-neutral-200">
        <CardHeader className="p-0">
          <CardTitle>Login to your account</CardTitle>
          <CardDescription className="text-neutral-400">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <LoginForm />
          <SocialLogin />
          <div className="mt-4 text-center text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-neutral-200 hover:text-neutral-100 underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginPage;
