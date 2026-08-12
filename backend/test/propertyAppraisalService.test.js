import { jest, test, expect, beforeEach, afterEach } from "@jest/globals";

jest.unstable_mockModule("../src/services/groqService.js", () => ({
  getGroqModel: jest.fn(() => "llama-3.1-8b-instant"),
  generateGroqText: jest.fn()
}));

const { generateGroqText } = await import("../src/services/groqService.js");
const {
  generatePropertyAppraisal,
  generatePropertyPriceEstimate
} = await import("../src/services/propertyAppraisalService.js");

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

test("generatePropertyAppraisal returns null for an invalid appraisal payload", async () => {
  const result = await generatePropertyAppraisal({ price: 20000, areaSqFt: 800 });
  expect(result).toBeNull();
});

test("generatePropertyAppraisal throws when AI response is not valid JSON", async () => {
  generateGroqText.mockResolvedValue("not-json");

  await expect(
    generatePropertyAppraisal({
      listingType: "rent",
      propertyType: "flat",
      price: 25000,
      areaSqFt: 800,
      roomCount: 2,
      bathrooms: 1
    })
  ).rejects.toThrow("AI appraisal returned invalid JSON");
});

test("generatePropertyAppraisal returns a normalized appraisal object with marketPosition", async () => {
  generateGroqText.mockResolvedValue(`{
    "fairPrice": 100000,
    "minPrice": 90000,
    "maxPrice": 110000,
    "confidence": "HIGH",
    "marketPosition": "fairly-priced",
    "summary": "A good property.",
    "reasoning": ["Near amenities", "Strong location"]
  }`);

  const result = await generatePropertyAppraisal({
    listingType: "sale",
    propertyType: "flat",
    price: 100000,
    areaSqFt: 1200,
    roomCount: 3,
    bathrooms: 2,
    address: { street: "Dhaka" }
  });

  expect(result.fairPrice).toBe(100000);
  expect(result.confidence).toBe("high");
  expect(result.marketPosition).toBe("fairly-priced");
  expect(result.reasoning).toEqual(["Near amenities", "Strong location"]);
  expect(result.model).toBe("llama-3.1-8b-instant");
});

test("generatePropertyPriceEstimate returns null when the price estimate payload is invalid", async () => {
  const result = await generatePropertyPriceEstimate({
    listingType: "sale",
    propertyType: "flat",
    areaSqFt: 1000,
    roomCount: 2,
    bathrooms: 1
  });
  expect(result).toBeNull();
});

test("generatePropertyPriceEstimate normalizes AI response and confidence values", async () => {
  generateGroqText.mockResolvedValue(`{
    "estimatedPrice": 85000,
    "minPrice": 80000,
    "maxPrice": 90000,
    "confidence": "HIGH",
    "reasoning": ["Good location", "Well-maintained"]
  }`);

  const result = await generatePropertyPriceEstimate({
    listingType: "sale",
    propertyType: "flat",
    areaSqFt: 1000,
    roomCount: 2,
    bathrooms: 1,
    address: { street: "Gulshan" }
  });

  expect(result.estimatedPrice).toBe(85000);
  expect(result.minPrice).toBe(80000);
  expect(result.maxPrice).toBe(90000);
  expect(result.confidence).toBe("high");
  expect(result.reasoning).toEqual(["Good location", "Well-maintained"]);
});
