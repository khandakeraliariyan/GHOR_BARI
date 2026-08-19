import { jest, test, expect, beforeEach, afterEach } from "@jest/globals";

jest.unstable_mockModule("../src/config/db.js", () => ({
  getDatabase: jest.fn()
}));

jest.unstable_mockModule("../src/models/EmailJob.js", () => ({
  EmailJobModel: {
    requeueStaleProcessingJobs: jest.fn(),
    claimDueJobs: jest.fn(),
    markSent: jest.fn(),
    markForRetry: jest.fn()
  }
}));

jest.unstable_mockModule("../src/services/emailService.js", () => ({
  sendEmail: jest.fn()
}));

jest.unstable_mockModule("../src/services/emailTemplateService.js", () => ({
  renderEmailTemplate: jest.fn()
}));

const { processPendingEmailJobs } = await import("../src/services/emailProcessorService.js");
const { getDatabase } = await import("../src/config/db.js");
const { EmailJobModel } = await import("../src/models/EmailJob.js");
const { sendEmail } = await import("../src/services/emailService.js");
const { renderEmailTemplate } = await import("../src/services/emailTemplateService.js");

beforeEach(() => {
  jest.clearAllMocks();
  getDatabase.mockReturnValue({});
});

afterEach(() => {
  jest.clearAllMocks();
});

test("returns zero processed when no email jobs are due", async () => {
  EmailJobModel.requeueStaleProcessingJobs.mockResolvedValue();
  EmailJobModel.claimDueJobs.mockResolvedValue([]);

  const result = await processPendingEmailJobs();

  expect(result).toEqual({ processed: 0 });
  expect(EmailJobModel.requeueStaleProcessingJobs).toHaveBeenCalled();
  expect(sendEmail).not.toHaveBeenCalled();
  expect(EmailJobModel.markSent).not.toHaveBeenCalled();
});

test("processes a pending job successfully and marks it as sent", async () => {
  const job = {
    _id: "job-1",
    to: "owner@example.com",
    type: "application_submitted",
    payload: { propertyTitle: "Sunny Flat" },
    attempts: 0,
    maxAttempts: 5
  };

  EmailJobModel.requeueStaleProcessingJobs.mockResolvedValue();
  EmailJobModel.claimDueJobs.mockResolvedValue([job]);
  renderEmailTemplate.mockReturnValue({ subject: "Subject", html: "<p>body</p>" });
  sendEmail.mockResolvedValue({});
  EmailJobModel.markSent.mockResolvedValue();

  const result = await processPendingEmailJobs({ limit: 1 });

  expect(result).toEqual({ processed: 1 });
  expect(sendEmail).toHaveBeenCalledWith({
    to: "owner@example.com",
    subject: "Subject",
    html: "<p>body</p>"
  });
  expect(EmailJobModel.markSent).toHaveBeenCalledWith({}, "job-1");
});

test("retries a job when email sending fails and schedules the next run", async () => {
  const job = {
    _id: "job-2",
    to: "owner@example.com",
    type: "application_submitted",
    payload: { propertyTitle: "Sunny Flat" },
    attempts: 0,
    maxAttempts: 3
  };

  EmailJobModel.requeueStaleProcessingJobs.mockResolvedValue();
  EmailJobModel.claimDueJobs.mockResolvedValue([job]);
  renderEmailTemplate.mockReturnValue({ subject: "Subject", html: "<p>body</p>" });
  sendEmail.mockRejectedValue(new Error("SMTP down"));
  EmailJobModel.markForRetry.mockResolvedValue();

  const result = await processPendingEmailJobs({ limit: 1 });

  expect(result).toEqual({ processed: 1 });
  expect(EmailJobModel.markForRetry).toHaveBeenCalledWith(
    {},
    "job-2",
    1,
    3,
    expect.any(Date),
    "SMTP down"
  );
});

test("uses the configured database instance when processing email jobs", async () => {
  const db = { custom: true };
  getDatabase.mockReturnValue(db);

  EmailJobModel.requeueStaleProcessingJobs.mockResolvedValue();
  EmailJobModel.claimDueJobs.mockResolvedValue([]);

  await processPendingEmailJobs();

  expect(getDatabase).toHaveBeenCalled();
  expect(EmailJobModel.requeueStaleProcessingJobs).toHaveBeenCalledWith(
    db,
    expect.any(Date)
  );
});
