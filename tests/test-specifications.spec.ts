import { test, expect } from "../fixtures";
import { User, Routes, SortOption } from "../utils/types";

// Shared checkout data used across checkout tests

const BACKPACK = "Sauce Labs Backpack";
const BIKE_LIGHT = "Sauce Labs Bike Light";

// ─────────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Authentication", () => {

  // TC-AUTH-01
  test("TC-AUTH-01 | Successful login with standard baseline account", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.goto();
    await loginPage.loginAs(User.Standard);
    await inventoryPage.expectToBeOnInventoryPage();
  });

  // TC-AUTH-02
  test("TC-AUTH-02 | Failed login - Locked out account", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.loginAs(User.Locked);
    await loginPage.expectErrorMessage(
      "Epic sadface: Sorry, this user has been locked out."
    );
    await loginPage.expectToBeOnLoginPage();
  });

  // TC-AUTH-03
  test("TC-AUTH-03 | Failed login - Invalid password", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(User.Standard, "wrong_pass");
    await loginPage.expectErrorMessage(
      "Username and password do not match any user in this service"
    );
    await loginPage.expectToBeOnLoginPage();
  });

  // TC-AUTH-04
  test("TC-AUTH-04 | Failed login - Blank required fields", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.clickLogin();
    await loginPage.expectErrorMessage("Epic sadface: Username is required");
  });

  // TC-AUTH-05
  test("TC-AUTH-05 | Successful logout from application session", async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.loginAs(User.Standard);
    await inventoryPage.expectToBeOnInventoryPage();

    await inventoryPage.logout();
    await loginPage.expectToBeOnLoginPage();

    // Browser back button must not restore session
    await page.goBack();
    await loginPage.expectToBeOnLoginPage();
  });

  // TC-AUTH-06
  test("TC-AUTH-06 | Security: Direct URL access prevention without session", async ({
    loginPage,
    page,
  }) => {
    await page.goto(Routes.INVENTORY);
    // saucedemo silently redirects to the login page — no error banner on direct access
    await loginPage.expectToBeOnLoginPage();
    await expect(page).not.toHaveURL(new RegExp(Routes.INVENTORY));
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Products", () => {

  // TC-PROD-01
  test("TC-PROD-01 | Standard grid layout and product catalog display", async ({
    authenticatedPage: inventoryPage,
  }) => {
    // All 6 items must be visible
    await inventoryPage.expectItemCount(6);

    // Verify first item has all required elements
    const firstItem = inventoryPage.inventoryItems.first();
    await expect(firstItem.locator("img.inventory_item_img")).toBeVisible();
    await expect(firstItem.locator(".inventory_item_name")).toBeVisible();
    await expect(firstItem.locator(".inventory_item_desc")).toBeVisible();
    await expect(firstItem.locator(".inventory_item_price")).toBeVisible();
    await expect(firstItem.locator("button")).toHaveText("Add to cart");
  });

  // TC-PROD-02
  test("TC-PROD-02 | Verify visual/image anomalies for problem_user", async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.loginAs(User.Problem);
    await inventoryPage.expectToBeOnInventoryPage();

    // Collect all product image src values — problem_user shows broken/identical images
    const imageSrcs = await page
      .locator(".inventory_item img")
      .evaluateAll((imgs: HTMLImageElement[]) => imgs.map((i) => i.src));

    // All images pointing to same broken placeholder = bug confirmed
    const uniqueSrcs = new Set(imageSrcs);
    expect(uniqueSrcs.size).toBeLessThan(imageSrcs.length);
  });

  // TC-PROD-03
  test("TC-PROD-03 | Verify product catalog sorting options", async ({
    authenticatedPage: inventoryPage,
  }) => {
    await inventoryPage.sortBy(SortOption.NameAZ);
    await inventoryPage.expectSortedAtoZ();

    await inventoryPage.sortBy(SortOption.NameZA);
    await inventoryPage.expectSortedZtoA();

    await inventoryPage.sortBy(SortOption.PriceLowHigh);
    await inventoryPage.expectSortedPriceLowToHigh();

    await inventoryPage.sortBy(SortOption.PriceHighLow);
    await inventoryPage.expectSortedPriceHighToLow();
  });

  // TC-PROD-04
  test("TC-PROD-04 | Navigate to individual Product Detail View", async ({
    authenticatedPage: inventoryPage,
    productDetailPage,
  }) => {
    // Capture grid-level data to compare with detail page
    const gridPrice = await inventoryPage.getItemPrice(BACKPACK).innerText();
    const gridDesc = await inventoryPage.getItemDescription(BACKPACK).innerText();

    await inventoryPage.clickItemName(BACKPACK);

    await productDetailPage.expectProductName(BACKPACK);
    await productDetailPage.expectProductPrice(gridPrice);
    await expect(productDetailPage.productDescription).toHaveText(gridDesc);
    await productDetailPage.expectImageVisible();
  });

});