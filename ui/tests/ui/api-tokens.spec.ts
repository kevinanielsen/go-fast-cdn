import { expect, test } from "@playwright/test";

test("selects and displays multiple API token permissions", async ({ page }) => {
  const now = new Date();
  const tokenMetadata = {
    id: 1,
    name: "Build token",
    scopes: ["cdn:upload", "cdn:rename"],
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_used_at: null,
    revoked_at: null,
  };
  const requests: { scopes: string[] }[] = [];
  let created = false;

  await page.addInitScript(() => {
    localStorage.setItem("accessToken", "test-session");
    localStorage.setItem("refreshToken", "test-refresh");
  });
  await page.route("**/api/auth/profile", (route) =>
    route.fulfill({
      json: {
        id: 1,
        email: "user@example.test",
        role: "user",
        is_verified: true,
        is_2fa_enabled: false,
        created_at: now.toISOString(),
        last_login: null,
      },
    })
  );
  await page.route("**/api/auth/profile/api-tokens", async (route) => {
    if (route.request().method() === "POST") {
      requests.push(route.request().postDataJSON() as { scopes: string[] });
      created = true;
      await route.fulfill({ status: 201, json: { token: "test-token", metadata: tokenMetadata } });
    } else {
      await route.fulfill({ json: created ? [tokenMetadata] : [] });
    }
  });

  await page.goto("/settings");
  await page.getByLabel("Token name").fill("Build token");
  await page.getByLabel("Current password", { exact: true }).last().fill("test-password");
  await page.getByRole("button", { name: "Create API token" }).click();
  await expect(page.getByText("Choose at least one token permission.")).toBeVisible();
  expect(requests).toHaveLength(0);

  const upload = page.getByRole("checkbox", { name: "Upload files" });
  const rename = page.getByRole("checkbox", { name: "Rename files" });
  const resize = page.getByRole("checkbox", { name: "Resize images" });
  const deleteFiles = page.getByRole("checkbox", { name: "Delete files" });
  await upload.check();
  await resize.check();
  await resize.uncheck();
  await rename.check();
  await expect(upload).toBeChecked();
  await expect(rename).toBeChecked();
  await expect(resize).not.toBeChecked();
  await expect(deleteFiles).not.toBeChecked();

  await page.getByRole("button", { name: "Create API token" }).click();
  await expect(page.getByText("Copy this token now. It will not be shown again.")).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].scopes).toEqual(["cdn:upload", "cdn:rename"]);
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByText("Upload files, Rename files · Active")).toBeVisible();
});
