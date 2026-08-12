import { jest, test, expect, beforeEach, afterEach } from "@jest/globals";

jest.unstable_mockModule("axios", () => ({
  default: { post: jest.fn() }
}));

const axios = await import("axios");
const { sendEmailWithEmailJs } = await import("../src/services/emailProviders/emailjsProvider.js");

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.EMAILJS_SERVICE_ID;
  delete process.env.EMAILJS_TEMPLATE_ID;
  delete process.env.EMAILJS_PUBLIC_KEY;
  delete process.env.EMAILJS_PRIVATE_KEY;
});

afterEach(() => {
  jest.clearAllMocks();
});

test("throws when required EmailJS environment variables are missing", async () => {
  await expect(
    sendEmailWithEmailJs({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hi</p>"
    })
  ).rejects.toThrow("EmailJS configuration is incomplete");
  expect(axios.default.post).not.toHaveBeenCalled();
});

test("posts email data to the EmailJS REST API when config is valid", async () => {
  process.env.EMAILJS_SERVICE_ID = "service-123";
  process.env.EMAILJS_TEMPLATE_ID = "template-abc";
  process.env.EMAILJS_PUBLIC_KEY = "public-key";
  process.env.EMAILJS_PRIVATE_KEY = "private-token";
  axios.default.post.mockResolvedValue({ data: { success: true } });

  const result = await sendEmailWithEmailJs({
    to: "receiver@example.com",
    subject: "Test subject",
    html: "<b>OK</b>"
  });

  expect(result).toEqual({ success: true });
  expect(axios.default.post).toHaveBeenCalledWith(
    "https://api.emailjs.com/api/v1.0/email/send",
    expect.objectContaining({
      service_id: "service-123",
      template_id: "template-abc",
      user_id: "public-key",
      accessToken: "private-token",
      template_params: expect.objectContaining({
        to_email: "receiver@example.com",
        subject: "Test subject",
        html: "<b>OK</b>"
      })
    }),
    expect.objectContaining({ headers: expect.any(Object), timeout: 30000 })
  );
});
