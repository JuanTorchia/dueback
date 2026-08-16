import { IntakeForm } from "../../components/intake-form";
import { AppHeader } from "../../components/app-header";

export default function IntakePage() {
  return (
    <main className="shell">
      <AppHeader />
      <div className="intake-layout">
        <section className="hero">
          <div className="eyebrow">Proof-of-done for everyday agents</div>
          <h1>Say what needs to happen. DueBack keeps it moving.</h1>
          <p className="lede">
            Turn unfinished outcomes into an approved plan with boundaries, autonomous follow-up,
            and evidence strong enough to call the work done.
          </p>
          <p className="trust-line">You approve the boundaries <span>•</span> Rules verify the result</p>
          <div className="use-case-row" aria-label="DueBack use cases">
            <span data-live="true">Company follow-up · live</span>
            <span>Appointments · next</span>
            <span>Documents · next</span>
          </div>
        </section>
        <IntakeForm />
      </div>
      <div className="proof-strip" role="list" aria-label="DueBack principles">
        <div role="listitem"><span>01</span><strong>Gemini understands the outcome</strong><p>Messages, screenshots, PDFs, and your own context.</p></div>
        <div role="listitem"><span>02</span><strong>You set every boundary</strong><p>Review the action, recipient, data, and proof first.</p></div>
        <div role="listitem"><span>03</span><strong>Proof decides what counts</strong><p>An acknowledgement is not completion. Evidence must match.</p></div>
      </div>
    </main>
  );
}
