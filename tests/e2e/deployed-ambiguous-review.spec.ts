import { expect, test, type Page } from "@playwright/test";

const deployedUrl = process.env.DUEBACK_DEPLOYED_URL;

async function confirmIfShown(
  page: Page,
  label: string,
  value: string,
  buttonName: string
): Promise<void> {
  const input = page.getByRole("textbox", { name: label });
  if (await input.isVisible()) {
    await input.fill(value);
    await page.getByRole("button", { name: buttonName }).click();
    await expect(input).not.toBeVisible({ timeout: 15_000 });
  }
}

test.describe("deployed ambiguous promise review", () => {
  test.skip(!deployedUrl, "Set DUEBACK_DEPLOYED_URL to run against the public Cloud Run service");

  test("shows uncertainty and makes every blocker recoverable without developer tools", async ({
    page
  }) => {
    await page.goto(`${deployedUrl}/privacy`);
    await expect(page.getByRole("heading", { name: "Only the promise you choose to share." })).toBeVisible();

    await page.goto(`${deployedUrl}/intake`);
    await expect(page.getByTestId("intake-form")).toHaveAttribute("data-hydrated", "true", {
      timeout: 15_000
    });
    await page
      .getByRole("textbox", { name: "What happened, and what are you waiting for?" })
      .fill(
        "Northstar Store will refund USD 79 for ORDER-79. A later paragraph says the approved amount is USD 59. Case REF-1001."
      );
    await page.getByRole("button", { name: "Build my plan" }).click();
    await expect(page).toHaveURL(/\/cases\/case_[^/]+\/review/, { timeout: 45_000 });
    await expect(page.getByText(/Conflicting information|Needs confirmation/).first()).toBeVisible();

    await confirmIfShown(page, "Company name", "Northstar Store", "Confirm company");
    await confirmIfShown(page, "Promised result", "refund", "Confirm result");
    await confirmIfShown(page, "Correct amount", "59.00", "Save new version");
    await confirmIfShown(page, "Currency", "USD", "Confirm currency");
    await confirmIfShown(page, "Order or case reference", "ORDER-79", "Confirm reference");

    const due = page.getByLabel("Follow-up date");
    if (await due.isVisible()) {
      await due.fill("2026-08-15T12:00");
      await page.getByRole("button", { name: "Confirm follow-up date" }).click();
      await expect(due).not.toBeVisible({ timeout: 15_000 });
    }

    const activate = page.getByRole("button", { name: "Approve and start follow-up" });
    await expect(activate).toBeEnabled();
    await activate.click();
    await expect(page).toHaveURL(/\/result/);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Merchant confirmed the refund instruction" })).toBeVisible({
      timeout: 45_000
    });
  });
});
