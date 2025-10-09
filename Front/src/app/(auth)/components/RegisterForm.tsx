"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { MotionButton } from "@/components/ui/motion-button";
import { toast } from "sonner";
import authClient from "@/lib/auth-client";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (error) {
        setError("root", {
          type: "manual",
          message: error.message || "Registration failed",
        });
        toast.error("Registration failed");
        return;
      }

      toast.success("Welcome!", {
        description: "Your account has been created successfully.",
      });

      reset();
    } catch {
      toast.error("Internal server error. Please try again later.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-neutral-200 text-sm font-medium">
          Name
        </Label>
        <Input
          className="bg-neutral-700/50 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500 h-10 transition-colors"
          id="name"
          {...register("name")}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="text-xs text-red-400 mt-1.5">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-neutral-200 text-sm font-medium">
          Email
        </Label>
        <Input
          type="email"
          className="bg-neutral-700/50 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500 h-10 transition-colors"
          id="email"
          {...register("email")}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-neutral-200 text-sm font-medium"
        >
          Password
        </Label>
        <Input
          type={showPassword ? "text" : "password"}
          className="bg-neutral-700/50 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500 h-10 transition-colors"
          id="password"
          {...register("password")}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-xs text-red-400 mt-1.5">
            {errors.password.message}
          </p>
        )}
        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="showPassword"
            checked={showPassword}
            onCheckedChange={(checked) => setShowPassword(checked as boolean)}
            className="border-neutral-600 data-[state=checked]:bg-neutral-200 data-[state=checked]:text-neutral-900"
          />
          <Label
            htmlFor="showPassword"
            className="text-sm text-neutral-400 font-normal cursor-pointer flex items-center gap-1.5"
          >
            {showPassword ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            Show password
          </Label>
        </div>
      </div>

      {errors.root && (
        <p className="text-xs text-red-400">{errors.root.message}</p>
      )}

      <MotionButton
        type="submit"
        className="w-full bg-neutral-200 cursor-pointer hover:bg-neutral-300 text-neutral-900 font-medium h-10 transition-colors mt-4 mb-4"
        disabled={isSubmitting}
        whileTap={{ scale: 0.98, translateY: 2 }}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )}
        {isSubmitting ? "Creating account..." : "Create account"}
      </MotionButton>
    </form>
  );
};

export default RegisterForm;