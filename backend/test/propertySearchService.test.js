import { test, expect } from "@jest/globals";

import { parsePropertyIntent, buildMatchedProperties } from "../src/services/propertySearchService.js";

test("parsePropertyIntent detects listing type, property type, and budget", () => {
  const intent = parsePropertyIntent("I want to rent a flat under 25000 taka near Uttara");
  expect(intent.listingType).toBe("rent");
  expect(intent.propertyType).toBe("flat");
  expect(intent.budget).toBe(25000);
});

test("parsePropertyIntent detects sale intent and room/bathroom counts", () => {
  const intent = parsePropertyIntent("Looking to buy a building with 3 bedrooms and 2 bathrooms");
  expect(intent.listingType).toBe("sale");
  expect(intent.propertyType).toBe("building");
  expect(intent.roomCount).toBe(3);
  expect(intent.bathrooms).toBe(2);
});

test("parsePropertyIntent leaves unset fields null when nothing matches", () => {
  const intent = parsePropertyIntent("Hello there");
  expect(intent.listingType).toBeNull();
  expect(intent.propertyType).toBeNull();
  expect(intent.budget).toBeNull();
  expect(intent.roomCount).toBeNull();
  expect(intent.bathrooms).toBeNull();
  expect(intent.adviceIntent).toBe(false);
});

test("parsePropertyIntent flags advice-seeking questions", () => {
  const intent = parsePropertyIntent("Which area should I live in Dhaka?");
  expect(intent.adviceIntent).toBe(true);
});

test("parsePropertyIntent extracts location tokens while dropping stop words", () => {
  const intent = parsePropertyIntent("I need a flat for rent near Gulshan under 30000");
  expect(intent.locationTokens).toContain("gulshan");
  expect(intent.locationTokens).not.toContain("need");
  expect(intent.locationTokens).not.toContain("flat");
  expect(intent.locationTokens).not.toContain("rent");
});

test("buildMatchedProperties caps results to five and fills in defaults", () => {
  const properties = Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, price: 1000 * i }));
  const matched = buildMatchedProperties(properties);
  expect(matched).toHaveLength(5);
  expect(matched[0]).toEqual({
    id: "p0",
    title: "Untitled property",
    location: "Location available in listing",
    price: 0,
    listingType: "n/a",
    propertyType: "property",
    areaSqFt: null,
  });
});
