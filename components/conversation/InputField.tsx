"use client";

import { Send } from "lucide-react";
import { useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

/**
 * Input for draft conversation. shadcn Textarea, forest green label and border.
 * Idle: placeholder "Describe the change you want to see." Active: border brightens.
 * Send button (navy) disabled when empty; fires onSubmit on tap or Enter, then clears.
 */
export function InputField({ onSubmit, disabled = false }: InputFieldProps) {
  const [value, setValue] = useState("");
  const isEmpty = value.trim() === "";
  const isActive = value.length > 0;

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed === "" || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }, [value, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex w-full flex-col gap-2 px-4 py-3">
      <label
        htmlFor="draft-input"
        className="text-sm font-medium text-[#2D5016]"
      >
        Your idea
      </label>
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <Textarea
          id="draft-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the change you want to see."
          disabled={disabled}
          className={cn(
            "min-h-16 flex-1 border-[#2D5016] placeholder:text-[#2D5016]/60 focus-visible:border-[#3a6b1c] focus-visible:ring-[#2D5016]/20",
            isActive && "border-[#3a6b1c]"
          )}
          aria-label="Describe the change you want to see"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty || disabled}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1B2A4A] px-4 text-white transition-opacity hover:enabled:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="size-5" />
        </button>
      </div>
    </div>
  );
}
