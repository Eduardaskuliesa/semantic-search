"use client";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import authClient from "@/lib/auth-client";

const SocialLogin = () => {
  const handleGoogleLogin = async () => {
    toast.info("Social login is not implemented yet.");
    // await authClient.signIn.social({
    //   provider: "google",
    // });
  };

  const handleGithubLogin = async () => {
    toast.info("Social login is not implemented yet.");
    await authClient.signOut();
    // await authClient.signIn.social({
    //   provider: "github",
    // });
  };

  return (
    <div className="space-y-4 mt-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-neutral-800 px-2 text-neutral-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="bg-neutral-700/50 cursor-pointer border-neutral-600 text-neutral-200 hover:bg-neutral-700 hover:text-neutral-100"
        >
          <FcGoogle className="w-5 h-5 mr-2" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGithubLogin}
          className="bg-neutral-700/50 cursor-pointer border-neutral-600 text-neutral-200 hover:bg-neutral-700 hover:text-neutral-100"
        >
          <FaGithub className="w-5 h-5 mr-2" />
          GitHub
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;
