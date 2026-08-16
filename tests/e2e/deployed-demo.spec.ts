import { expect, test } from "@playwright/test";

const deployedUrl = process.env.DUEBACK_DEPLOYED_URL;

test.describe("deployed mobile judge path", () => {
  test.skip(!deployedUrl, "Set DUEBACK_DEPLOYED_URL to run against the public Cloud Run service");

  test("captures, approves, leaves the page, and returns only on sufficient proof", async ({
    page
  }) => {
    const reference = `DEMO-${String(Date.now())}`;
    await page.goto(`${deployedUrl}/intake`);
    await expect(
      page.getByRole("heading", { name: "Say what needs to happen. DueBack keeps it moving." })
    ).toBeVisible();
    await expect(page.getByTestId("intake-form")).toHaveAttribute("data-hydrated", "true", {
      timeout: 15_000
    });
    await page
      .getByRole("textbox", { name: "What happened, and what are you waiting for?" })
      .fill(
        `On August 1, 2026 Northstar Store confirmed it would refund USD 19.00 for order ${reference} by August 15, 2026. The refund is still missing.`
      );
    await page.getByRole("button", { name: "Build my plan" }).click();
    await expect(page).toHaveURL(/\/cases\/case_[^/]+\/review/, { timeout: 35_000 });
    await expect(page.getByText("DueBack will never")).toBeVisible();
    await expect(page.getByText("How DueBack contacts them")).toBeVisible();
    await expect(page.getByText("The first follow-up")).toBeVisible();
    await expect(page.getByText(`Follow-up for ${reference}`)).toBeVisible();
    await expect(page.getByText("Demo API")).toBeVisible();
    await expect(page.getByText("Web form")).toBeVisible();
    await expect(page.getByText("WhatsApp")).toBeVisible();
    await expect(page.getByText("Controlled HTTP merchant adapter in this public demo.")).toBeVisible();
    await expect(page.getByText("3 · How the result comes back to you")).toBeVisible();
    await expect(
      page.getByText(
        "Signed evidence from the responsible party confirming the exact outcome and reference."
      )
    ).toBeVisible();
    await page.getByRole("button", { name: "Approve and start follow-up" }).click();
    await expect(page).toHaveURL(/\/result/);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Merchant confirmed the refund instruction" })).toBeVisible({
      timeout: 45_000
    });
    await expect(page.getByText(/Bank settlement: NOT VERIFIED/)).toBeVisible();
    await expect(page.getByText("This page, automatically")).toBeVisible();
    await expect(page.getByText("Your case update is ready")).toBeVisible();
    await expect(page.getByText(/callback timing is accelerated/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "What happened" })).toBeVisible();
    for (const details of await page.getByText("Technical details", { exact: true }).all()) {
      await details.click();
    }
    await expect(page.getByText(/reason: CURRENT_PLAN_VERSION_APPROVED/)).toBeVisible();
    await expect(page.getByText(/reason: ACTION_ACCEPTED/)).toBeVisible();
    await expect(page.getByText(/^correlation: corr_/).first()).toBeVisible();
  });
});
