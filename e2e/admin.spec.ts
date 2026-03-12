import { test, expect, Page } from "@playwright/test";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

async function dismissOverlays(page: Page) {
  // Dismiss any cookie banner or overlay that might block clicks
  const banner = page.locator('[class*="animate-slide-up"], [class*="cookie"]');
  if (await banner.isVisible({ timeout: 1000 }).catch(() => false)) {
    // Try clicking accept/close
    const acceptBtn = banner.locator("button").first();
    if (await acceptBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await acceptBtn.click();
    }
  }
}

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");
  await dismissOverlays(page);
  await page.getByLabel("Username").fill(ADMIN_USER);
  await page.getByLabel("Password").fill(ADMIN_PASS);
  await page.getByRole("button", { name: /login/i }).click();
  await page.waitForURL("/admin");
  await dismissOverlays(page);
}

async function createProject(page: Page) {
  // Fill project name and create
  await page
    .locator('input[placeholder*="Project name"]')
    .fill("Test Project " + Date.now());
  await page.getByRole("button", { name: /create/i }).click();
  await page.waitForURL(/\/admin\/editor\//);
  await page.waitForLoadState("networkidle");
}

test.describe("Admin Login", () => {
  test("shows login page", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("szamowski.dev");
    await expect(page.locator("body")).toContainText("Admin Panel");
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /login/i })
    ).toBeVisible();
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("logs in with valid credentials", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL("/admin");
    await expect(page.locator("body")).toContainText(
      /project|dashboard|content/i
    );
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");
    await dismissOverlays(page);
    await page.getByLabel("Username").fill("wrong");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.locator("body")).toContainText(
      /invalid|error|wrong/i
    );
  });
});

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("shows dashboard with create and logout buttons", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /create/i })
    ).toBeVisible();
    await expect(page.locator("button", { hasText: /logout/i })).toBeVisible();
  });

  test("can create a new project", async ({ page }) => {
    await createProject(page);
    await expect(page).toHaveURL(/\/admin\/editor\/[a-z0-9]+/);
  });

  test("can logout", async ({ page }) => {
    await page.locator("button", { hasText: /logout/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("Slide Editor", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await createProject(page);
  });

  test("shows editor with slide preview", async ({ page }) => {
    await expect(page.locator("iframe").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("shows editor panel when clicking a slide", async ({ page }) => {
    const firstSlide = page.locator("iframe").first();
    await firstSlide.waitFor({ state: "visible", timeout: 10000 });
    await firstSlide.locator("..").click();
    await expect(
      page.locator("textarea, input[type='text']").first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("can add a new slide from templates", async ({ page }) => {
    await page.locator("button", { hasText: /slide/i }).first().click();
    await expect(page.locator("body")).toContainText(/template|cover|blank/i);
  });

  test("has export functionality", async ({ page }) => {
    await expect(
      page.locator("button", { hasText: /export/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("has image management section", async ({ page }) => {
    const firstSlide = page.locator("iframe").first();
    await firstSlide.waitFor({ state: "visible", timeout: 10000 });
    await firstSlide.locator("..").click();
    await expect(page.locator("body")).toContainText(/image/i, {
      timeout: 5000,
    });
  });
});

test.describe("Avatar Generator", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("shows avatar generator page", async ({ page }) => {
    await page.goto("/admin/avatar");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText(/avatar/i);
    // Should show upload area
    await expect(page.locator("body")).toContainText(/drop|click|paste/i);
  });
});

test.describe("Cover Photo Generator", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("shows cover photo generator page", async ({ page }) => {
    await page.goto("/admin/cover-photo");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText(/cover photo/i);
    await expect(page.locator("canvas")).toBeVisible();
    // Should show text controls
    await expect(page.locator("body")).toContainText(/headline/i);
  });

  test("has safe zone toggle", async ({ page }) => {
    await page.goto("/admin/cover-photo");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText(/safe zone/i);
  });
});

test.describe("Visual Check - Screenshots", () => {
  test("login page screenshot", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: "e2e/screenshots/admin-login.png",
      fullPage: true,
    });
  });

  test("dashboard screenshot", async ({ page }) => {
    await login(page);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: "e2e/screenshots/admin-dashboard.png",
      fullPage: true,
    });
  });

  test("editor screenshot", async ({ page }) => {
    await login(page);
    await createProject(page);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: "e2e/screenshots/admin-editor.png",
      fullPage: true,
    });
  });

  test("avatar generator screenshot", async ({ page }) => {
    await login(page);
    await page.goto("/admin/avatar");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: "e2e/screenshots/admin-avatar.png",
      fullPage: true,
    });
  });

  test("cover photo generator screenshot", async ({ page }) => {
    await login(page);
    await page.goto("/admin/cover-photo");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "e2e/screenshots/admin-cover-photo.png",
      fullPage: true,
    });
  });
});
