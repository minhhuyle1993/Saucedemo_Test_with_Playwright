import { test, expect } from "../fixtures";
import { User, Routes, SortOption } from "../utils/types";

// Shared checkout data used across checkout tests
const CHECKOUT_INFO = { firstName: "Kevin", lastName: "Nguyen", postalCode: "12345" };
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


// ─────────────────────────────────────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Cart", () => {

  // TC-CART-01
  test("TC-CART-01 | Add items to the shopping cart", async ({
    authenticatedPage: inventoryPage,
  }) => {
    await inventoryPage.addItemToCart(BACKPACK);

    // Button text must change to "Remove"
    await inventoryPage.expectRemoveButtonVisible(BACKPACK);

    // Badge must increment to 1
    await inventoryPage.expectCartBadgeCount(1);
  });

  // TC-CART-02
  test("TC-CART-02 | Remove items from shopping cart at multiple entry points", async ({
    authenticatedPage: inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.addItemToCart(BIKE_LIGHT);

    // Remove from grid
    await inventoryPage.removeItemFromCart(BACKPACK);
    await inventoryPage.expectAddToCartButtonVisible(BACKPACK);
    await inventoryPage.expectCartBadgeCount(1);

    // Remove from cart view
    await inventoryPage.goToCart();
    await cartPage.removeItem(BIKE_LIGHT);
    await cartPage.expectCartToBeEmpty();
    await cartPage.expectCartBadgeCount(0);
  });

  // TC-CART-03
  test("TC-CART-03 | Cart persistence check across navigation flows", async ({
    authenticatedPage: inventoryPage,
    cartPage,
    productDetailPage,
  }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.addItemToCart(BIKE_LIGHT);

    // Step 1 – Open Cart, badge & items intact
    await inventoryPage.goToCart();
    await cartPage.expectItemCount(2);
    await cartPage.expectCartBadgeCount(2);

    // Step 2 – Continue Shopping, cart state preserved
    await cartPage.continueShopping();
    await inventoryPage.expectCartBadgeCount(2);

    // Step 3 – Navigate to product detail, cart still intact
    await inventoryPage.clickItemName(BACKPACK);
    await productDetailPage.expectCartBadgeCount(2);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Checkout
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Checkout", () => {

  // TC-CHKT-01
  test("TC-CHKT-01 | Validation of empty input fields at Checkout Step One", async ({
    authenticatedPage: inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    // Leave all fields blank and click Continue
    await checkoutStepOnePage.continue();
    await checkoutStepOnePage.expectErrorMessage("Error: First Name is required");

    // Form must stay on step one
    await checkoutStepOnePage.expectToBeOnCheckoutStepOne();
  });

  // TC-CHKT-02
  test("TC-CHKT-02 | Verify Tax and Price Summary Calculations at Checkout Step Two", async ({
    authenticatedPage: inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // Capture grid price BEFORE navigating away — inventoryPage locators
    // resolve against the live page object, which will change URL after checkout
    const gridPriceText = await inventoryPage.getItemPrice(BACKPACK).innerText();
    const gridPrice = parseFloat(gridPriceText.replace("$", ""));

    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(CHECKOUT_INFO);

    await checkoutStepTwoPage.expectToBeOnCheckoutStepTwo();
    await checkoutStepTwoPage.expectSubtotalVisible();

    // Grand Total must equal Item Total + Tax exactly
    await checkoutStepTwoPage.expectTotalMatchesSubtotalPlusTax();

    // Subtotal on step two must match the price shown on the inventory grid
    const subtotal = await checkoutStepTwoPage.getSubtotal();
    expect(subtotal).toBeCloseTo(gridPrice, 2);
  });

  // TC-CHKT-03
  test("TC-CHKT-03 | Complete order transaction successfully", async ({
    authenticatedPage: inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(CHECKOUT_INFO);
    await checkoutStepTwoPage.finish();

    // Confirmation screen must appear
    await checkoutCompletePage.expectSuccessHeader();

    // Cart badge must be cleared
    await checkoutCompletePage.expectCartBadgeCount(0);
  });

  // TC-CHKT-04
  test("TC-CHKT-04 | error_user cannot complete checkout", async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.loginAs(User.Error);
    await inventoryPage.expectToBeOnInventoryPage();

    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(CHECKOUT_INFO);
    await checkoutStepTwoPage.finish();

    // Must remain on step two — order does not complete
    await expect(page).toHaveURL(new RegExp(Routes.CHECKOUT_STEP_TWO));
    await checkoutStepTwoPage.expectFinishButtonVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Navigation", () => {

  // TC-NAVI-01
  test("TC-NAVI-01 | Burger Menu control and Reset App State execution", async ({
    authenticatedPage: inventoryPage,
  }) => {
    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.addItemToCart(BIKE_LIGHT);
    await inventoryPage.expectCartBadgeCount(2);

    // Reset App State closes the menu automatically — open menu, click Reset,
    // then navigate back to inventory so the DOM reflects the cleared state
    await inventoryPage.openMenu();
    await inventoryPage.resetAppStateLink.click();
    await inventoryPage.goto();

    // Cart badge must be gone and both buttons back to "Add to cart"
    await inventoryPage.expectCartBadgeCount(0);
    await inventoryPage.expectAddToCartButtonVisible(BACKPACK);
    await inventoryPage.expectAddToCartButtonVisible(BIKE_LIGHT);
  });

});