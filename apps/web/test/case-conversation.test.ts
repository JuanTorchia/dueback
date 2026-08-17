import { describe, expect, it } from "vitest";
import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import type { EvidenceRecord } from "@dueback/runtime/evidence-service";
import { caseConversation } from "../lib/case-conversation";

const item = { plan: { goal: "USD 59 refund", messageBody: "Please confirm refund R-59." } } as FollowThroughCase;

describe("consumer conversation projection", () => {
  it("explains acknowledgement without inventing missing outcome facts", () => {
    const evidence: EvidenceRecord[] = [{
      candidate: {
        evidenceId: "evidence_ack_1234", caseId: "case_ack_12345678",
        level: "REQUEST_ACKNOWLEDGED", transactionRef: "R-59",
        issuedAt: "2026-08-17T10:01:00.000Z", issuer: "managed-email:test",
        signatureValid: true
      },
      recordedAt: "2026-08-17T10:01:00.000Z",
      correlationId: "corr_ack_12345678",
      verification: { accepted: false, reasonCodes: ["INSUFFICIENT_LEVEL", "WRONG_AMOUNT"] }
    }];
    const entries = caseConversation(item, evidence, [{ acceptedAt: "2026-08-17T10:00:00.000Z", transportStatus: "DELIVERED" }]);
    expect(entries).toHaveLength(2);
    expect(entries[1]).toMatchObject({ status: "NOT_RESOLVED", safeBody: "Reference R-59" });
    expect(entries[1]?.safeBody).not.toContain("59 refund");
    expect(entries[1]?.reason).toContain("Acknowledgement is not proof");
  });
});
