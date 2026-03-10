"use server";

import { getSessionEvents } from "@/lib/analytics";
import type { SessionEvent } from "@/types/analytics";

export async function fetchSessionEvents(
  sessionId: string
): Promise<SessionEvent[]> {
  return getSessionEvents(sessionId);
}
