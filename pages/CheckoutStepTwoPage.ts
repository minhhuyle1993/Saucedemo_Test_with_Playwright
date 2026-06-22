import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Routes } from "../utils/types";

/**
 * CheckoutStepTwoPage – order summary / overview (/checkout-step-two.html).
 */
export class CheckoutStepTwoPage extends BasePage {
  readonly cartItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly paymentInfoLabel: Locator;
  readonly shippingInfoLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly summaryInfoContainer: Locator;

  constructor(page: Page) {
    super(page);

    this.cartItems = page.locator(".cart_item");
    this.subtotalLabel = page.locator(".summary_subtotal_label");
    this.taxLabel = page.locator(".summary_tax_label");
    this.totalLabel = page.locator(".summary_total_label");
    this.paymentInfoLabel = page.locator(".summary_value_label").first();
    this.shippingInfoLabel = page.locator(".summary_value_label").nth(1);
    this.finishButton = page.locator("#finish");
    this.cancelButton = page.locator("#cancel");
    this.summaryInfoContainer = page.locator(".checkout_summary_container");
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(Routes.CHECKOUT_STEP_TWO);
  }

  // ── Data helpers ─────────────────────────────────────────────────────────────

  async getSubtotal(): Promise<number> {
    const text = await this.subtotalLabel.innerText();
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getTax(): Promise<number> {
    const text = await this.taxLabel.innerText();
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getTotal(): Promise<number> {
    const text = await this.totalLabel.innerText();
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  getCartItemByName(productName: string): Locator {
    return this.cartItems.filter({
      has: this.page.locator(".inventory_item_name", { hasText: productName }),
    });
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectToBeOnCheckoutStepTwo(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(Routes.CHECKOUT_STEP_TWO));
    await expect(this.summaryInfoContainer).toBeVisible();
  }

  async expectItemInSummary(productName: string): Promise<void> {
    await expect(this.getCartItemByName(productName)).toBeVisible();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectTotalMatchesSubtotalPlusTax(): Promise<void> {
    const subtotal = await this.getSubtotal();
    const tax = await this.getTax();
    const total = await this.getTotal();
    expect(parseFloat((subtotal + tax).toFixed(2))).toBeCloseTo(total, 2);
  }

  async expectSubtotalVisible(): Promise<void> {
    await expect(this.subtotalLabel).toBeVisible();
  }

  async expectFinishButtonVisible(): Promise<void> {
    await expect(this.finishButton).toBeVisible();
  }
}
