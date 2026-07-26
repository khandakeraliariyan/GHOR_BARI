import test from "node:test";
import assert from "node:assert/strict";

import {
  getApplicationStatusColor,
  getApplicationStatusDisplay,
  getApplicationStatusMessage,
  getPropertyStatusDisplay,
  isActiveApplicationStatus,
} from "../src/Utilities/StatusDisplay.js";

test("normalizes legacy accepted applications", () => {
  assert.equal(getApplicationStatusDisplay("accepted"), "DEAL-IN-PROGRESS");
  assert.equal(isActiveApplicationStatus("accepted"), true);
});

test("uses property state for completed sale and rental labels", () => {
  assert.equal(getApplicationStatusDisplay("completed", { status: "sold", listingType: "sale" }), "BOUGHT");
  assert.equal(getApplicationStatusDisplay("completed", { status: "rented", listingType: "rent" }), "CURRENTLY RENTING");
  assert.equal(getApplicationStatusMessage("completed", { status: "sold", listingType: "sale" }), "You have bought this property.");
});

test("handles inconsistent completed application state safely", () => {
  const property = { status: "deal-in-progress", listingType: "sale" };
  assert.equal(getApplicationStatusDisplay("completed", property), "DEAL-IN-PROGRESS");
  assert.match(getApplicationStatusMessage("completed", property), /in progress/i);
});

test("returns stable defaults and status colors", () => {
  assert.equal(getPropertyStatusDisplay(), "PENDING");
  assert.equal(getPropertyStatusDisplay("active"), "ACTIVE");
  assert.match(getApplicationStatusColor("rejected"), /red/);
  assert.equal(isActiveApplicationStatus("completed"), false);
});
