# Saucedemo_Test_with_Playwright
# Playwright E2E Test Suite

End-to-end test automation for [saucedemo.com](https://www.saucedemo.com), built with **Playwright** and **TypeScript** following the **Page Object Model** pattern. Tests are driven by a structured test specification that covers authentication, product catalogue, cart management, checkout flow, navigation, and performance across multiple user profiles.

---

## Tech stack

| | |
|---|---|
| [Playwright](https://playwright.dev) v1.61 | Browser automation & test runner |
| TypeScript | Type-safe test authoring |
| Page Object Model | Abstraction layer separating UI selectors from test logic |
| Custom fixtures | Dependency injection of pre-wired page objects via `test.extend()` |

---

## Project structure

```
├── pages/
│   ├── BasePage.ts             # Shared burger menu, cart badge, logout
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── ProductDetailPage.ts
│   ├── CartPage.ts
│   ├── CheckoutStepOnePage.ts
│   ├── CheckoutStepTwoPage.ts
│   ├── CheckoutCompletePage.ts
│   └── index.ts
│
├── fixtures/
│   └── index.ts               # Custom test object with all POM fixtures injected
│
├── utils/
│   └── types.ts               # User enum, SortOption enum, Routes, interfaces
│
└── tests/
    └── test-specifications.spec.ts   # 19 spec-driven test cases (TC-AUTH through TC-PERF)
```

---

## Test execution dashboard

Results from the current test run, mapped directly to the test specification document:

| Module | Test Cases | Status |
|---|---|---|
| Authentication | TC-AUTH-01 → TC-AUTH-06 | ✅ All pass |
| Products | TC-PROD-01 → TC-PROD-04 | ✅ All pass |
| Cart | TC-CART-01 → TC-CART-03 | ✅ All pass |
| Checkout | TC-CHKT-01 → TC-CHKT-04 | ✅ All pass |
| Navigation | TC-NAVI-01 | ✅ All pass |
| Performance | TC-PERF-01 | ✅ All pass |

---

## Test cases

### Authentication

| ID | Title | Priority | User |
|---|---|---|---|
| TC-AUTH-01 | Successful login with standard baseline account | High | standard_user |
| TC-AUTH-02 | Failed login — locked out account | High | locked_out_user |
| TC-AUTH-03 | Failed login — invalid password | Medium | standard_user |
| TC-AUTH-04 | Failed login — blank required fields | Medium | standard_user |
| TC-AUTH-05 | Successful logout and session termination | High | standard_user |
| TC-AUTH-06 | Security: direct URL access prevention without session | High | — |

### Products

| ID | Title | Priority | User |
|---|---|---|---|
| TC-PROD-01 | Standard grid layout and product catalog display | High | standard_user |
| TC-PROD-02 | Visual/image anomalies for problem accounts | Medium | problem_user |
| TC-PROD-03 | Product catalog sorting options (all 4 orders) | Medium | standard_user |
| TC-PROD-04 | Navigate to individual product detail view | Low | standard_user |

### Cart

| ID | Title | Priority | User |
|---|---|---|---|
| TC-CART-01 | Add items to the shopping cart | High | standard_user |
| TC-CART-02 | Remove items at multiple entry points (grid & cart view) | High | standard_user |
| TC-CART-03 | Cart persistence across navigation flows | Medium | standard_user |

### Checkout

| ID | Title | Priority | User |
|---|---|---|---|
| TC-CHKT-01 | Validation of empty input fields at step one | High | standard_user |
| TC-CHKT-02 | Tax and price summary calculation accuracy at step two | High | standard_user |
| TC-CHKT-03 | Complete order transaction successfully | High | standard_user |
| TC-CHKT-04 | error_user cannot complete checkout | Low | error_user |

### Navigation

| ID | Title | Priority | User |
|---|---|---|---|
| TC-NAVI-01 | Burger menu and Reset App State execution | Medium | standard_user |

### Performance

| ID | Title | Priority | User |
|---|---|---|---|
| TC-PERF-01 | Login latency benchmark for performance_glitch_user | Medium | performance_glitch_user |

---

## Design decisions

### Page Object Model with inheritance

Every page class exposes three layers: **locators** (elements to interact with), **actions** (methods that drive the UI), and **assertions** (`expect*` helpers that encode what correct looks like). Authenticated pages extend `BasePage`, which owns the burger menu, cart badge, and logout — shared behaviour defined once.

```typescript
// BasePage owns shared navigation — no duplication across page classes
async logout(): Promise<void> {
  await this.openMenu();
  await this.logoutLink.click();
}
```

### Custom fixture layer

All page objects are injected via Playwright's `test.extend()`. The `authenticatedPage` fixture handles login and lands on the inventory page before the test body runs, keeping setup noise out of test files.

```typescript
test("adds item to cart", async ({ authenticatedPage: inventoryPage }) => {
  await inventoryPage.addItemToCart("Sauce Labs Backpack");
  await inventoryPage.expectCartBadgeCount(1);
});
```

### Typed constants — no magic strings

User credentials, sort options, and routes are defined as TypeScript enums and `as const` objects. Typos become compile-time errors rather than silent runtime failures.

```typescript
await loginPage.loginAs(User.Standard);          // not "standard_user"
await inventoryPage.sortBy(SortOption.PriceHighLow);  // not "hilo"
await page.goto(Routes.CART);                    // not "/cart.html"
```

### Assertions belong in the POM

Each page object contains its own `expect*` methods, so test bodies read as intent rather than selector detail.

```typescript
await checkoutStepTwoPage.expectTotalMatchesSubtotalPlusTax();
await checkoutCompletePage.expectSuccessHeader();
```

---

## Getting started

```bash
npm install
npx playwright install    # download browsers
npx playwright test       # run all tests
npx playwright show-report
```

---

## Configuration highlights

`playwright.config.ts` sets `trace: "on-first-retry"`, `screenshot: "only-on-failure"`, and `video: "retain-on-failure"` — every failure produces a full diagnostic bundle without slowing passing runs. The HTML report opens automatically after each run (`open: 'always'`).
