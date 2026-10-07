import { test, expect } from "@playwright/test";

// Load the saved session

test.use(
    {
        storageState: './user-session.json',
        screenshot: 'only-on-failure',
    });

test("go directly to dashboard — Test1 @ForQA", async ({ page }) => {
    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index");
    await expect(page).toHaveURL(/dashboard/);
    console.log("Test1 Dashboard loaded — no login needed ✅");
    await page.waitForTimeout(3000);
});

test("go directly to dashboard — Test2 @ForUAT @ForQA", async ({ page }) => {
    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index");
    await expect(page).toHaveURL(/dashboard/);
    console.log("Test2 Dashboard loaded — no login needed ✅");
    await page.waitForTimeout(3000);
});

test("go directly to dashboard — Test3 @ForPROD", async ({ page }) => {
    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index");
    await expect(page).toHaveURL(/dashboard/);
    console.log("Test3 Dashboard loaded — no login needed ✅");
    await page.waitForTimeout(3000);
});