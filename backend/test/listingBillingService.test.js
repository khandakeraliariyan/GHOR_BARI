import { test, expect } from "@jest/globals";

import { getListingBillingConfig, getOwnerListingCount, getListingEntitlement } from "../src/services/listingBillingService.js";

test("returns default free limit and listing fee when env vars are unset", () => {
  const config = getListingBillingConfig();
  expect(config.freeLimit).toBe(3);
  expect(config.listingFeeBdt).toBe(99);
});

test("owner listing count is zero without querying when the email is missing", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  expect(await getOwnerListingCount(db, undefined)).toBe(0);
});

test("owner listing count excludes removed properties for the given owner", async () => {
  let filter;
  const db = {
    collection(name) {
      expect(name).toBe("properties");
      return { async countDocuments(value) { filter = value; return 2; } };
    },
  };
  expect(await getOwnerListingCount(db, "owner@example.com")).toBe(2);
  expect(filter).toEqual({ "owner.email": "owner@example.com", status: { $ne: "removed" } });
});

test("entitlement allows free listings under the limit", async () => {
  const db = { collection: () => ({ async countDocuments() { return 1; } }) };
  const entitlement = await getListingEntitlement(db, "owner@example.com");
  expect(entitlement).toEqual({
    currentCount: 1,
    freeLimit: 3,
    freeRemaining: 2,
    requiresPayment: false,
    listingFeeBdt: 99,
  });
});

test("entitlement requires payment once the free limit is reached", async () => {
  const db = { collection: () => ({ async countDocuments() { return 3; } }) };
  const entitlement = await getListingEntitlement(db, "owner@example.com");
  expect(entitlement.freeRemaining).toBe(0);
  expect(entitlement.requiresPayment).toBe(true);
});

test("entitlement never reports negative free remaining beyond the limit", async () => {
  const db = { collection: () => ({ async countDocuments() { return 10; } }) };
  const entitlement = await getListingEntitlement(db, "owner@example.com");
  expect(entitlement.freeRemaining).toBe(0);
  expect(entitlement.requiresPayment).toBe(true);
});
