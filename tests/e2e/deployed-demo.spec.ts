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
      page.getByRole("heading", { name: "Promises should not become your job." })
    ).toBeVisible();
    await expect(page.getByTestId("intake-form")).toHaveAttribute("data-hydrated", "true");
    await page
      .getByRole("textbox", { name: "What did the company promise?" })
      .fill(
        `On August 1, 2026 Northstar Store confirmed it would refund USD 19.00 for order ${reference} by August 15, 2026. The refund is still missing.`
      );
    await page.getByRole("button", { name: "Build my resolution plan" }).click();
    await expect(page).toHaveURL(/\/cases\/case_[^/]+\/review/, { timeout: 35_000 });
    await expect(page.getByText("DueBack will never")).toBeVisible();
    await expect(page.getByText("MERCHANT_CONFIRMED", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Approve and activate" }).click();
    await expect(page).toHaveURL(/\/result/);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Merchant-confirmed refund" })).toBeVisible({
      timeout: 45_000
    });
    await expect(page.getByText(/does not mean bank settlement/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Auditable timeline" })).toBeVisible();
  });
});
