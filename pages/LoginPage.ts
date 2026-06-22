import { Page, Locator, expect } from "@playwright/test";
import { Routes, User, PASSWORD } from "../utils/types";

/**
 * LoginPage – handles the /  login form.
 */
export class LoginPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.locator("#user-name");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login-button");
    this.errorMessage = page.locator("[data-test='error']");
    this.errorCloseButton = page.locator(".error-button");
    this.logo = page.locator(".login_logo");
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(Routes.LOGIN);
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Fills credentials and submits the login form.
   */
  async login(username: string, password: string = PASSWORD): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * Convenience: log in as a well-known user enum.
   */
  async loginAs(user: User, password: string = PASSWORD): Promise<void> {
    await this.login(user, password);
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectToBeOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(Routes.LOGIN));
    await expect(this.loginButton).toBeVisible();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectNoErrorMessage(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectErrorDismissed(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectLogoVisible(): Promise<void> {
    await expect(this.logo).toBeVisible();
  }

  async expectInputsEmpty(): Promise<void> {
    await expect(this.usernameInput).toHaveValue("");
    await expect(this.passwordInput).toHaveValue("");
  }
}
