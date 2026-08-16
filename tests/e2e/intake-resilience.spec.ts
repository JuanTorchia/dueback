import { expect, test } from "@playwright/test";

const deployedUrl = process.env.DUEBACK_DEPLOYED_URL;

test.describe("intake feedback and recovery", () => {
  test.skip(!deployedUrl, "Set DUEBACK_DEPLOYED_URL to run against the public Cloud Run service");

  test("shows honest progress during a slow analysis and preserves input after failure", async ({
    page
  }) => {
    await page.route("**/api/intake", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_200));
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "REQUEST_FAILED" })
      });
    });
    await page.goto(`${deployedUrl}/intake`);
    const source = page.getByRole("textbox", {
      name: "Paste the promise or add helpful context"
    });
    const promise = "Northstar promised a USD 59 refund for ORDER-LATENCY.";
    await source.fill(promise);
    await page.getByRole("button", { name: "Create my follow-up plan" }).click();

    await expect(page.getByText("Gemini is reading your evidence")).toBeVisible();
    await expect(page.getByText(/usually 10–25 seconds/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Building your plan…" })).toBeDisabled();
    await expect(page.locator("p.error[role='alert']")).toContainText("could not complete");
    await expect(source).toHaveValue(promise);
    await expect(page.getByRole("button", { name: "Create my follow-up plan" })).toBeEnabled();
  });

  test("accepts a file and context as one combined source", async ({ page }) => {
    await page.goto(`${deployedUrl}/intake`);
    await page
      .getByRole("textbox", { name: "Paste the promise or add helpful context" })
      .fill("The correct amount is USD 59.");
    await page.getByLabel(/Drop or choose a screenshot/).setInputFiles({
      name: "merchant-promise.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64"
      )
    });
    await expect(page.getByText("Text and file will be analyzed together")).toBeVisible();
    await expect(page.getByText("merchant-promise.png")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create my follow-up plan" })).toBeEnabled();
  });
});
