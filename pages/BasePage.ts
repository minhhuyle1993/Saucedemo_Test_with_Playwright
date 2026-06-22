import { Page, Locator, expect } from "@playwright/test";

/**
 * BasePage – shared navigation header and sidebar present on all
 * authenticated pages (inventory, cart, product detail, checkout).
 */
export class BasePage {
  readonly page: Page;

  // ── Header ──────────────────────────────────────────────────────────────────
  readonly menuButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly pageTitle: Locator;

  // ── Burger menu items ────────────────────────────────────────────────────────
  readonly sidebar: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly closeMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.menuButton = page.locator("#react-burger-menu-btn");
    this.cartLink = page.locator(".shopping_cart_link");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.pageTitle = page.locator(".title");

    // Burger sidebar
    this.sidebar = page.locator(".bm-menu-wrap");
    this.allItemsLink = page.locator("#inventory_sidebar_link");
    this.aboutLink = page.locator("#about_sidebar_link");
    this.logoutLink = page.locator("#logout_sidebar_link");
    this.resetAppStateLink = page.locator("#reset_sidebar_link");
    this.closeMenuButton = page.locator("#react-burger-cross-btn");
  }

  // ── Navigation helpers ───────────────────────────────────────────────────────

  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await this.sidebar.waitFor({ state: "visible" });
  }

  async closeMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await this.sidebar.waitFor({ state: "hidden" });
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async goToAllItems(): Promise<void> {
    await this.openMenu();
    await this.allItemsLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateLink.click();
    await this.closeMenu();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectCartBadgeCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async expectPageTitle(title: string): Promise<void> {
    await expect(this.pageTitle).toHaveText(title);
  }

  async expectMenuVisible(): Promise<void> {
    await expect(this.sidebar).toBeVisible();
  }
}
