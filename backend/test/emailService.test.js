import { jest, test, expect, afterEach, beforeEach } from "@jest/globals";

jest.unstable_mockModule("../src/services/emailProviders/emailjsProvider.js", () => ({
  sendEmailWithEmailJs: jest.fn(),
}));
jest.unstable_mockModule("../src/services/emailProviders/smtpProvider.js", () => ({
  sendEmailWithSmtp: jest.fn(),
}));

const { sendEmailWithEmailJs } = await import("../src/services/emailProviders/emailjsProvider.js");
const { sendEmailWithSmtp } = await import("../src/services/emailProviders/smtpProvider.js");
const { sendEmail } = await import("../src/services/emailService.js");

const originalProvider = process.env.EMAIL_PROVIDER;

beforeEach(() => {
  sendEmailWithEmailJs.mockReset();
  sendEmailWithSmtp.mockReset();
});

afterEach(() => {
  if (originalProvider === undefined) {
    delete process.env.EMAIL_PROVIDER;
  } else {
    process.env.EMAIL_PROVIDER = originalProvider;
  }
});

test("defaults to the smtp provider when EMAIL_PROVIDER is unset", async () => {
  delete process.env.EMAIL_PROVIDER;
  sendEmailWithSmtp.mockResolvedValue({ sent: true });

  const params = { to: "user@example.com", subject: "Hi", html: "<p>Hi</p>" };
  const result = await sendEmail(params);

  expect(result).toEqual({ sent: true });
  expect(sendEmailWithSmtp).toHaveBeenCalledWith(params);
  expect(sendEmailWithEmailJs).not.toHaveBeenCalled();
});

test("routes to the emailjs provider when configured, case-insensitively with whitespace", async () => {
  process.env.EMAIL_PROVIDER = "  EmailJS  ";
  sendEmailWithEmailJs.mockResolvedValue({ sent: true });

  const params = { to: "user@example.com", subject: "Hi", html: "<p>Hi</p>" };
  await sendEmail(params);

  expect(sendEmailWithEmailJs).toHaveBeenCalledWith(params);
  expect(sendEmailWithSmtp).not.toHaveBeenCalled();
});

test("throws for an unsupported provider name", async () => {
  process.env.EMAIL_PROVIDER = "sendgrid";

  await expect(sendEmail({ to: "user@example.com", subject: "Hi", html: "<p>Hi</p>" }))
    .rejects.toThrow("Unsupported email provider: sendgrid");
});
