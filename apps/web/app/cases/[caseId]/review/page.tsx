import { PlanReview } from "../../../../components/plan-review";
import { AppHeader } from "../../../../components/app-header";
import { getRequestMessages } from "../../../../lib/i18n-server";

export default async function ReviewPage({
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
        <div className="eyebrow">{copy.reviewEye}</div><h1>{copy.reviewTitle}</h1><p className="lede">{copy.reviewText}</p>
      </section>
      <PlanReview
        caseId={caseId}
        contactMode={process.env.COMPANY_CONTACT_MODE === "email" ? "email" : "sandbox"}
      />
    </main>
  );
}
