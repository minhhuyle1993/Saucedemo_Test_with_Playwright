import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Routes, SortOption } from "../utils/types";

/**
 * InventoryPage – the main product listing page (/inventory.html).
 */
export class InventoryPage extends BasePage {
  readonly sortDropdown: Locator;
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    super(page);

    this.sortDropdown = page.locator(".product_sort_container");
    this.inventoryContainer = page.locator("#inventory_container");
    this.inventoryItems = page.locator(".inventory_item");
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(Routes.INVENTORY);
  }

  // ── Item helpers ─────────────────────────────────────────────────────────────

  /**
   * Returns the locator for a single inventory card by product name.
   */
  getItemByName(name: string): Locator {
    return this.page
      .locator(".inventory_item")
      .filter({ has: this.page.locator(".inventory_item_name", { hasText: name }) });
  }

  getItemNameLocators(): Locator {
    return this.page.locator(".inventory_item_name");
  }

  getItemPriceLocators(): Locator {
    return this.page.locator(".inventory_item_price");
  }

  /**
   * Returns the Add-to-cart button for an item by product name.
   */
  getAddToCartButton(productName: string): Locator {
    return this.getItemByName(productName).locator("button");
  }

  /**
   * Returns the Remove button for an item that is already in the cart.
   */
  getRemoveButton(productName: string): Locator {
    return this.getItemByName(productName).locator("button");
  }

  getItemImage(productName: string): Locator {
    return this.getItemByName(productName).locator("img.inventory_item_img");
  }

  getItemDescription(productName: string): Locator {
    return this.getItemByName(productName).locator(".inventory_item_desc");
  }

  getItemPrice(productName: string): Locator {
    return this.getItemByName(productName).locator(".inventory_item_price");
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async addItemToCart(productName: string): Promise<void> {
    await this.getAddToCartButton(productName).click();
  }

  async removeItemFromCart(productName: string): Promise<void> {
    await this.getRemoveButton(productName).click();
  }

  async clickItemName(productName: string): Promise<void> {
    await this.getItemByName(productName)
      .locator(".inventory_item_name")
      .click();
  }

  async clickItemImage(productName: string): Promise<void> {
    await this.getItemImage(productName).click();
  }

  async addAllItemsToCart(): Promise<void> {
    const addButtons = this.page.locator("button[id^='add-to-cart']");
    const count = await addButtons.count();
    for (let i = 0; i < count; i++) {
      await addButtons.nth(i).click();
    }
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectToBeOnInventoryPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(Routes.INVENTORY));
    await expect(this.inventoryItems.first()).toBeVisible();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.inventoryItems).toHaveCount(count);
  }

  async expectAddToCartButtonVisible(productName: string): Promise<void> {
    const btn = this.getAddToCartButton(productName);
    await expect(btn).toHaveText("Add to cart");
  }

  async expectRemoveButtonVisible(productName: string): Promise<void> {
    const btn = this.getRemoveButton(productName);
    await expect(btn).toHaveText("Remove");
  }

  async expectSortedAtoZ(): Promise<void> {
    const names = await this.getItemNameLocators().allTextContents();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  }

  async expectSortedZtoA(): Promise<void> {
    const names = await this.getItemNameLocators().allTextContents();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  }

  async expectSortedPriceLowToHigh(): Promise<void> {
    const priceTexts = await this.getItemPriceLocators().allTextContents();
    const prices = priceTexts.map((p) => parseFloat(p.replace("$", "")));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  }

  async expectSortedPriceHighToLow(): Promise<void> {
    const priceTexts = await this.getItemPriceLocators().allTextContents();
    const prices = priceTexts.map((p) => parseFloat(p.replace("$", "")));
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  }
}
