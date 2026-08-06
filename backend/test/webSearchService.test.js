import { jest, test, expect, afterEach } from "@jest/globals";

jest.unstable_mockModule("axios", () => ({
  default: { get: jest.fn() },
}));

const axios = (await import("axios")).default;
const { searchWebContext } = await import("../src/services/webSearchService.js");

afterEach(() => {
  axios.get.mockReset();
});

test("returns an empty array for a missing or non-string query without calling the API", async () => {
  expect(await searchWebContext(undefined)).toEqual([]);
  expect(await searchWebContext(123)).toEqual([]);
  expect(axios.get).not.toHaveBeenCalled();
});

test("returns the abstract summary first when present", async () => {
  axios.get.mockResolvedValue({
    data: {
      Heading: "GhorBari",
      AbstractText: "  A property   marketplace  ",
      AbstractURL: "https://example.com/ghorbari",
      RelatedTopics: [],
    },
  });

  const results = await searchWebContext("ghorbari");
  expect(results).toEqual([
    { title: "GhorBari", snippet: "A property marketplace", url: "https://example.com/ghorbari" },
  ]);
});

test("strips HTML tags from related topic snippets and derives a title from the first segment", async () => {
  axios.get.mockResolvedValue({
    data: {
      RelatedTopics: [
        { Text: "Dhaka - the <b>capital</b> of Bangladesh", FirstURL: "https://example.com/dhaka" },
      ],
    },
  });

  const results = await searchWebContext("dhaka");
  expect(results).toEqual([
    { title: "Dhaka", snippet: "Dhaka - the capital of Bangladesh", url: "https://example.com/dhaka" },
  ]);
});

test("flattens nested related topic groups", async () => {
  axios.get.mockResolvedValue({
    data: {
      RelatedTopics: [
        {
          Topics: [
            { Text: "Nested result", FirstURL: "https://example.com/nested" },
          ],
        },
      ],
    },
  });

  const results = await searchWebContext("nested");
  expect(results).toHaveLength(1);
  expect(results[0].url).toBe("https://example.com/nested");
});

test("filters out items missing a snippet or url", async () => {
  axios.get.mockResolvedValue({
    data: {
      RelatedTopics: [
        { Text: "No URL here" },
        { Text: "", FirstURL: "https://example.com/empty" },
        { Text: "Valid entry", FirstURL: "https://example.com/valid" },
      ],
    },
  });

  const results = await searchWebContext("mixed");
  expect(results).toEqual([{ title: "Valid entry", snippet: "Valid entry", url: "https://example.com/valid" }]);
});

test("caps results to the requested limit", async () => {
  axios.get.mockResolvedValue({
    data: {
      RelatedTopics: Array.from({ length: 10 }, (_, i) => ({
        Text: `Topic ${i}`,
        FirstURL: `https://example.com/${i}`,
      })),
    },
  });

  const results = await searchWebContext("topics", 3);
  expect(results).toHaveLength(3);
});
