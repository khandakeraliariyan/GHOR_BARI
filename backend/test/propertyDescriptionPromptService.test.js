import test from "node:test";
import assert from "node:assert/strict";

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
  assert.equal(validatePropertyDescriptionPayload(validFlat), null);
  assert.equal(validatePropertyDescriptionPayload({
    ...validFlat,
    propertyType: "building",
    floorCount: 6,
    totalUnits: 12,
  }), null);
});

test("rejects missing required text fields", () => {
  for (const field of ["title", "listingType", "propertyType", "divisionName", "districtName", "upazilaName", "address"]) {
    assert.equal(typeof validatePropertyDescriptionPayload({ ...validFlat, [field]: "  " }), "string");
  }
});

test("rejects invalid prices, areas, and flat dimensions", () => {
  assert.equal(validatePropertyDescriptionPayload({ ...validFlat, price: 0 }), "Valid price is required");
  assert.equal(validatePropertyDescriptionPayload({ ...validFlat, areaSqFt: "bad" }), "Valid area is required");
  assert.equal(validatePropertyDescriptionPayload({ ...validFlat, roomCount: 0 }), "Valid room count is required");
  assert.equal(validatePropertyDescriptionPayload({ ...validFlat, bathrooms: 0 }), "Valid bathroom count is required");
});

test("rejects invalid building dimensions", () => {
  const building = { ...validFlat, propertyType: "building", floorCount: 2, totalUnits: 4 };
  assert.equal(validatePropertyDescriptionPayload({ ...building, floorCount: 0 }), "Valid floor count is required");
  assert.equal(validatePropertyDescriptionPayload({ ...building, totalUnits: 0 }), "Valid total unit count is required");
});

test("builds a constrained prompt using only supplied facts", () => {
  const prompt = buildPropertyDescriptionPrompt(validFlat);
  assert.match(prompt, /exactly one paragraph/);
  assert.match(prompt, /Modern Flat/);
  assert.match(prompt, /Rooms: 3/);
  assert.match(prompt, /Amenities: Lift, Parking/);
  assert.doesNotMatch(prompt, /Floor count:/);
});
