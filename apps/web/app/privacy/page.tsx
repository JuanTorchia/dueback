export default function PrivacyPage() {
  return (
    <main>
      <section className="hero compact">
        <p className="eyebrow">DueBack privacy</p>
        <h1>Only the promise you choose to share.</h1>
        <p className="lede">
          DueBack does not read your inbox. Uploaded bytes are processed transiently and are not
          stored after extraction. The structured case remains while active and is scheduled for
          deletion after completion or expiry. You can delete an activated case from its controls.
        </p>
      </section>
      <section className="card boundaries">
        <div><strong>Before activation</strong><p>Nothing is sent to a company.</p></div>
        <div><strong>When activated</strong><p>Only the reference, amount, and currency listed in the approved plan are shared.</p></div>
        <div><strong>Logs</strong><p>Operational records use identifiers and hashes, not uploaded files or full promise text.</p></div>
        <div><strong>Demo limitation</strong><p>The merchant is a controlled sandbox, not a real company. Merchant confirmation is not bank settlement.</p></div>
      </section>
    </main>
  );
}
