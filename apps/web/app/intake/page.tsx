import { IntakeForm } from "../../components/intake-form";
import { AppHeader } from "../../components/app-header";
import { getRequestMessages } from "../../lib/i18n-server";

export default async function IntakePage() {
  const copy = (await getRequestMessages()).intake;
  return (
    <main className="shell">
      <AppHeader />
      <div className="intake-layout">
        <section className="hero">
          <div className="eyebrow">{copy.eyebrow}</div><h1>{copy.title}</h1><p className="lede">{copy.lede}</p>
          <p className="trust-line">{copy.trust} <span>•</span> {copy.rules}</p>
          <div className="use-case-row" aria-label={copy.useCases}>
            <span data-live="true">{copy.followup}</span><span>{copy.appointments}</span><span>{copy.documents}</span>
          </div>
          <div className="after-approval">
            <strong>{copy.after}</strong>
            <ol>
              <li><span>1</span><p><b>{copy.contactTitle}</b> {copy.contactText}</p></li>
              <li><span>2</span><p><b>{copy.openTitle}</b> {copy.openText}</p></li>
              <li><span>3</span><p><b>{copy.returnTitle}</b> {copy.returnText}</p></li>
            </ol>
            <p className="channel-disclosure"><b>{copy.demoTitle}</b> {copy.demoText}</p>
          </div>
        </section>
        <IntakeForm />
      </div>
      <div className="proof-strip" role="list" aria-label={copy.principles}>
        <div role="listitem"><span>01</span><strong>{copy.geminiTitle}</strong><p>{copy.geminiText}</p></div>
        <div role="listitem"><span>02</span><strong>{copy.boundariesTitle}</strong><p>{copy.boundariesText}</p></div>
        <div role="listitem"><span>03</span><strong>{copy.proofTitle}</strong><p>{copy.proofText}</p></div>
      </div>
    </main>
  );
}
