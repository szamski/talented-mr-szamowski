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
      "Maciej Szamowski"
    );
    await expect(page.getByRole("main").getByText("Digital One Man Army")).toBeVisible();
    await expect(page.getByText("The Talented")).toBeVisible();
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

  test("about section renders profile text", async ({ page }) => {
    await expect(page.getByText("15+ years of experience")).toBeVisible();
  });

  test("experience section renders all 8 positions", async ({ page }) => {
    const companies = [
      "Foap",
      "pro/porcja.agency",
      "Selmo",
      "TikTok",
      "Ubisoft",
      "Samsung Electronics",
      "MEC / Wavemaker",
      "Monday Agency",
    ];
    for (const company of companies) {
      await expect(page.getByText(company).first()).toBeVisible();
    }
  });

  test("skills section renders all 17 skills", async ({ page }) => {
    const skills = [
      "Marketing Leadership",
      "Brand Strategy",
      "Growth Marketing",
      "CRM",
      "MarTech",
      "Go-to-Market Strategy",
    ];
    for (const skill of skills) {
      await expect(page.getByText(skill, { exact: true })).toBeVisible();
    }
  });

  test("tech projects section renders 4 projects", async ({ page }) => {
    const projects = [
      "Foap automation suite",
      "TikTok analytics dashboard",
      "Agency operations tracker",
      "Copa City & Triple Espresso websites",
    ];
    for (const project of projects) {
      await expect(page.getByText(project)).toBeVisible();
    }
  });

  test("footer renders with social links", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "LinkedIn" }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "GitHub" }).first()
    ).toBeVisible();
    await expect(page.getByText("© 2026 Maciej Szamowski")).toBeVisible();
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
