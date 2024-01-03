import { test, expect } from "@playwright/test";

/**
 * E2E test that navigates to the base URL
 * and verifies the page title matches
 * the expected title regex.
 */
test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Go-Fast CDN/);
});

/**
 * E2E test that clicks the upload link,
 * navigates to the upload page, and
 * verifies the upload heading is visible.
 */
test("upload link", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Upload Content" }).click();

  await expect(
    page.getByRole("heading", { name: "Upload Files" })
  ).toBeVisible();

  expect(page.url()).toContain("/upload/docs");
});

/**
 * E2E test that clicks between the upload tabs,
 * navigates between the tabs, and verifies the URL
 * updates correctly.
 */
test("upload tabs", async ({ page }) => {
  await page.goto("/upload/docs");

  /**
   * Clicks the "Images" upload tab button,
   * then asserts the URL updates to /upload/images.
   */
  await page.getByRole("button", { name: "Images" }).click();

  expect(page.url()).toContain("/upload/images");

  /**
   * Clicks the "Documents" upload tab button,
   * then asserts the URL updates to /upload/docs.
   */
  await page.getByRole("button", { name: "Documents" }).click();

  expect(page.url()).toContain("/upload/docs");
});
