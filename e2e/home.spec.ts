import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle("The Talented Mr. Szamowski");
  });

  test("hero section displays name and tagline", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Szamowski"
    );
    await expect(page.getByText("The Talented")).toBeVisible();
    // CTA buttons should always be present
    await expect(page.getByRole("link", { name: "Get in Touch" })).toBeVisible();
  });

  test("CTA buttons link correctly", async ({ page }) => {
    const getInTouch = page.getByRole("link", { name: "Get in Touch" });
    await expect(getInTouch).toHaveAttribute("href", "/contact");

    const seeMyWork = page.getByRole("link", { name: "See My Work" });
    await expect(seeMyWork).toHaveAttribute("href", "#experience");
  });

  test("navigation links are visible and work", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Blog" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact" }).first()).toBeVisible();

    await page.getByRole("link", { name: "Blog" }).first().click();
    await expect(page).toHaveURL("/blog");
  });

  test("about section is visible", async ({ page }) => {
    // Heading uses terminal typing animation — wait for it to complete
    await expect(page.getByRole("heading", { name: /adaptability|about/i })).toBeVisible();
  });

  test("experience section renders companies", async ({ page }) => {
    // Check a few key companies that are unlikely to change
    const companies = ["Foap", "TikTok", "Ubisoft", "Samsung"];
    for (const company of companies) {
      await expect(page.getByText(company).first()).toBeVisible();
    }
  });

  test("skills section is visible", async ({ page }) => {
    // Skills section should render with some skill tags
    await expect(page.getByText("Brand Strategy").first()).toBeVisible();
  });

  test("tech projects section renders projects", async ({ page }) => {
    // Check a few key projects
    await expect(page.getByText(/Foap/i).first()).toBeVisible();
    await expect(page.getByText(/TikTok/i).first()).toBeVisible();
  });

  test("footer renders with social links", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "LinkedIn" }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "GitHub" }).first()
    ).toBeVisible();
    await expect(page.getByText(/© 2026.*Szamowski/i)).toBeVisible();
  });
});

test.describe("Home Page - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("hamburger menu appears on mobile", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: "Toggle menu" });
    await expect(hamburger).toBeVisible();
  });

  test("mobile menu opens and navigation works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await page.getByRole("link", { name: "Blog" }).first().click();
    await expect(page).toHaveURL("/blog");
  });
});
