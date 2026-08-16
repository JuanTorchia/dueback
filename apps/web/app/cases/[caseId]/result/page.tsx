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
