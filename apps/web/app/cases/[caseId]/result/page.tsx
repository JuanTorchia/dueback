import { CaseResult } from "../../../../components/case-result";
import { CaseResultPreview } from "../../../../components/case-result-preview";

export default async function ResultPage({
  params
}: {
  readonly params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <main className="shell">
      <div className="brand">
        <span className="brand-mark">✓</span> DueBack
      </div>
      <section className="hero compact">
        <div className="eyebrow">You can close this tab</div>
        <h1>DueBack keeps watch.</h1>
      </section>
      {caseId === "demo-verified" && process.env.NODE_ENV === "development" ? (
        <CaseResultPreview />
      ) : (
        <CaseResult caseId={caseId} />
      )}
    </main>
  );
}
