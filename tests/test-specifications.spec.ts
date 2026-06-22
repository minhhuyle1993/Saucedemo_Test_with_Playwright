import { test, expect } from "../fixtures";
import { User, Routes, SortOption } from "../utils/types";



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
});
