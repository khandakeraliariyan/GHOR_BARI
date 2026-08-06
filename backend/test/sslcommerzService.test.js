import { test, expect, afterEach } from "@jest/globals";

import { getSslCommerzConfig, buildSslCommerzCallbackUrls, buildFrontendPaymentReturnUrl } from "../src/services/sslcommerzService.js";

const ENV_KEYS = [
  "SSLCOMMERZ_STORE_ID",
  "SSLCOMMERZ_STORE_PASSWORD",
  "SSLCOMMERZ_IS_SANDBOX",
  "SSLCOMMERZ_API_BASE_URL",
  "SSLCOMMERZ_VALIDATION_API_URL",
  "BACKEND_PUBLIC_URL",
  "CLIENT_URL",
];
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function setEnv(overrides) {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
  Object.assign(process.env, overrides);
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
});

test("throws when a required credential is missing", () => {
  setEnv({ SSLCOMMERZ_STORE_PASSWORD: "pw", BACKEND_PUBLIC_URL: "http://api.test", CLIENT_URL: "http://app.test" });
  expect(() => getSslCommerzConfig()).toThrow("SSLCOMMERZ_STORE_ID is not configured");
});

test("defaults to the sandbox API base URL unless explicitly disabled", () => {
  setEnv({
    SSLCOMMERZ_STORE_ID: "store1",
    SSLCOMMERZ_STORE_PASSWORD: "pw",
    BACKEND_PUBLIC_URL: "http://api.test",
    CLIENT_URL: "http://app.test",
  });

  const config = getSslCommerzConfig();
  expect(config.isSandbox).toBe(true);
  expect(config.apiBaseUrl).toBe("https://sandbox.sslcommerz.com");
  expect(config.validationUrl).toBe("https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php");
});

test("switches to the live API base URL when sandbox mode is disabled", () => {
  setEnv({
    SSLCOMMERZ_STORE_ID: "store1",
    SSLCOMMERZ_STORE_PASSWORD: "pw",
    SSLCOMMERZ_IS_SANDBOX: "false",
    BACKEND_PUBLIC_URL: "http://api.test",
    CLIENT_URL: "http://app.test",
  });

  const config = getSslCommerzConfig();
  expect(config.isSandbox).toBe(false);
  expect(config.apiBaseUrl).toBe("https://securepay.sslcommerz.com");
});

test("strips trailing slashes from configured URLs", () => {
  setEnv({
    SSLCOMMERZ_STORE_ID: "store1",
    SSLCOMMERZ_STORE_PASSWORD: "pw",
    SSLCOMMERZ_API_BASE_URL: "https://custom.test/",
    BACKEND_PUBLIC_URL: "http://api.test/",
    CLIENT_URL: "http://app.test/",
  });

  const config = getSslCommerzConfig();
  expect(config.apiBaseUrl).toBe("https://custom.test");
  expect(config.backendPublicUrl).toBe("http://api.test");
  expect(config.clientUrl).toBe("http://app.test");
});

test("buildSslCommerzCallbackUrls encodes the draft id into every callback URL", () => {
  setEnv({
    SSLCOMMERZ_STORE_ID: "store1",
    SSLCOMMERZ_STORE_PASSWORD: "pw",
    BACKEND_PUBLIC_URL: "http://api.test",
    CLIENT_URL: "http://app.test",
  });

  const urls = buildSslCommerzCallbackUrls("draft with spaces");
  expect(urls.success_url).toBe("http://api.test/api/payments/sslcommerz/success?draftId=draft%20with%20spaces");
  expect(urls.fail_url).toBe("http://api.test/api/payments/sslcommerz/fail?draftId=draft%20with%20spaces");
  expect(urls.cancel_url).toBe("http://api.test/api/payments/sslcommerz/cancel?draftId=draft%20with%20spaces");
  expect(urls.ipn_url).toBe("http://api.test/api/payments/sslcommerz/ipn?draftId=draft%20with%20spaces");
});

test("buildFrontendPaymentReturnUrl includes the payment status and draft id as query params", () => {
  setEnv({
    SSLCOMMERZ_STORE_ID: "store1",
    SSLCOMMERZ_STORE_PASSWORD: "pw",
    BACKEND_PUBLIC_URL: "http://api.test",
    CLIENT_URL: "http://app.test",
  });

  const url = buildFrontendPaymentReturnUrl("success", "draft-1");
  expect(url).toBe("http://app.test/add-property?payment=success&draftId=draft-1");
});
