import { jest, test, expect, beforeEach, afterEach } from "@jest/globals";

let createTransportMock;

beforeEach(() => {
  jest.resetModules();
  createTransportMock = jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: "msg-1" })
  }));

  jest.unstable_mockModule("nodemailer", () => ({
    default: { createTransport: createTransportMock }
  }));

  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.EMAIL_FROM;
});

afterEach(() => {
  jest.clearAllMocks();
});

test("throws when SMTP configuration is incomplete", async () => {
  const { sendEmailWithSmtp } = await import("../src/services/emailProviders/smtpProvider.js");

  await expect(
    sendEmailWithSmtp({ to: "a@b.com", subject: "x", html: "y" })
  ).rejects.toThrow("EMAIL_FROM or SMTP_USER must be configured");
  expect(createTransportMock).not.toHaveBeenCalled();
});

test("uses EMAIL_FROM when set and sends email through SMTP transport", async () => {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "smtp-user";
  process.env.SMTP_PASS = "smtp-pass";
  process.env.EMAIL_FROM = "no-reply@example.com";

  const { sendEmailWithSmtp } = await import("../src/services/emailProviders/smtpProvider.js");

  const result = await sendEmailWithSmtp({
    to: "recipient@example.com",
    subject: "Hello",
    html: "<p>ok</p>"
  });

  expect(result).toEqual({ messageId: "msg-1" });
  expect(createTransportMock).toHaveBeenCalledWith({
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: { user: "smtp-user", pass: "smtp-pass" }
  });
});

test("falls back to SMTP_USER as the from address when EMAIL_FROM is not configured", async () => {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_PORT = "465";
  process.env.SMTP_USER = "smtp-user";
  process.env.SMTP_PASS = "smtp-pass";

  const { sendEmailWithSmtp } = await import("../src/services/emailProviders/smtpProvider.js");

  await sendEmailWithSmtp({
    to: "recipient@example.com",
    subject: "Hello",
    html: "<p>ok</p>"
  });

  expect(createTransportMock).toHaveBeenCalled();
  const transporter = createTransportMock.mock.results[0].value;
  expect(transporter.sendMail).toHaveBeenCalledWith({
    from: "smtp-user",
    to: "recipient@example.com",
    subject: "Hello",
    html: "<p>ok</p>"
  });
});
