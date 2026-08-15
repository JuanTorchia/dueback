import { PlanReview } from "../../../../components/plan-review";

export default async function ReviewPage({
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
        <div className="eyebrow">Review before anything happens</div>
        <h1>Your resolution plan.</h1>
      </section>
      <PlanReview caseId={caseId} />
    </main>
  );
}
