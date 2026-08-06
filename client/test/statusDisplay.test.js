import { test, expect } from "@jest/globals";

import {
  getApplicationStatusColor,
  getApplicationStatusDisplay,
  getApplicationStatusMessage,
  getPropertyStatusColor,
  getPropertyStatusColorAdmin,
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

test("getApplicationStatusDisplay covers every known application status", () => {
  expect(getApplicationStatusDisplay("pending")).toBe("PENDING");
  expect(getApplicationStatusDisplay("counter")).toBe("COUNTER");
  expect(getApplicationStatusDisplay("deal-in-progress")).toBe("DEAL-IN-PROGRESS");
  expect(getApplicationStatusDisplay("rejected")).toBe("REJECTED");
  expect(getApplicationStatusDisplay("withdrawn")).toBe("WITHDRAWN");
  expect(getApplicationStatusDisplay("cancelled")).toBe("CANCELLED");
});

test("getApplicationStatusDisplay falls back to an upper-cased unknown status, or PENDING when blank", () => {
  expect(getApplicationStatusDisplay("some-new-status")).toBe("SOME-NEW-STATUS");
  expect(getApplicationStatusDisplay(undefined)).toBe("PENDING");
});

test("getApplicationStatusDisplay shows COMPLETED for a completed application whose property isn't sold or rented yet", () => {
  expect(getApplicationStatusDisplay("completed", { status: "active", listingType: "sale" })).toBe("COMPLETED");
  expect(getApplicationStatusDisplay("completed")).toBe("COMPLETED");
});

test("getApplicationStatusMessage covers every known application status", () => {
  expect(getApplicationStatusMessage("pending")).toMatch(/pending review/i);
  expect(getApplicationStatusMessage("counter")).toMatch(/counter offer/i);
  expect(getApplicationStatusMessage("deal-in-progress")).toMatch(/in progress/i);
  expect(getApplicationStatusMessage("rejected")).toMatch(/rejected/i);
  expect(getApplicationStatusMessage("withdrawn")).toMatch(/withdrawn/i);
  expect(getApplicationStatusMessage("cancelled")).toMatch(/cancelled/i);
  expect(getApplicationStatusMessage("completed")).toBe("Deal has been completed.");
});

test("getApplicationStatusMessage reports the renting message for a completed rental", () => {
  expect(getApplicationStatusMessage("completed", { status: "rented", listingType: "rent" }))
    .toBe("You are currently renting this property.");
});

test("getApplicationStatusMessage falls back to an 'unknown' message for an unrecognized status", () => {
  expect(getApplicationStatusMessage(undefined)).toBe("Application status: unknown");
  expect(getApplicationStatusMessage("some-new-status")).toBe("Application status: some-new-status");
});

test("getApplicationStatusColor covers every known application status", () => {
  expect(getApplicationStatusColor("pending")).toMatch(/yellow/);
  expect(getApplicationStatusColor("counter")).toMatch(/blue/);
  expect(getApplicationStatusColor("deal-in-progress")).toMatch(/orange/);
  expect(getApplicationStatusColor("completed")).toMatch(/green/);
  expect(getApplicationStatusColor("withdrawn")).toMatch(/gray/);
  expect(getApplicationStatusColor("cancelled")).toMatch(/orange/);
  expect(getApplicationStatusColor("accepted")).toBe(getApplicationStatusColor("deal-in-progress"));
});

test("getApplicationStatusColor falls back to gray for an unrecognized status", () => {
  expect(getApplicationStatusColor("some-new-status")).toMatch(/gray/);
});

test("getPropertyStatusDisplay covers every known property status", () => {
  expect(getPropertyStatusDisplay("hidden")).toBe("HIDDEN");
  expect(getPropertyStatusDisplay("rejected")).toBe("REJECTED");
  expect(getPropertyStatusDisplay("removed")).toBe("REMOVED");
  expect(getPropertyStatusDisplay("deal-in-progress")).toBe("DEAL-IN-PROGRESS");
  expect(getPropertyStatusDisplay("sold")).toBe("SOLD");
  expect(getPropertyStatusDisplay("rented")).toBe("RENTED");
  expect(getPropertyStatusDisplay("some-new-status")).toBe("SOME-NEW-STATUS");
});

test("getPropertyStatusColor covers every known property status", () => {
  expect(getPropertyStatusColor("pending")).toMatch(/yellow/);
  expect(getPropertyStatusColor("active")).toMatch(/green/);
  expect(getPropertyStatusColor("hidden")).toMatch(/gray/);
  expect(getPropertyStatusColor("rejected")).toMatch(/red/);
  expect(getPropertyStatusColor("removed")).toMatch(/gray/);
  expect(getPropertyStatusColor("deal-in-progress")).toMatch(/blue/);
  expect(getPropertyStatusColor("sold")).toMatch(/purple/);
  expect(getPropertyStatusColor("rented")).toMatch(/purple/);
  expect(getPropertyStatusColor("some-new-status")).toMatch(/gray/);
});

test("getPropertyStatusColorAdmin uses the admin badge palette and falls back for unknown statuses", () => {
  expect(getPropertyStatusColorAdmin("active")).toMatch(/emerald/);
  expect(getPropertyStatusColorAdmin("deal-in-progress")).toMatch(/orange/);
  expect(getPropertyStatusColorAdmin("sold")).toMatch(/purple/);
  expect(getPropertyStatusColorAdmin("some-new-status")).toMatch(/gray/);
});

test("isActiveApplicationStatus recognizes pending, counter, and deal-in-progress as active", () => {
  expect(isActiveApplicationStatus("pending")).toBe(true);
  expect(isActiveApplicationStatus("counter")).toBe(true);
  expect(isActiveApplicationStatus("deal-in-progress")).toBe(true);
  expect(isActiveApplicationStatus("accepted")).toBe(true);
  expect(isActiveApplicationStatus("rejected")).toBe(false);
  expect(isActiveApplicationStatus("withdrawn")).toBe(false);
});
