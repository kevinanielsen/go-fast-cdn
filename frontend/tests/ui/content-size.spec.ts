import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("sidebar content-size label", async ({ page }) => {
  await expect(page.getByTestId("content-size-label")).toBeVisible();
});

test("content size written", async ({ page }) => {
  const contentSize = page.getByTestId("content-size");

  await contentSize.waitFor({ state: "visible" });

  expect(contentSize).toBeVisible();
});
