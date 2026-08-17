import { expect, test } from "@playwright/test";

const deployedUrl = process.env.DUEBACK_DEPLOYED_URL;
const liveRecipient = process.env.DUEBACK_LIVE_EMAIL_RECIPIENT;

test.describe("deployed managed email pilot", () => {
  test.skip(
    !deployedUrl || !liveRecipient,
    "Set DUEBACK_DEPLOYED_URL and DUEBACK_LIVE_EMAIL_RECIPIENT to authorize a real controlled send"
  );

  test("sends one approved overdue follow-up through Resend", async ({ page }) => {
    await page.goto(`${deployedUrl}/intake`);
    await page.getByRole("textbox", { name: "What happened, and what are you waiting for?" }).fill(
      "On August 10, 2026, Northstar Test Store promised a USD 1.00 refund for order TEST-RESEND-817. " +
      "The refund was due by August 16, 2026. This is an authorized controlled email test."
    );
    await page.getByRole("button", { name: "Build my plan" }).click();
    await expect(page).toHaveURL(/\/cases\/case_[^/]+\/review/, { timeout: 45_000 });
    await expect(page.getByRole("button", { name: /Managed email Selected/ })).toBeVisible();
    await expect(page.getByText(liveRecipient, { exact: true }).first()).toBeVisible();
    await page.getByRole("checkbox", { name: /authorized to contact/ }).check();
    await page.getByRole("button", { name: "Approve and start follow-up" }).click();
    await expect(page).toHaveURL(/\/cases\/case_[^/]+\/result/);
    await expect(page.getByText(/follow-up|waiting|provider|email/i).first()).toBeVisible({
      timeout: 45_000
    });
  });
});
