import { CaseResult } from "../../../../components/case-result";
import { CaseResultPreview } from "../../../../components/case-result-preview";
import { AppHeader } from "../../../../components/app-header";

export default async function ResultPage({
  params
}: {
  readonly params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <main className="shell">
      <AppHeader />
      <section className="hero compact">
        <div className="eyebrow">Step 3 · Follow-through</div>
        <h1>DueBack is handling the chase.</h1>
        <p className="lede">This page updates as the counterparty responds and the evidence is checked.</p>
      </section>
      {caseId === "demo-verified" && process.env.NODE_ENV === "development" ? (
        <CaseResultPreview />
      ) : (
        <CaseResult caseId={caseId} />
      )}
    </main>
  );
}
