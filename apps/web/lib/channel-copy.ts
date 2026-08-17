export type ActiveCaseChannel = "MANAGED_EMAIL" | "CONTROLLED_SANDBOX";

export function activeCaseChannel(value: string | undefined): ActiveCaseChannel {
  return value === "MANAGED_EMAIL" ? "MANAGED_EMAIL" : "CONTROLLED_SANDBOX";
}

export function channelCopy(channel: ActiveCaseChannel) {
  if (channel === "MANAGED_EMAIL") {
    return {
      disclosure:
        "Controlled email pilot — DueBack contacts only the company mailbox you reviewed and approved.",
      contact: "Managed company email",
      reply: "Authenticated email reply",
      actionTitle: "Follow-up accepted by the email provider",
      actionSummary: "One authorized follow-up crossed the managed email boundary.",
      evidenceTitle: "Company reply checked",
      acceptedEvidence:
        "Accepted: authenticated reply evidence matched this case and its approved evidence contract."
    } as const;
  }
  return {
    disclosure:
      "Controlled hackathon demo — Merchant Sandbox is not a real merchant; callback timing is accelerated.",
    contact: "Controlled merchant adapter",
    reply: "Signed sandbox callback",
    actionTitle: "Follow-up accepted by demo merchant",
    actionSummary: "One authorized follow-up crossed the demo HTTP boundary.",
    evidenceTitle: "Sandbox evidence checked",
    acceptedEvidence:
      "Accepted: signed sandbox evidence matched this case and its approved evidence contract."
  } as const;
}
