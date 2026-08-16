import { billCreditFixture, replacementFixture } from "./promise-manifests";

export const portabilityEvaluationCases = [
  {
    id: "PORT-BILL-01",
    promiseType: "BILL_CREDIT",
    plan: billCreditFixture.plan,
    evidence: billCreditFixture.acceptedEvidence,
    expected: { accepted: true, terminalState: "DONE", externalActionMaximum: 1 }
  },
  {
    id: "PORT-REPLACE-01",
    promiseType: "REPLACEMENT",
    plan: replacementFixture.plan,
    evidence: replacementFixture.acceptedEvidence,
    expected: { accepted: true, terminalState: "DONE", externalActionMaximum: 1 }
  }
] as const;
