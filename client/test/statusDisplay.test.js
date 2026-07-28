import { test, expect } from "@jest/globals";

import {
  getApplicationStatusColor,
  getApplicationStatusDisplay,
  getApplicationStatusMessage,
  getPropertyStatusDisplay,
  isActiveApplicationStatus,
} from "../src/Utilities/StatusDisplay.js";

test("normalizes legacy accepted applications", () => {
  expect(getApplicationStatusDisplay("accepted")).toBe("DEAL-IN-PROGRESS");
  expect(isActiveApplicationStatus("accepted")).toBe(true);
});

test("uses property state for completed sale and rental labels", () => {
  expect(getApplicationStatusDisplay("completed", { status: "sold", listingType: "sale" })).toBe("BOUGHT");
  expect(getApplicationStatusDisplay("completed", { status: "rented", listingType: "rent" })).toBe("CURRENTLY RENTING");
  expect(getApplicationStatusMessage("completed", { status: "sold", listingType: "sale" })).toBe("You have bought this property.");
});

test("handles inconsistent completed application state safely", () => {
  const property = { status: "deal-in-progress", listingType: "sale" };
  expect(getApplicationStatusDisplay("completed", property)).toBe("DEAL-IN-PROGRESS");
  expect(getApplicationStatusMessage("completed", property)).toMatch(/in progress/i);
});

test("returns stable defaults and status colors", () => {
  expect(getPropertyStatusDisplay()).toBe("PENDING");
  expect(getPropertyStatusDisplay("active")).toBe("ACTIVE");
  expect(getApplicationStatusColor("rejected")).toMatch(/red/);
  expect(isActiveApplicationStatus("completed")).toBe(false);
});
