import fs from "fs";
import path from "path";

let cachedPrompt: string | null = null;

/**
 * Returns the OpenDraft system prompt. Reads from disk once per server process, then cached.
 */
export function getSystemPrompt(): string {
  if (!cachedPrompt) {
    cachedPrompt = fs.readFileSync(
      path.join(process.cwd(), "opendraft-system-prompt-v1.md"),
      "utf-8"
    );
  }
  return cachedPrompt;
}
