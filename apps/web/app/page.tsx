import { AppHeader } from "../components/app-header";

export default function Home() {
  return (
    <main className="shell landing-shell">
      <AppHeader />
      <section className="landing-hero">
        <div>
          <div className="eyebrow landing-eyebrow">Your follow-through agent</div>
          <h1>Stop chasing companies for what they already promised.</h1>
          <p className="lede">
            DueBack reads the promise, follows up within limits you approve, and keeps the case
            open until the evidence is strong enough.
          </p>
          <div className="landing-actions">
            <a className="landing-primary" href="/intake">Hand off a follow-up <span>→</span></a>
            <a className="landing-secondary" href="#how-it-works">See how it works</a>
          </div>
          <p className="landing-trust">No inbox access · Nothing sent before approval · Stop anytime</p>
        </div>
        <div className="product-preview" aria-label="Example DueBack case">
          <div className="preview-top"><span>Example case</span><strong>Refund · $59</strong></div>
          <div className="preview-company"><span>N</span><div><strong>Northstar Store</strong><p>Order 1842</p></div></div>
          <div className="preview-promise"><small>OUTCOME</small><strong>Receive the promised refund</strong></div>
          <ol className="preview-timeline">
            <li data-done="true"><span>✓</span><div><strong>Promise understood</strong><p>Amount, reference, and deadline extracted</p></div></li>
            <li data-done="true"><span>✓</span><div><strong>Follow-up approved</strong><p>One action, only approved data</p></div></li>
            <li data-rejected="true"><span>×</span><div><strong>“Request received” rejected</strong><p>An acknowledgement is not a resolution</p></div></li>
            <li data-current="true"><span>✓</span><div><strong>Refund confirmed</strong><p>Matching signed evidence received</p></div></li>
          </ol>
          <div className="preview-proof">Proof accepted <span>Case complete</span></div>
        </div>
      </section>

      <section className="value-contrast">
        <p>A reminder gives the work back to you.</p>
        <h2>DueBack does the following up—and knows when the job is actually done.</h2>
      </section>

      <section className="benefit-grid" aria-label="Why use DueBack">
        <article><span>01</span><h3>Give it whatever you have</h3><p>Paste a message, describe the situation, or upload a screenshot, photo, or PDF.</p></article>
        <article><span>02</span><h3>Approve the boundaries</h3><p>See the action, recipient, shared data, limits, and required proof before anything happens.</p></article>
        <article><span>03</span><h3>Get your attention back</h3><p>DueBack keeps working through delays and acknowledgements until verifiable evidence arrives.</p></article>
      </section>

      <section className="how-section" id="how-it-works">
        <div><span className="eyebrow">The difference</span><h2>Not another chatbot. A case that stays open.</h2></div>
        <div className="comparison-card">
          <div><small>REMINDER</small><strong>“Follow up with the store tomorrow.”</strong><p>You still have to remember, write, send, check, and decide.</p></div>
          <div data-dueback="true"><small>DUEBACK</small><strong>“I’ll follow up under these limits.”</strong><p>The agent acts, rejects weak evidence, retries safely, and returns when you are needed.</p></div>
        </div>
      </section>

      <section className="landing-final">
        <span className="eyebrow">Live recipe · company follow-up</span>
        <h2>What are you tired of chasing?</h2>
        <p>Start with a refund, cancellation, replacement, delivery, or promised document.</p>
        <a className="landing-primary" href="/intake">Try the live experience <span>→</span></a>
      </section>
    </main>
  );
}
