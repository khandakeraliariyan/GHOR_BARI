import { test, expect } from "@jest/globals";

import { renderEmailTemplate } from "../src/services/emailTemplateService.js";

test("throws for an unsupported template type", () => {
  expect(() => renderEmailTemplate("not_a_real_type", {})).toThrow("Unsupported email template type: not_a_real_type");
});

test("application_submitted renders subject and key details", () => {
  const { subject, html } = renderEmailTemplate("application_submitted", {
    propertyTitle: "Sunny Flat",
    actorName: "Jane",
    proposedPrice: 25000,
    message: "I'm interested",
  });

  expect(subject).toBe("New application received for Sunny Flat");
  expect(html).toMatch(/Sunny Flat/);
  expect(html).toMatch(/Jane/);
  expect(html).toMatch(/Tk 25,000/);
  expect(html).toMatch(/I&#39;m interested/);
});

test("deal_in_progress builds a chat link using the application id", () => {
  const { html } = renderEmailTemplate("deal_in_progress", {
    propertyTitle: "Sunny Flat",
    actorName: "Jane",
    proposedPrice: 30000,
    applicationId: "app-123",
  });

  expect(html).toMatch(/\/chat\?applicationId=app-123/);
});

test("html-escapes untrusted payload text to prevent injection", () => {
  const { html } = renderEmailTemplate("application_rejected", {
    propertyTitle: "<script>alert(1)</script>",
    actorName: "Owner",
  });

  expect(html).not.toMatch(/<script>/);
  expect(html).toMatch(/&lt;script&gt;/);
});

test("formats non-numeric prices as N/A rather than throwing", () => {
  const { html } = renderEmailTemplate("counter_offer", {
    propertyTitle: "Sunny Flat",
    actorName: "Jane",
    proposedPrice: undefined,
  });

  expect(html).toMatch(/N\/A/);
});
