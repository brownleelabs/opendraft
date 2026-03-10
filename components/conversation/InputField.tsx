"use client";

import { Send } from "lucide-react";
import { useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const DEFAULT_PLACEHOLDER = "Describe the change you want to see.";

interface InputFieldProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  /** When true, submit button shows opacity-60 and cursor-not-allowed. */
  isSubmitting?: boolean;
  /** When provided (e.g. "Enter your answer here"), shown as placeholder. */
  placeholder?: string;
  /** Label above the input; "Your idea" by default, "Your answer" in Q&A flow. */
  label?: string;
}

/**
 * Input for draft conversation. shadcn Textarea, forest green label and border.
 * Idle: placeholder "Describe the change you want to see." or current question. Active: border brightens.
 * Send button (navy) disabled when empty; fires onSubmit on tap or Enter, then clears.
 */
export function InputField({
  onSubmit,
  disabled = false,
  isSubmitting = false,
  placeholder = DEFAULT_PLACEHOLDER,
  label = "Your idea",
}: InputFieldProps) {
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
    <div className="flex w-full flex-col gap-2 rounded-[2px] border-2 border-transparent px-4 py-3 transition-[border-color,box-shadow] duration-200 focus-within:border-[#2D5016] focus-within:shadow-[0_0_0_2px_rgba(45,80,22,0.2)]">
      <label
        htmlFor="draft-input"
        className="text-sm font-medium text-[#2D5016]"
      >
        {label}
      </label>
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <Textarea
          id="draft-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-16 flex-1 rounded-[2px] border-[#2D5016] placeholder:text-[#2D5016]/60 focus-visible:border-[#2D5016] focus-visible:ring-0 focus-visible:outline-none",
            isActive && "border-[#2D5016]"
          )}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty || disabled}
          className={cn(
            "flex h-12 shrink-0 items-center justify-center gap-2 rounded-[2px] bg-[#1B2A4A] px-4 text-white transition-transform duration-150 hover:enabled:scale-105 active:enabled:scale-[0.98] disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]",
            isSubmitting && "opacity-60"
          )}
          aria-label="Send"
        >
          <Send className="size-5" />
        </button>
      </div>
    </div>
  );
}
