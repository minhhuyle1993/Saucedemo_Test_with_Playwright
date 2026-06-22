import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Routes } from "../utils/types";

/**
 * CheckoutCompletePage – order confirmation (/checkout-complete.html).
 */
export class CheckoutCompletePage extends BasePage {
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly ponyExpressImage: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);

    this.completeHeader = page.locator(".complete-header");
    this.completeText = page.locator(".complete-text");
    this.ponyExpressImage = page.locator(".pony_express");
    this.backHomeButton = page.locator("#back-to-products");
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(Routes.CHECKOUT_COMPLETE);
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async goBackHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectToBeOnCompletePage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(Routes.CHECKOUT_COMPLETE));
    await expect(this.completeHeader).toBeVisible();
  }

  async expectSuccessHeader(): Promise<void> {
    await expect(this.completeHeader).toHaveText("Thank you for your order!");
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.completeText).toContainText(
      "Your order has been dispatched"
    );
  }

  async expectPonyExpressImageVisible(): Promise<void> {
    await expect(this.ponyExpressImage).toBeVisible();
  }

  async expectBackHomeButtonVisible(): Promise<void> {
    await expect(this.backHomeButton).toBeVisible();
  }

  async expectFullOrderConfirmation(): Promise<void> {
    await this.expectToBeOnCompletePage();
    await this.expectSuccessHeader();
    await this.expectPonyExpressImageVisible();
    await this.expectBackHomeButtonVisible();
  }
}
