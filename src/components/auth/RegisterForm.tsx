"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { PasswordInput } from "./PasswordInput";

const TEXT_FIELDS = [
  { name: "display_name" as const, label: "Nome",     type: "text",  placeholder: "Il tuo nome",      autocomplete: "name"     },
  { name: "username"     as const, label: "Username", type: "text",  placeholder: "mario_rossi",      autocomplete: "username" },
  { name: "email"        as const, label: "Email",    type: "email", placeholder: "email@dominio.it", autocomplete: "email"    },
];

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const passwordValue = watch("password", "");

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: { username: data.username, display_name: data.display_name },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message.includes("already") ? "Email già registrata" : error.message); return; }
    router.push("/verify-email");
  }

  return (
    <div className="space-y-5">
      <SocialAuthButtons mode="signup" />

      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-black/8" />
        <span className="text-[11px] font-medium text-black/30 uppercase tracking-widest">oppure</span>
        <span className="flex-1 h-px bg-black/8" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {TEXT_FIELDS.map(({ name, label, type, placeholder, autocomplete }) => (
          <div key={name}>
            <label className="block text-[11px] font-medium text-black/40 mb-1.5 uppercase tracking-widest">{label}</label>
            <input
              {...register(name)}
              type={type}
              autoComplete={autocomplete}
              placeholder={placeholder}
              className="input-base"
            />
            {errors[name] && <p className="text-xs text-black/50 mt-1">{errors[name]?.message}</p>}
          </div>
        ))}

        <div>
          <label className="block text-[11px] font-medium text-black/40 mb-1.5 uppercase tracking-widest">Password</label>
          <PasswordInput
            registration={register("password") as never}
            value={passwordValue}
            autoComplete="new-password"
            showRules
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 mt-1"
        >
          {loading ? "Registrando..." : "Crea account"}
        </button>
      </form>
    </div>
  );
}
