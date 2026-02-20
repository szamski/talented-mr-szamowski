import { test, expect } from "@playwright/test";

test.describe("Blog Page", () => {
  test("loads with correct title", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle("Blog | The Talented Mr. Szamowski");
  });

  test("shows posts or empty state", async ({ page }) => {
    await page.goto("/blog");
    // Wait for heading to confirm page has loaded
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
    // Then check for posts or empty state
    await expect(
      page.getByText("No blog posts yet").or(page.locator("a[href^='/blog/']").first())
    ).toBeVisible();
  });

  test("heading is visible", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  });

  test("archive page loads", async ({ page }) => {
    await page.goto("/blog/archive");
    await expect(page).toHaveTitle("Blog Archive | The Talented Mr. Szamowski");
    await expect(page.getByRole("heading", { name: "Archive" })).toBeVisible();
  });
});
