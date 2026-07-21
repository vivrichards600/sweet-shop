// @ts-check
import { test, expect } from '@playwright/test';

const pages = ['/', '/sweets.html', '/basket.html', '/login.html', '/about.html'];

for (const path of pages) {
    test(`chat launcher is visible on ${path}`, async ({ page, browserName }) => {
        test.skip(browserName !== 'chromium', 'Prompt API is Chromium-only');

        await page.goto('https://sweetshop.vivrichards.co.uk' + path);
        await expect(page.locator('#sweetChatLauncher')).toBeVisible();
    });
}

test('clicking the launcher opens the chat panel', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Prompt API is Chromium-only');

    await page.goto('https://sweetshop.vivrichards.co.uk/');
    await page.locator('#sweetChatLauncher').click();
    await expect(page.locator('#sweetChatPanel')).toBeVisible();
});

test('shows an unsupported-browser message when the Prompt API is unavailable', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Prompt API is Chromium-only');

    await page.goto('https://sweetshop.vivrichards.co.uk/');
    await page.locator('#sweetChatLauncher').click();

    // Playwright's bundled Chromium does not ship the Gemini Nano model, so the
    // widget is expected to report the unsupported-browser path here.
    await expect(page.locator('#sweetChatStatus')).toContainText("doesn't support");
    await expect(page.locator('#sweetChatInput')).toBeDisabled();
});
