import { expect, test } from "@playwright/test";
import { makeDraftCase } from "../helpers/draft-case";
import type { DraftCase } from "../../packages/runtime/src/intake-service";

const deployedUrl = process.env.DUEBACK_DEPLOYED_URL;

test.describe("channel plan authorization", () => {
  test.skip(!deployedUrl, "Set DUEBACK_DEPLOYED_URL to run against the public Cloud Run service");

  test("shows the exact contract, versions a return-address change, and approves an available channel", async ({ page }) => {
    const initial = makeDraftCase();
    let draft: DraftCase = {
      ...initial,
      plan: {
        ...initial.plan,
        channelType: "CONTROLLED_SANDBOX" as const,
        senderIdentity: "DueBack controlled demo",
        replyRoute: "Signed callback",
        messageTemplateVersion: "follow-up/v1",
        messageSubject: "Follow-up for ORDER-79",
        messageBody: "Please confirm the promised outcome for ORDER-79.",
        followUpIntervalSeconds: 172800,
        maxLogicalSends: 3
      }
    };
    await page.route("**/api/channels", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{
        channelType: "CONTROLLED_SANDBOX", status: "AVAILABLE", canSend: true, canReceive: true,
        supportsThreading: false, supportsDeliveryReceipt: true,
        supportsAuthenticatedReply: true, requiresUserOAuth: false,
        reasonCodes: ["CONTROLLED_DEMO_CONFIGURED"], checkedAt: "2026-08-16T12:00:00.000Z"
      }])
    }));
    await page.route("**/api/cases/case_12345678/plan", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(draft) });
        return;
      }
      const command = route.request().postDataJSON() as { action: string; revision?: { notificationRecipient?: string } };
      if (command.action === "revise") {
        draft = {
          ...draft,
          plan: {
            ...draft.plan,
            version: 2,
            planHash: `sha256:${"b".repeat(64)}`,
            notificationRecipient: command.revision?.notificationRecipient
          }
        };
      } else if (command.action === "approve") {
        draft = { ...draft, state: "READY" as const };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(draft) });
    });

    await page.goto(`${deployedUrl}/cases/case_12345678/review`);
    await expect(page.getByText("Follow-up for ORDER-79")).toBeVisible();
    await expect(page.getByText("Up to 3 sends")).toBeVisible();
    await expect(page.getByText("Every 2 days")).toBeVisible();
    await page.getByRole("textbox", { name: "Email for DueBack case updates" }).fill("owner@example.test");
    await page.getByRole("button", { name: "Save update email" }).click();
    await expect(page.getByText(/Plan updated to version 2/)).toBeVisible();
    await page.getByRole("checkbox", { name: /authorized to contact/ }).check();
    await page.getByRole("button", { name: "Approve and start follow-up" }).click();
    await expect(page).toHaveURL(/\/cases\/case_12345678\/result$/);
  });

  test("keeps approval blocked when the active channel is unavailable", async ({ page }) => {
    const draft = { ...makeDraftCase(), plan: {
      ...makeDraftCase().plan,
      channelType: "MANAGED_EMAIL" as const,
      senderIdentity: "DueBack <followup@example.test>",
      replyRoute: "case+opaque@inbound.example.test",
      messageSubject: "Follow-up for ORDER-79",
      messageBody: "Please confirm ORDER-79."
    } };
    await page.route("**/api/channels", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify([{
        channelType: "MANAGED_EMAIL", status: "UNAVAILABLE", canSend: false, canReceive: false,
        supportsThreading: false, supportsDeliveryReceipt: false,
        supportsAuthenticatedReply: false, requiresUserOAuth: false,
        reasonCodes: ["EMAIL_GATE_INCOMPLETE"], checkedAt: "2026-08-16T12:00:00.000Z"
      }])
    }));
    await page.route("**/api/cases/case_12345678/plan", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify(draft)
    }));
    await page.goto(`${deployedUrl}/cases/case_12345678/review`);
    await page.getByRole("checkbox", { name: /authorized to contact/ }).check();
    await expect(page.getByRole("button", { name: "Approve and start follow-up" })).toBeDisabled();
    await expect(page.getByText(/cannot be activated until/)).toBeVisible();
  });
});
