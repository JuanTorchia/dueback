import { describe, expect, it } from "vitest";
import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import { caseSummary, handleCases } from "../lib/cases-controller";

function item(state: FollowThroughCase["state"], ownerId = "owner_12345678") {
  return {
    caseId: `case_${state.toLowerCase()}_12345678`, ownerId, state, dueAt: "2026-08-17T12:00:00.000Z",
    plan: { allowedRecipient: "support@example.com", channelType: "MANAGED_EMAIL",
      evidenceRequirements: [{ subject: "USD 59 refund", transactionRef: "R-59" }] }
  } as unknown as FollowThroughCase;
}

describe("owner case inbox", () => {
  it("maps lifecycle states to three human buckets", () => {
    expect(caseSummary(item("NEEDS_ATTENTION"))).toMatchObject({ bucket: "NEEDS_YOU", attentionRequired: true });
    expect(caseSummary(item("WAITING_EXTERNAL"))).toMatchObject({ bucket: "WORKING", statusLabel: "Waiting for the company" });
    expect(caseSummary(item("DONE"))).toMatchObject({ bucket: "DONE", nextStepLabel: "Review the proof and limitation" });
  });

  it("queries only the authenticated owner and bounds the response", async () => {
    let queriedOwner = "";
    const response = await handleCases(new Request("https://dueback.test/api/cases?limit=1"), {
      authenticate: () => Promise.resolve({ uid: "owner_12345678" }),
      store: { listByOwner: (ownerId) => { queriedOwner = ownerId; return Promise.resolve([item("DONE"), item("NEEDS_ATTENTION")]); } }
    });
    expect(queriedOwner).toBe("owner_12345678");
    await expect(response.json()).resolves.toMatchObject({ items: [{ caseId: "case_done_12345678" }] });
  });
});
