import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("loader, hero, navigation and responsive shell", async ({ page }) => {
  await expect(page.getByTestId("loader")).toBeVisible();
  await expect(page.getByTestId("progress-block")).toHaveCount(12);
  await expect(page.getByTestId("loader")).toHaveCount(0, { timeout: 3000 });
  await expect(page.getByRole("heading", { name: "Kartik Sharma" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore My Work" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get in Touch" })).toBeVisible();
  await expect(page.getByRole("button", { name: /resume/i })).toBeVisible();
  await expect(page.locator(".inventory-slot")).toHaveCount(7);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("reduced motion bypasses loader", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByTestId("loader")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Kartik Sharma" })).toBeVisible();
});

test("every terrain divider fills the page from left to right", async ({ page }) => {
  const dividers = page.locator(".terrain-divider");
  await expect(dividers).toHaveCount(5);
  for (const divider of await dividers.all()) {
    const coverage = await divider.evaluate((element: SVGSVGElement) => {
      const path = element.querySelector("path")!;
      const bounds = path.getBBox();
      const view = element.viewBox.baseVal;
      return { left: bounds.x, right: bounds.x + bounds.width, width: view.width,
        filledRight: path.isPointInFill(new DOMPoint(view.width - 1, view.height - 1)) };
    });
    expect(coverage.left).toBe(0);
    expect(coverage.right).toBe(coverage.width);
    expect(coverage.filledRight).toBe(true);
  }
});

test("navigation reaches each section and fixed controls preserve page position", async ({ page }) => {
  await expect(page.getByTestId("loader")).toBeHidden({ timeout: 3000 });
  for (const id of ["projects", "contact", "about", "skills", "experience"]) {
    await page.locator(`.inventory a[href="#${id}"]`).click();
    await expect.poll(() => page.locator(`#${id}`).evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(2);
    expect(await page.locator(".world").evaluate((element) => element.scrollTop)).toBe(0);
  }
  const before = await page.evaluate(() => scrollY);
  await page.getByRole("button", { name: /Switch to night mode/ }).click();
  await page.getByRole("button", { name: "Open portfolio guide" }).click();
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page.locator(".chat-history")).toContainText("Nexora");
  await page.getByRole("button", { name: "Close chat" }).click();
  expect(Math.abs((await page.evaluate(() => scrollY)) - before)).toBeLessThan(2);
  expect(await page.locator(".world").evaluate((element) => element.scrollTop)).toBe(0);
  await expect(page.locator(".project-card h3")).toHaveText(["Nexora", "AgentPay", "CardFi", "ResolveX"]);
  await expect(page.locator(".project-links a")).toHaveCount(6);
});

test("pixel pointer stays under the mouse while clicking", async ({ page }) => {
  await expect(page.getByTestId("loader")).toBeHidden({ timeout: 3000 });
  const size = page.viewportSize()!;
  await page.mouse.move(size.width - 80, size.height - 160);
  const cursor = page.locator(".pixel-cursor");
  await expect(cursor).toBeVisible();
  await expect(cursor.locator("i")).toHaveCount(0);
  const before = await cursor.boundingBox();
  await page.mouse.down();
  await expect(cursor).toHaveClass(/click/);
  const during = await cursor.boundingBox();
  expect(Math.abs(during!.x - before!.x)).toBeLessThan(1);
  expect(Math.abs(during!.y - before!.y)).toBeLessThan(1);
  await page.mouse.up();
});

test("keyboard travel, field exclusion and persisted theme", async ({ page }) => {
  await expect(page.getByTestId("loader")).toBeHidden({ timeout: 3000 });
  await page.keyboard.press("5");
  await expect(page.getByTestId("section-skills")).toBeInViewport();
  await page.keyboard.press("7");
  await expect(page.locator(".world")).toHaveAttribute("data-theme", "night");
  await page.reload();
  await expect(page.locator(".world")).toHaveAttribute("data-theme", "night");
  await page.locator('input[name="name"]').focus();
  await page.waitForTimeout(700);
  const before = await page.evaluate(() => scrollY);
  await page.keyboard.press("1");
  await page.waitForTimeout(700);
  expect(Math.abs((await page.evaluate(() => scrollY)) - before)).toBeLessThan(15);
});

test("resume modal, chat and contact states", async ({ page }) => {
  await expect(page.getByTestId("loader")).toBeHidden({ timeout: 3000 });
  await page.getByRole("button", { name: /resume/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kartik Sharma · Resume" })).toHaveCSS("font-family", /Inter/);
  await expect(page.locator("body")).toHaveClass(/modal-open/);
  await expect(page.locator(".resume-document img")).toBeVisible();
  await expect.poll(() => page.locator(".resume-document img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  const pdf = await page.request.get("/Kartik_Sharma_Cybersecurity_Resume.pdf");
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await expect(page.getByRole("link", { name: "Download PDF", exact: true })).toHaveAttribute("download", "");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Download PDF", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "Open portfolio guide" }).click();
  await expect(page.locator(".chat-panel")).toHaveScreenshot("portfolio-guide.png", { animations: "disabled" });
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page.locator(".chat-history")).toContainText("CardFi", { timeout: 1500 });
  await page.getByRole("button", { name: "Close chat" }).click();
  await page.locator('input[name="name"]').fill("K");
  await page.locator('input[name="email"]').fill("bad-email");
  await page.locator('textarea[name="message"]').fill("short");
  await page.getByRole("button", { name: "Send Message" }).click();
  expect(await page.locator('input[name="email"]').evaluate((element: HTMLInputElement) => element.validity.valid)).toBe(false);
  await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }));
  await page.locator('input[name="name"]').fill("Kartik Visitor");
  await page.locator('input[name="email"]').fill("visitor@example.com");
  await page.locator('textarea[name="message"]').fill("I would like to discuss employee benefits.");
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByRole("status")).toContainText("delivered");
});

test("links are safe and page has no serious automated accessibility violations", async ({ page }) => {
  await expect(page.getByTestId("loader")).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator(".hero-content > div").last()).toHaveCSS("opacity", "1", { timeout: 3000 });
  const external = page.locator('a[target="_blank"]');
  for (let index = 0; index < await external.count(); index++) await expect(external.nth(index)).toHaveAttribute("rel", /noreferrer/);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""))).toEqual([]);
});

test("visual baselines for day and night hero", async ({ page }) => {
  await expect(page.getByTestId("loader")).toBeHidden({ timeout: 3000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByTestId("section-spawn")).toHaveScreenshot("hero-day.png", { animations: "disabled" });
  await page.getByRole("button", { name: /Switch to night mode/ }).click();
  await expect(page.getByTestId("section-spawn")).toHaveScreenshot("hero-night.png", { animations: "disabled" });
});

test("full world visual baseline", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?visual=1");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("world-day.png", { animations: "disabled", fullPage: true, timeout: 10_000 });
  await page.getByRole("button", { name: /Switch to night mode/ }).click();
  await expect(page).toHaveScreenshot("world-night.png", { animations: "disabled", fullPage: true, timeout: 10_000 });
});
