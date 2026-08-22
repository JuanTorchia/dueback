import { CaseResult } from "../../../../components/case-result";
import { CaseResultPreview } from "../../../../components/case-result-preview";
import { AppHeader } from "../../../../components/app-header";
import { getRequestMessages } from "../../../../lib/i18n-server";

export default async function ResultPage({
  params
}: {
  readonly params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const copy = (await getRequestMessages()).steps;
  return (
    <main className="shell">
      <AppHeader />
      <section className="hero compact">
        <div className="eyebrow">{copy.resultEye}</div><h1>{copy.resultTitle}</h1><p className="lede">{copy.resultText}</p>
      </section>
      {caseId === "demo-verified" && process.env.NODE_ENV === "development" ? (
        <CaseResultPreview />
      ) : (
        <CaseResult caseId={caseId} />
      )}
    </main>
  );
}
