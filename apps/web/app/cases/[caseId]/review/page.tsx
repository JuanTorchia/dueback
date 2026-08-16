import { PlanReview } from "../../../../components/plan-review";
import { AppHeader } from "../../../../components/app-header";

export default async function ReviewPage({
  params
}: {
  readonly params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <main className="shell">
      <AppHeader />
      <section className="hero compact">
        <div className="eyebrow">Review before anything happens</div>
        <h1>Confirm the plan.</h1>
      </section>
      <PlanReview caseId={caseId} />
    </main>
  );
}
