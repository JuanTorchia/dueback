import { CaseException } from "../../../../components/case-exception";

export default async function ExceptionPage({
  params
}: {
  readonly params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <main className="shell">
      <div className="brand">
        <span className="brand-mark">!</span> DueBack
      </div>
      <section className="hero compact">
        <div className="eyebrow">Only when your judgment matters</div>
        <h1>DueBack needs one decision.</h1>
      </section>
      <CaseException caseId={caseId} />
    </main>
  );
}
