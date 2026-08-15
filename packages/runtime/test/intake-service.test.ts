import { describe, expect, it } from "vitest";
import type { PromiseDraft } from "@dueback/contracts";
import { IntakeService } from "../src/intake-service";
import type { DraftCase, IntakeStore, PromiseExtractor } from "../src/intake-service";

const hash = `sha256:${"a".repeat(64)}`;

function promiseDraft(uncertainty: "NONE" | "CONTRADICTORY" = "NONE"): PromiseDraft {
  const provenance = [
    {
      artifactId: "artifact_12345678",
      locator: "text:0-100",
      excerptHash: hash,
      confidence: "HIGH" as const
    }
  ];
  return {
    promisor: { value: "Northstar", provenance, uncertainty: "NONE" },
    result: { value: "USD 79 refund", provenance, uncertainty: "NONE" },
    amountMinor: { value: 7900, provenance, uncertainty },
    currency: { value: "USD", provenance, uncertainty: "NONE" },
    transactionRef: { value: "ORDER-79", provenance, uncertainty: "NONE" },
    dueAt: { value: "2026-08-20T00:00:00.000Z", provenance, uncertainty: "NONE" },
    proposedEvidenceLevel: "MERCHANT_CONFIRMED"
  };
}

class MemoryIntakeStore implements IntakeStore {
  private readonly cases = new Map<string, DraftCase>();

  findByDedupeKey(ownerId: string, dedupeKey: string): Promise<DraftCase | undefined> {
    return Promise.resolve(
      [...this.cases.values()].find(
        (draft) => draft.ownerId === ownerId && draft.dedupeKey === dedupeKey
      )
    );
  }

  createDraft(draft: DraftCase): Promise<void> {
    this.cases.set(draft.caseId, draft);
    return Promise.resolve();
  }
}

describe("IntakeService", () => {
  it("creates one versioned plan and returns the same case for duplicate intake", async () => {
    const extractor: PromiseExtractor = { extract: () => Promise.resolve(promiseDraft()) };
    const service = new IntakeService(
      new MemoryIntakeStore(),
      extractor,
      "merchant@controlled.test"
    );
    const artifact = {
      artifactId: "artifact_12345678",
      ownerId: "person_12345678",
      sourceChannel: "upload" as const,
      sha256: "abc",
      content: "promise"
    };
    const first = await service.intake(artifact, "2026-08-15T12:00:00.000Z");
    const duplicate = await service.intake(artifact, "2026-08-15T12:01:00.000Z");
    expect(first.duplicate).toBe(false);
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.draft.caseId).toBe(first.draft.caseId);
    expect(first.draft.plan.evidenceRequirements[0]?.minimumLevel).toBe("MERCHANT_CONFIRMED");
  });

  it("blocks activation when a critical amount is contradictory", async () => {
    const extractor: PromiseExtractor = {
      extract: () => Promise.resolve(promiseDraft("CONTRADICTORY"))
    };
    const service = new IntakeService(
      new MemoryIntakeStore(),
      extractor,
      "merchant@controlled.test"
    );
    const result = await service.intake(
      {
        artifactId: "artifact_12345678",
        ownerId: "person_12345678",
        sourceChannel: "paste",
        sha256: "different",
        content: "contradictory promise"
      },
      "2026-08-15T12:00:00.000Z"
    );
    expect(result.draft.activationBlocked).toBe(true);
    expect(result.draft.blockingFields).toContain("amountMinor");
  });
});
