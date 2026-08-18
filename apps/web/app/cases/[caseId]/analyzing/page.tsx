import { AnalysisProgress } from "../../../../components/analysis-progress";
import { AppHeader } from "../../../../components/app-header";

export default async function AnalyzingPage({
  params
}: {
  readonly params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <main className="shell">
    <AppHeader />
    <section className="hero compact">
      <div className="eyebrow">Step 1 · Evidence analysis</div>
      <h1>Your promise is safely in motion.</h1>
      <p className="lede">Gemini extracts candidates; deterministic rules check what needs your review.</p>
    </section>
    <AnalysisProgress caseId={caseId} />
  </main>;
}
