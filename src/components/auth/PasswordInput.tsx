"use client";

import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

const RULES = [
  { label: "Almeno 8 caratteri",       test: (v: string) => v.length >= 8 },
  { label: "Una lettera maiuscola",     test: (v: string) => /[A-Z]/.test(v) },
  { label: "Un numero",                 test: (v: string) => /[0-9]/.test(v) },
  { label: "Un carattere speciale",     test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

interface PasswordInputProps {
  registration: ReturnType<import("react-hook-form").UseFormRegister<never>>;
  value: string;
  autoComplete?: string;
  showRules?: boolean;
}

export function PasswordInput({ registration, value, autoComplete = "new-password", showRules = false }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const showChecklist = showRules && (focused || value.length > 0);
  const allPassed = RULES.every(r => r.test(value));

  return (
    <div>
      <div className="relative">
        <input
          {...registration}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="input-base pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showChecklist && !allPassed && (
        <ul className="mt-2 space-y-1">
          {RULES.map(({ label, test }) => {
            const ok = test(value);
            return (
              <li key={label} className={`flex items-center gap-1.5 text-[11px] transition-colors ${ok ? "text-black/50" : "text-black/30"}`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${ok ? "bg-black" : "bg-black/10"}`}>
                  {ok && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                </span>
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
