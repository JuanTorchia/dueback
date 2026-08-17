import { expect, test } from "@playwright/test";

const deployedUrl = process.env.DUEBACK_DEPLOYED_URL;

test.describe("deployed general commercial promise", () => {
  test.skip(!deployedUrl, "Set DUEBACK_DEPLOYED_URL to run against the public Cloud Run service");

  test("follows through on a document promise without inventing money", async ({ page }) => {
    await page.goto(`${deployedUrl}/intake`);
    await expect(page.getByTestId("intake-form")).toHaveAttribute("data-hydrated", "true", {
      timeout: 15_000
    });
    await page.getByRole("textbox", {
      name: "What happened, and what are you waiting for?"
    }).fill(
      "Northstar Insurance promised to email the coverage certificate for case CASE-441 by August 16, 2026."
    );
    await page.getByRole("button", { name: "Build my plan" }).click();
    await expect(page).toHaveURL(/\/cases\/case_[^/]+\/review/, { timeout: 45_000 });
    await expect(page.getByText("Not applicable", { exact: true })).toBeVisible();
    await page.getByText("Exactly what data will be shared", { exact: true }).click();
    await expect(page.getByText(/Case reference and the promised outcome/)).toBeVisible();

    await page.getByRole("checkbox", { name: /authorized to contact/ }).check();
    await page.getByRole("button", { name: "Approve and start follow-up" }).click();
    await expect(page).toHaveURL(/\/result/);
    await expect(page.getByRole("heading", {
      name: "The company confirmed the promised outcome"
    })).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(/Independent fulfillment is NOT VERIFIED/)).toBeVisible();
  });
});
