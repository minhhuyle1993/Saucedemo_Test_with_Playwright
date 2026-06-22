import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * ProductDetailPage – individual product view (/inventory-item.html?id=N).
 */
export class ProductDetailPage extends BasePage {
  readonly backButton: Locator;
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly productImage: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page) {
    super(page);

    this.backButton = page.locator("#back-to-products");
    this.productName = page.locator(".inventory_details_name");
    this.productDescription = page.locator(".inventory_details_desc");
    this.productPrice = page.locator(".inventory_details_price");
    this.productImage = page.locator(".inventory_details_img");
    this.addToCartButton = page.locator("button[id^='add-to-cart']");
    this.removeButton = page.locator("button[id^='remove']");
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  // ── Data helpers ─────────────────────────────────────────────────────────────

  async getProductName(): Promise<string> {
    return await this.productName.innerText();
  }

  async getProductPrice(): Promise<number> {
    const text = await this.productPrice.innerText();
    return parseFloat(text.replace("$", ""));
  }

  async getProductDescription(): Promise<string> {
    return await this.productDescription.innerText();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectProductName(name: string): Promise<void> {
    await expect(this.productName).toHaveText(name);
  }

  async expectProductPrice(price: string): Promise<void> {
    await expect(this.productPrice).toHaveText(price);
  }

  async expectAddToCartVisible(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible();
    await expect(this.addToCartButton).toHaveText("Add to cart");
  }

  async expectRemoveButtonVisible(): Promise<void> {
    await expect(this.removeButton).toBeVisible();
    await expect(this.removeButton).toHaveText("Remove");
  }

  async expectImageVisible(): Promise<void> {
    await expect(this.productImage).toBeVisible();
  }

  async expectBackButtonVisible(): Promise<void> {
    await expect(this.backButton).toBeVisible();
  }
}
