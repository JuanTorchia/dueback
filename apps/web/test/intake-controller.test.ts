import { describe, expect, it } from "vitest";
import { handleIntake } from "../lib/intake-controller";

describe("intake API contract", () => {
  it("requires a promise source", async () => {
    const response = await handleIntake(
      new Request("https://dueback.test/api/intake", { method: "POST", body: new FormData() }),
      {
        authenticate: () => Promise.resolve({ uid: "person_12345678" }),
        service: { intake: () => Promise.reject(new Error("must not run")) } as never,
        now: () => "2026-08-15T12:00:00.000Z"
      }
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "PROMISE_SOURCE_REQUIRED" });
  });
});
