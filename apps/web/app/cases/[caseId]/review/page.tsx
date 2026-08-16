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
        <div className="eyebrow">Step 2 · Nothing happens without you</div>
        <h1>Review what DueBack understood.</h1>
        <p className="lede">Correct anything that looks wrong, then choose exactly what the agent may do.</p>
      </section>
      <PlanReview
        caseId={caseId}
        contactMode={process.env.COMPANY_CONTACT_MODE === "email" ? "email" : "sandbox"}
      />
    </main>
  );
}
