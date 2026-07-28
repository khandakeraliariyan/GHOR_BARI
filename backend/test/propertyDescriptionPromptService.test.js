import { test, expect } from "@jest/globals";

import {
  buildPropertyDescriptionPrompt,
  validatePropertyDescriptionPayload,
} from "../src/services/propertyDescriptionPromptService.js";

const validFlat = {
  title: "Modern Flat",
  listingType: "rent",
  propertyType: "flat",
  price: 25000,
  areaSqFt: 1200,
  divisionName: "Dhaka",
  districtName: "Dhaka",
  upazilaName: "Uttara",
  address: "Sector 10",
  amenities: ["Lift", "Parking"],
  roomCount: 3,
  bathrooms: 2,
};

test("accepts complete flat and building payloads", () => {
  expect(validatePropertyDescriptionPayload(validFlat)).toBeNull();
  expect(validatePropertyDescriptionPayload({
    ...validFlat,
    propertyType: "building",
    floorCount: 6,
    totalUnits: 12,
  })).toBeNull();
});

test("rejects missing required text fields", () => {
  for (const field of ["title", "listingType", "propertyType", "divisionName", "districtName", "upazilaName", "address"]) {
    expect(typeof validatePropertyDescriptionPayload({ ...validFlat, [field]: "  " })).toBe("string");
  }
});

test("rejects invalid prices, areas, and flat dimensions", () => {
  expect(validatePropertyDescriptionPayload({ ...validFlat, price: 0 })).toBe("Valid price is required");
  expect(validatePropertyDescriptionPayload({ ...validFlat, areaSqFt: "bad" })).toBe("Valid area is required");
  expect(validatePropertyDescriptionPayload({ ...validFlat, roomCount: 0 })).toBe("Valid room count is required");
  expect(validatePropertyDescriptionPayload({ ...validFlat, bathrooms: 0 })).toBe("Valid bathroom count is required");
});

test("rejects invalid building dimensions", () => {
  const building = { ...validFlat, propertyType: "building", floorCount: 2, totalUnits: 4 };
  expect(validatePropertyDescriptionPayload({ ...building, floorCount: 0 })).toBe("Valid floor count is required");
  expect(validatePropertyDescriptionPayload({ ...building, totalUnits: 0 })).toBe("Valid total unit count is required");
});

test("builds a constrained prompt using only supplied facts", () => {
  const prompt = buildPropertyDescriptionPrompt(validFlat);
  expect(prompt).toMatch(/exactly one paragraph/);
  expect(prompt).toMatch(/Modern Flat/);
  expect(prompt).toMatch(/Rooms: 3/);
  expect(prompt).toMatch(/Amenities: Lift, Parking/);
  expect(prompt).not.toMatch(/Floor count:/);
});
