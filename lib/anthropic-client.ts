/**
 * Server-only. Do not import from client code. ANTHROPIC_API_KEY must stay on the server.
 */
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AnthropicApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnthropicApiError";
  }
}

const conversationParams = (messages: { role: "user" | "assistant"; content: string }[], systemPrompt: string) => ({
  model: "claude-sonnet-4-6" as const,
  max_tokens: 1000,
  cache_control: { type: "ephemeral" as const },
  system: systemPrompt,
  messages: messages.map((m) => ({ role: m.role, content: m.content })),
});

/**
 * Main conversation turn. Uses claude-sonnet-4-6 with prompt caching.
 */
export async function conversationCall(
  messages: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create(conversationParams(messages, systemPrompt));

    for (const block of response.content) {
      if (block.type === "text") {
        return block.text;
      }
    }
    throw new AnthropicApiError("No text block in response");
  } catch (err) {
    if (err instanceof AnthropicApiError) throw err;
    const message =
      err instanceof Error ? err.message : "Anthropic API request failed";
    throw new AnthropicApiError(message);
  }
}

/**
 * Streaming conversation. Returns a MessageStream; use .on('text', ...) and .finalText().
 */
export function conversationStream(
  messages: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string
) {
  return anthropic.messages.stream(conversationParams(messages, systemPrompt));
}

/**
 * Fast classification (slot detection, path routing). Uses claude-haiku-4-5-20251001.
 */
export async function classifyCall(
  content: string,
  instruction: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: instruction,
      messages: [{ role: "user", content }],
    });

    for (const block of response.content) {
      if (block.type === "text") {
        return block.text.trim();
      }
    }
    throw new AnthropicApiError("No text block in response");
  } catch (err) {
    if (err instanceof AnthropicApiError) throw err;
    const message =
      err instanceof Error ? err.message : "Anthropic API request failed";
    throw new AnthropicApiError(message);
  }
}
