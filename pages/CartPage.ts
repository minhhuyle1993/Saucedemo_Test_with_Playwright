import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Routes } from "../utils/types";

/**
 * CartPage – shopping cart (/cart.html).
 */
export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly cartList: Locator;

  constructor(page: Page) {
    super(page);

    this.cartItems = page.locator(".cart_item");
    this.continueShoppingButton = page.locator("#continue-shopping");
    this.checkoutButton = page.locator("#checkout");
    this.cartList = page.locator(".cart_list");
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(Routes.CART);
  }

  // ── Item helpers ─────────────────────────────────────────────────────────────

  getCartItemByName(productName: string): Locator {
    return this.cartItems.filter({
      has: this.page.locator(".inventory_item_name", { hasText: productName }),
    });
  }

  getRemoveButton(productName: string): Locator {
    return this.getCartItemByName(productName).locator("button");
  }

  getItemQuantity(productName: string): Locator {
    return this.getCartItemByName(productName).locator(".cart_quantity");
  }

  getItemPrice(productName: string): Locator {
    return this.getCartItemByName(productName).locator(".inventory_item_price");
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async removeItem(productName: string): Promise<void> {
    await this.getRemoveButton(productName).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  // ── Data helpers ─────────────────────────────────────────────────────────────

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getAllItemNames(): Promise<string[]> {
    return await this.page.locator(".inventory_item_name").allTextContents();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectToBeOnCartPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(Routes.CART));
    await expect(this.cartList).toBeVisible();
  }

  async expectCartToBeEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }

  async expectItemInCart(productName: string): Promise<void> {
    await expect(this.getCartItemByName(productName)).toBeVisible();
  }

  async expectItemNotInCart(productName: string): Promise<void> {
    await expect(this.getCartItemByName(productName)).not.toBeVisible();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectItemQuantity(productName: string, quantity: string): Promise<void> {
    await expect(this.getItemQuantity(productName)).toHaveText(quantity);
  }

  async expectCheckoutButtonVisible(): Promise<void> {
    await expect(this.checkoutButton).toBeVisible();
  }

  async expectContinueShoppingButtonVisible(): Promise<void> {
    await expect(this.continueShoppingButton).toBeVisible();
  }
}
