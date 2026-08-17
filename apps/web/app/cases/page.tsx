import { AppHeader } from "../../components/app-header";
import { CaseInbox } from "../../components/case-inbox";

export default function CasesPage() {
  return <main className="shell"><AppHeader />
    <section className="hero compact"><div className="eyebrow">My follow-ups</div><h1>Only come back when it matters.</h1><p className="lede">See what DueBack is handling, what needs one decision, and what has enough proof.</p></section>
    <CaseInbox />
  </main>;
}
