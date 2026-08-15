export interface TraceContext {
  readonly runId: string;
  readonly caseId: string;
  readonly correlationId: string;
  readonly actionId?: string;
}

export interface SafeEvent extends TraceContext {
  readonly event: string;
  readonly outcome: "STARTED" | "SUCCEEDED" | "REJECTED" | "FAILED";
  readonly reasonCode?: string;
  readonly durationMs?: number;
  readonly attempt?: number;
}

const forbiddenKeys = new Set([
  "artifact",
  "artifactContent",
  "body",
  "document",
  "email",
  "excerpt",
  "name",
  "prompt",
  "raw",
  "sourceContent"
]);

export function safeEvent(event: SafeEvent): Readonly<Record<string, string | number>> {
  const serialized = Object.fromEntries(
    Object.entries(event).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number>;
  return Object.freeze(serialized);
}

export function redactUnknownFields(
  input: Readonly<Record<string, unknown>>
): Readonly<Record<string, string | number | boolean>> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(input)) {
    if (forbiddenKeys.has(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    }
  }
  return Object.freeze(safe);
}
