import { test, expect } from "@playwright/test";
import { baseUrl } from "./config";

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl);
});

test("sidebar content-size label", async ({ page }) => {
  await expect(page.getByTestId("content-size-label")).toBeVisible();
});

test("content size written", async ({ page }) => {
  const contentSize = page.getByTestId("content-size");

  await contentSize.waitFor({ state: "visible" });

  expect(contentSize).toBeVisible();
});
