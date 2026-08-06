import { test, expect } from "@jest/globals";

import { buildPropertyAddress, formatPropertyLocation, buildPropertySearchText } from "../src/services/propertyLocationService.js";

test("buildPropertyAddress compacts whitespace and preserves ids", () => {
  const address = buildPropertyAddress({
    division_id: "10",
    division_name: "  Dhaka   Division ",
    district_id: "20",
    district_name: " Dhaka ",
    upazila_id: "30",
    upazila_name: "Uttara",
    street: "  House  5,  Road 2  ",
  });

  expect(address).toEqual({
    division_id: "10",
    division_name: "Dhaka Division",
    district_id: "20",
    district_name: "Dhaka",
    upazila_id: "30",
    upazila_name: "Uttara",
    street: "House 5, Road 2",
  });
});

test("buildPropertyAddress defaults missing fields to null or empty text", () => {
  expect(buildPropertyAddress()).toEqual({
    division_id: null,
    division_name: "",
    district_id: null,
    district_name: "",
    upazila_id: null,
    upazila_name: "",
    street: "",
  });
});

test("formatPropertyLocation joins unique, non-empty parts in order", () => {
  const location = formatPropertyLocation({
    street: "House 5",
    upazila_name: "Uttara",
    district_name: "Dhaka",
    division_name: "Dhaka",
  });
  expect(location).toBe("House 5, Uttara, Dhaka");
});

test("formatPropertyLocation falls back to ids when names are missing", () => {
  const location = formatPropertyLocation({
    upazila_id: "upazila-1",
    district_id: "district-1",
    division_id: "division-1",
  });
  expect(location).toBe("upazila-1, district-1, division-1");
});

test("formatPropertyLocation returns empty string when nothing is provided", () => {
  expect(formatPropertyLocation()).toBe("");
});

test("buildPropertySearchText combines title, type, amenities and location in lowercase", () => {
  const searchText = buildPropertySearchText({
    title: "Modern Flat",
    overview: "Bright and spacious",
    listingType: "Rent",
    propertyType: "Flat",
    amenities: ["Lift", "Parking"],
    address: { street: "House 5", upazila_name: "Uttara", district_name: "Dhaka", division_name: "Dhaka" },
  });

  expect(searchText).toBe("modern flat bright and spacious rent flat lift parking house 5, uttara, dhaka");
});

test("buildPropertySearchText handles missing fields without throwing", () => {
  expect(buildPropertySearchText()).toBe("");
  expect(buildPropertySearchText({ title: "Only Title" })).toBe("only title");
});
