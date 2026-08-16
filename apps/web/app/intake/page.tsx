import { IntakeForm } from "../../components/intake-form";
import { AppHeader } from "../../components/app-header";

export default function IntakePage() {
  return (
    <main className="shell">
      <AppHeader />
      <div className="intake-layout">
        <section className="hero">
          <div className="eyebrow">A safe follow-through agent</div>
          <h1>Hand off the follow-up. Keep control.</h1>
          <p className="lede">
            Share what a company promised. DueBack follows up within limits you approve and keeps
            the case open until the evidence is actually strong enough.
          </p>
          <p className="trust-line">No inbox access <span>•</span> Nothing sent before approval</p>
        </section>
        <IntakeForm />
      </div>
      <div className="proof-strip" role="list" aria-label="DueBack principles">
        <div role="listitem"><span>01</span><strong>Gemini understands the promise</strong><p>Emails, screenshots, PDFs, and pasted messages.</p></div>
        <div role="listitem"><span>02</span><strong>You set every boundary</strong><p>Review the action, recipient, data, and proof first.</p></div>
        <div role="listitem"><span>03</span><strong>Rules decide what counts</strong><p>A receipt is not a resolution. Evidence must match.</p></div>
      </div>
    </main>
  );
}
