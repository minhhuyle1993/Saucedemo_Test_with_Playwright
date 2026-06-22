import { test as base } from "@playwright/test";
import {
  LoginPage,
  InventoryPage,
  ProductDetailPage,
  CartPage,
  CheckoutStepOnePage,
  CheckoutStepTwoPage,
  CheckoutCompletePage,
} from "../pages";
import { User, PASSWORD } from "../utils/types";

// ─── Fixture type definitions ─────────────────────────────────────────────────

type PageFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
};

type WorkerFixtures = {
  /** Logs in as the standard user before the test and navigates to inventory. */
  authenticatedPage: InventoryPage;
};

// ─── Extended test object ─────────────────────────────────────────────────────

export const test = base.extend<PageFixtures & WorkerFixtures>({
  // POM instances wired to the current page
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutStepOnePage: async ({ page }, use) => {
    await use(new CheckoutStepOnePage(page));
  },
  checkoutStepTwoPage: async ({ page }, use) => {
    await use(new CheckoutStepTwoPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  // Convenience: already-authenticated inventory page
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(User.Standard, PASSWORD);
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectToBeOnInventoryPage();
    await use(inventoryPage);
  },
});

export { expect } from "@playwright/test";
