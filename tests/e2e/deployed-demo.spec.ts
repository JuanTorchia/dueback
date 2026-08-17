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
    await expect(page.getByText("No spending, outcome changes, extra data, or bank-settlement claims.")).toBeVisible();
    await expect(page.getByText("How DueBack contacts them")).toBeVisible();
    await expect(page.getByText("The first follow-up")).toBeVisible();
    await expect(page.getByText(`Follow-up for ${reference}`)).toBeVisible();
    await expect(page.getByText("Demo API")).toBeVisible();
    await expect(page.getByText(/Web forms and WhatsApp are not implied/)).toBeVisible();
    await expect(page.getByText(/Accelerated controlled demo/)).toBeVisible();
    await expect(page.getByText("3 · How the result comes back to you")).toBeVisible();
    await expect(
      page.getByText(
        "Signed evidence from the responsible party confirming the exact outcome and reference."
      )
    ).toBeVisible();
    await page.getByRole("checkbox", { name: /authorized to contact/ }).check();
    await page.getByRole("button", { name: "Approve and start follow-up" }).click();
    await expect(page).toHaveURL(/\/result/);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Merchant confirmed the refund instruction" })).toBeVisible({
      timeout: 45_000
    });
    await expect(page.getByText(/Bank settlement is not verified/i).first()).toBeVisible();
    await expect(page.getByText(/Durable case page/).first()).toBeVisible();
    await page.getByRole("button", { name: "Show technical trace" }).click();
    await expect(page.getByText(/CLOUD_TASK · SUCCEEDED|ACTION · SUCCEEDED/).first()).toBeVisible();
  });
});
