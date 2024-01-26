import { test, expect } from "@playwright/test";

/**
 * Tests that the /api/cdn/size endpoint returns a 200 OK status.
 * Verifies the status code is 200 and the response is ok.
 */
test("should return OK", async ({ request }) => {
  const response = await request.get("/api/cdn/size");
  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);
});

/**
 * Test that ensures the /api/cdn/size endpoint returns a response with cdn_size_bytes > 0.
 * This validates that the CDN size API is returning a valid non-zero byte count.
 */
test("should be > 0 bytes", async ({ request }) => {
  const response = await request.get("/api/cdn/size");
  expect((await response.json()).cdn_size_bytes).toBeGreaterThan(0);
});
