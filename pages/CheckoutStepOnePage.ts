import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Routes, CheckoutInfo } from "../utils/types";

/**
 * CheckoutStepOnePage – customer information form (/checkout-step-one.html).
 */
export class CheckoutStepOnePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    super(page);

    this.firstNameInput = page.locator("#first-name");
    this.lastNameInput = page.locator("#last-name");
    this.postalCodeInput = page.locator("#postal-code");
    this.continueButton = page.locator("#continue");
    this.cancelButton = page.locator("#cancel");
    this.errorMessage = page.locator("[data-test='error']");
    this.errorCloseButton = page.locator(".error-button");
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(Routes.CHECKOUT_STEP_ONE);
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
  }

  async fillPostalCode(postalCode: string): Promise<void> {
    await this.postalCodeInput.fill(postalCode);
  }

  async fillCheckoutInfo(info: CheckoutInfo): Promise<void> {
    await this.fillFirstName(info.firstName);
    await this.fillLastName(info.lastName);
    await this.fillPostalCode(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async submitCheckoutInfo(info: CheckoutInfo): Promise<void> {
    await this.fillCheckoutInfo(info);
    await this.continue();
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectToBeOnCheckoutStepOne(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(Routes.CHECKOUT_STEP_ONE));
    await expect(this.firstNameInput).toBeVisible();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectNoError(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectInputsHighlightedOnError(): Promise<void> {
    await expect(this.firstNameInput).toHaveClass(/error/);
    await expect(this.lastNameInput).toHaveClass(/error/);
    await expect(this.postalCodeInput).toHaveClass(/error/);
  }
}
