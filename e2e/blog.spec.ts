import { test, expect } from "@playwright/test";

test.describe("Blog Page", () => {
  test("loads with correct title", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle("Blog | The Talented Mr. Szamowski");
  });

  test("shows empty state when no posts exist", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByText("No blog posts yet")).toBeVisible();
  });

  test("heading and description are visible", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
    await expect(
      page.getByText("Thoughts on marketing, technology, and business strategy")
    ).toBeVisible();
  });

  test("archive page loads", async ({ page }) => {
    await page.goto("/blog/archive");
    await expect(page).toHaveTitle("Blog Archive | The Talented Mr. Szamowski");
    await expect(page.getByRole("heading", { name: "Archive" })).toBeVisible();
  });
});
