// ─── Users ────────────────────────────────────────────────────────────────────

export enum User {
  Standard = "standard_user",
  Locked = "locked_out_user",
  Problem = "problem_user",
  PerformanceGlitch = "performance_glitch_user",
  Error = "error_user",
  Visual = "visual_user",
}

export const PASSWORD = "secret_sauce";

// ─── Sort Options ─────────────────────────────────────────────────────────────

export enum SortOption {
  NameAZ = "az",
  NameZA = "za",
  PriceLowHigh = "lohi",
  PriceHighLow = "hilo",
}

export const SortOptionLabel: Record<SortOption, string> = {
  [SortOption.NameAZ]: "Name (A to Z)",
  [SortOption.NameZA]: "Name (Z to A)",
  [SortOption.PriceLowHigh]: "Price (low to high)",
  [SortOption.PriceHighLow]: "Price (high to low)",
};

// ─── Routes ───────────────────────────────────────────────────────────────────

export const Routes = {
  LOGIN: "/",
  INVENTORY: "/inventory.html",
  CART: "/cart.html",
  CHECKOUT_STEP_ONE: "/checkout-step-one.html",
  CHECKOUT_STEP_TWO: "/checkout-step-two.html",
  CHECKOUT_COMPLETE: "/checkout-complete.html",
} as const;

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  name: string;
  description?: string;
  price: number;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}
