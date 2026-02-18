import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle("Contact | The Talented Mr. Szamowski");
  });

  test("heading is visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Get in Touch" })
    ).toBeVisible();
  });

  test("form fields are present", async ({ page }) => {
    await expect(page.getByLabel("Name *")).toBeVisible();
    await expect(page.getByLabel("Email *")).toBeVisible();
    await expect(page.getByLabel("Subject")).toBeVisible();
    await expect(page.getByLabel("Message *")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send Message" })
    ).toBeVisible();
  });

  test("form validates required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Send Message" }).click();
    // Browser native validation should prevent submission
    const nameInput = page.getByLabel("Name *");
    await expect(nameInput).toHaveAttribute("required", "");
  });

  test("WhatsApp button has correct href", async ({ page }) => {
    const whatsapp = page.getByRole("link", { name: "Chat on WhatsApp" });
    await expect(whatsapp).toHaveAttribute("href", "https://wa.me/48793324715");
  });

  test("social links are present", async ({ page }) => {
    const linkedin = page.getByRole("link", { name: "LinkedIn" }).first();
    await expect(linkedin).toBeVisible();
    await expect(linkedin).toHaveAttribute("href", /linkedin/i);

    const github = page.getByRole("link", { name: "GitHub" }).first();
    await expect(github).toBeVisible();
    await expect(github).toHaveAttribute("href", /github/i);
  });
});
