import { CaseException } from "../../../../components/case-exception";
import { AppHeader } from "../../../../components/app-header";

export default async function ExceptionPage({
  params
}: {
  readonly params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <main className="shell">
      <AppHeader />
      <section className="hero compact">
        <div className="eyebrow">Only when your judgment matters</div>
        <h1>DueBack needs one decision.</h1>
      </section>
      <CaseException caseId={caseId} />
    </main>
  );
}
