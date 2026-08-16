const messages: Readonly<Record<string, string>> = {
  AUTHENTICATION_REQUIRED: "We could not start your private session. Please try again.",
  CASE_OWNERSHIP_REQUIRED: "Your private session is still loading. Please retry this page.",
  DAILY_CASE_BUDGET_EXHAUSTED: "This demo has reached today's case limit for this session.",
  MODEL_CALL_BUDGET_EXHAUSTED: "This case reached its model-call limit. Start a new case or try tomorrow.",
  CRITICAL_FIELDS_UNRESOLVED: "Confirm every highlighted field before activation.",
  PLAN_REQUEST_FAILED: "We could not load this plan. Please retry.",
  REQUEST_FAILED: "DueBack could not complete that request. Please try again."
};

export function errorCopy(code: string): string {
  return messages[code] ?? "DueBack could not complete that request. Please try again.";
}
