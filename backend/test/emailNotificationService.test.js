import { jest, test, expect, afterEach } from "@jest/globals";

jest.unstable_mockModule("../src/services/emailJobService.js", () => ({
  enqueueEmailJob: jest.fn(),
}));

const { enqueueEmailJob } = await import("../src/services/emailJobService.js");
const {
  queueApplicationSubmittedEmail,
  queueCounterOfferEmail,
  queueDealCompletedEmails,
  queueDealCancelledEmails,
} = await import("../src/services/emailNotificationService.js");

const occurredAt = new Date("2026-01-01T00:00:00.000Z");

afterEach(() => {
  enqueueEmailJob.mockReset();
});

test("queues an application-submitted email to the property owner", async () => {
  enqueueEmailJob.mockResolvedValue({ queued: true });

  const application = {
    _id: "app-1",
    owner: { email: "owner@example.com" },
    seeker: { name: "Jane" },
    propertySnapshot: { title: "Sunny Flat" },
    proposedPrice: 25000,
  };

  await queueApplicationSubmittedEmail(application, occurredAt);

  expect(enqueueEmailJob).toHaveBeenCalledTimes(1);
  const call = enqueueEmailJob.mock.calls[0][0];
  expect(call.type).toBe("application_submitted");
  expect(call.to).toBe("owner@example.com");
  expect(call.dedupeKey).toBe("application_submitted:app-1:owner@example.com:2026-01-01T00:00:00.000Z");
  expect(call.payload.propertyTitle).toBe("Sunny Flat");
  expect(call.payload.actorName).toBe("Jane");
  expect(call.payload.proposedPrice).toBe(25000);
});

test("counter offer overrides use the supplied price and message, not the application's", async () => {
  enqueueEmailJob.mockResolvedValue({ queued: true });

  const application = {
    _id: "app-1",
    seeker: { email: "seeker@example.com" },
    owner: { name: "Owner" },
    proposedPrice: 25000,
    message: "original message",
  };

  await queueCounterOfferEmail(application, occurredAt, { proposedPrice: 27000, message: "new counter" });

  const call = enqueueEmailJob.mock.calls[0][0];
  expect(call.to).toBe("seeker@example.com");
  expect(call.payload.proposedPrice).toBe(27000);
  expect(call.payload.message).toBe("new counter");
});

test("falls back to a generic payload when the property title and actor name are missing", async () => {
  enqueueEmailJob.mockResolvedValue({ queued: true });

  const application = { _id: "app-2", owner: { email: "owner@example.com" }, seeker: {} };
  await queueApplicationSubmittedEmail(application, occurredAt);

  const call = enqueueEmailJob.mock.calls[0][0];
  expect(call.payload.propertyTitle).toBe("Property");
  expect(call.payload.actorName).toBe("GhorBari User");
});

test("deal completed emails go to both the owner and the seeker with the final status", async () => {
  enqueueEmailJob.mockResolvedValue({ queued: true });

  const application = {
    _id: "app-3",
    owner: { email: "owner@example.com" },
    seeker: { email: "seeker@example.com" },
    finalPrice: 30000,
  };

  await queueDealCompletedEmails(application, occurredAt, "completed");

  expect(enqueueEmailJob).toHaveBeenCalledTimes(2);
  const recipients = enqueueEmailJob.mock.calls.map((call) => call[0].to);
  expect(recipients).toEqual(["owner@example.com", "seeker@example.com"]);
  for (const call of enqueueEmailJob.mock.calls) {
    expect(call[0].payload.finalStatus).toBe("completed");
    expect(call[0].payload.proposedPrice).toBe(30000);
  }
});

test("deal cancelled emails swallow enqueue failures instead of throwing", async () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  enqueueEmailJob.mockRejectedValue(new Error("db unavailable"));

  const application = {
    _id: "app-4",
    owner: { email: "owner@example.com" },
    seeker: { email: "seeker@example.com" },
  };

  await expect(queueDealCancelledEmails(application, occurredAt)).resolves.toBeUndefined();
  expect(enqueueEmailJob).toHaveBeenCalledTimes(2);

  consoleErrorSpy.mockRestore();
});
