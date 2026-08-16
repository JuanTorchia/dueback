import { IntakeForm } from "../../components/intake-form";

export default function IntakePage() {
  return (
    <main className="shell">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">✓</span> DueBack
      </div>
      <section className="hero">
        <div className="eyebrow">Proof of Done</div>
        <h1>Promises should not become your job.</h1>
        <p className="lede">
          Share what a company promised. DueBack keeps it open, follows the limits you approve, and
          only closes when the right evidence arrives.
        </p>
      </section>
      <IntakeForm />
      <div className="proof-strip" role="list" aria-label="DueBack principles">
        <div role="listitem">Gemini reads messy promises</div>
        <div role="listitem">You approve every boundary</div>
        <div role="listitem">Rules—not the model—decide done</div>
      </div>
    </main>
  );
}
