# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sweet Shop is an **intentionally broken** static web application used to demonstrate Chrome DevTools features and to practice web testing (functional, exploratory, end-to-end). It is plain HTML/CSS/jQuery with no build step and no backend — it's meant to be opened directly or hosted as static files. Live version: https://sweetshop.vivrichards.co.uk. Bugs in the app are deliberate — don't "fix" broken behavior unless asked to.

## Running the app

There is no dev server or build step. Open the HTML files directly in a browser, e.g. `index.html`, or serve the directory root with any static file server.

## Testing

Tests use Playwright (`@playwright/test`), configured in `playwright.config.js`, and run against the **live deployed site** (`https://sweetshop.vivrichards.co.uk`), not a local server — there is no `baseURL` or `webServer` configured.

- No npm scripts are defined in `package.json`; invoke Playwright directly via `npx`.
- Run all tests: `npx playwright test`
- Run a single test file: `npx playwright test tests/<file>.spec.js`
- Run a single test by name: `npx playwright test -g "test name"`
- Tests live in `tests/*.spec.js` (currently deleted from the working tree locally but present in git history/CI — check `git status` before assuming the directory is empty).
- CI runs Playwright across chromium, firefox, and webkit on push/PR to `main`/`master` (see `workflows/playwright.yml` — note this is **not** in `.github/workflows/`, so it is not an active GitHub Actions workflow as currently placed).

## Architecture

Multi-page site, no routing/framework — each `.html` file is a standalone page sharing common vendor assets and one shared script.

- **Pages**: `index.html` (home/most popular), `sweets.html` (product catalogue), `basket.html` (cart), `login.html` (demo login), `about.html`, and `00efc23d-b605-4f31-b97b-6bb276de447e.html` (the post-login account/orders page — deliberately given an obscure filename rather than something like `account.html`).
- **`js/custom.js`** is the single script backing all pages (loaded via `<script src="js/custom.js">` and invoked through `<body onload="init()">`). `init()` branches behavior based on which elements exist on the current page, so it's safe to call on every page.
- **Cart/basket state** lives entirely in `localStorage`, keyed by product id, storing `{id, name, price, quantity}` per item. There is no server persistence.
- **"Add to Basket" buttons** (`.addItem`) carry the product's data via `data-id` / `data-name` / `data-price` attributes; the click handler in `custom.js` reads these to update `localStorage`.
- **Demo login** (`login.html`) does not check passwords meaningfully — it only validates the email against a hardcoded allow-list (`ALLOWED_LOGIN_EMAILS` in `custom.js`) and stores the chosen email in `sessionStorage`/a cookie, then redirects to the account page.
- **Account/order data is fake and hardcoded**: `demoAccountsByPrefix` in `custom.js` maps the email's prefix (before `@`) to a canned account profile (display name, favourite/suggested sweet, order history). Any email not matching `oneorder`/`twoorders`/`fiveorders` falls back to the `guest` profile. The account page renders this data plus an order chart via Chart.js (`renderOrderChart`).
- **Vendor libraries** (Bootstrap, jQuery) are vendored under `vendor/` and referenced directly by path — no package manager involvement for runtime assets, only for the Playwright test tooling in `package.json`.
