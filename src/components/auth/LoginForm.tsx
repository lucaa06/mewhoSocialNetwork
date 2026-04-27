"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SocialAuthButtons } from "./SocialAuthButtons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      setLoading(false);
      toast.error(error.message === "Invalid login credentials" ? "Email o password errati" : error.message);
      return;
    }
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const currentLevel = aal?.currentLevel;
    const nextLevel = aal?.nextLevel;
    setLoading(false);
    if (nextLevel === "aal2" && currentLevel !== "aal2") {
      router.push("/2fa");
      return;
    }
    router.push(searchParams.get("next") ?? "/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <SocialAuthButtons mode="signin" />

      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-black/8" />
        <span className="text-[11px] font-medium text-black/30 uppercase tracking-widest">oppure</span>
        <span className="flex-1 h-px bg-black/8" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-black/40 mb-1.5 uppercase tracking-widest">Email</label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="la-tua@email.com"
            className="input-base"
          />
          {errors.email && <p className="text-xs text-black/50 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-[11px] font-medium text-black/40 uppercase tracking-widest">Password</label>
            <a href="/forgot-password" className="text-[11px] text-black/35 hover:text-black transition-colors">Dimenticata?</a>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="input-base pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-black/50 mt-1">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 mt-1"
        >
          {loading ? "Accedendo..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
