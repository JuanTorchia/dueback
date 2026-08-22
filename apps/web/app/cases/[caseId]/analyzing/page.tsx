import { AnalysisProgress } from "../../../../components/analysis-progress";
import { AppHeader } from "../../../../components/app-header";
import { getRequestMessages } from "../../../../lib/i18n-server";

export default async function AnalyzingPage({
  params
}: {
  readonly params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const copy = (await getRequestMessages()).steps;
  return <main className="shell">
    <AppHeader />
    <section className="hero compact">
      <div className="eyebrow">{copy.analysisEye}</div><h1>{copy.analysisTitle}</h1><p className="lede">{copy.analysisText}</p>
    </section>
    <AnalysisProgress caseId={caseId} />
  </main>;
}
