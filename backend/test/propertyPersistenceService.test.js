import { jest, test, expect, beforeEach, afterEach } from "@jest/globals";

jest.unstable_mockModule("../src/services/propertyAppraisalService.js", () => ({
  generatePropertyAppraisal: jest.fn()
}));

const { generatePropertyAppraisal } = await import("../src/services/propertyAppraisalService.js");
const { buildPropertyDocument, createPropertyRecord } = await import("../src/services/propertyPersistenceService.js");

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

test("buildPropertyDocument normalizes a flat payload and attaches owner metadata", () => {
  const property = buildPropertyDocument(
    {
      title: "Test Flat",
      listingType: "rent",
      propertyType: "flat",
      price: "15000",
      areaSqFt: "600",
      roomCount: "2",
      bathrooms: "1",
      address: {
        street: "  House 5  ",
        upazila_name: "Uttara"
      },
      images: ["img1.png"],
      amenities: ["lift", "parking"],
      overview: "A nice flat"
    },
    {
      uid: "owner-1",
      name: "Owner Name",
      email: "owner@example.com",
      photoURL: "https://example.com/avatar.png",
      isVerified: true
    }
  );

  expect(property.title).toBe("Test Flat");
  expect(property.price).toBe(15000);
  expect(property.roomCount).toBe(2);
  expect(property.bathrooms).toBe(1);
  expect(property.address.street).toBe("House 5");
  expect(property.owner.email).toBe("owner@example.com");
  expect(property.isOwnerVerified).toBe(true);
  expect(property.aiAppraisal).toBeUndefined();
});

test("buildPropertyDocument includes building-specific fields when propertyType is building", () => {
  const property = buildPropertyDocument(
    {
      title: "Test Building",
      listingType: "sale",
      propertyType: "building",
      price: 5000000,
      areaSqFt: 4000,
      floorCount: 5,
      totalUnits: 12
    },
    { uid: "owner-2", name: "Owner", email: "owner2@example.com" }
  );

  expect(property.floorCount).toBe(5);
  expect(property.totalUnits).toBe(12);
  expect(property.roomCount).toBeUndefined();
  expect(property.bathrooms).toBeUndefined();
});

test("createPropertyRecord saves the property document and returns the inserted record", async () => {
  const insertedId = "property-1";
  const db = {
    collection: jest.fn(() => ({ insertOne: jest.fn(async (doc) => ({ insertedId })) }))
  };
  generatePropertyAppraisal.mockResolvedValue({ fairPrice: 1000 });

  const result = await createPropertyRecord(
    db,
    { title: "A Flat", listingType: "rent", propertyType: "flat", price: 12000, areaSqFt: 700, roomCount: 2, bathrooms: 1 },
    { uid: "owner-3", name: "Owner3", email: "owner3@example.com" }
  );

  expect(result._id).toBe(insertedId);
  expect(result.aiAppraisal).toEqual({ fairPrice: 1000 });
  expect(db.collection).toHaveBeenCalledWith("properties");
});

test("createPropertyRecord sets aiAppraisal to null when appraisal generation fails", async () => {
  const insertedId = "property-2";
  const db = {
    collection: jest.fn(() => ({ insertOne: jest.fn(async (doc) => ({ insertedId })) }))
  };
  generatePropertyAppraisal.mockRejectedValue(new Error("service unavailable"));

  const result = await createPropertyRecord(
    db,
    { title: "A Flat", listingType: "rent", propertyType: "flat", price: 12000, areaSqFt: 700, roomCount: 2, bathrooms: 1 },
    { uid: "owner-4", name: "Owner4", email: "owner4@example.com" }
  );

  expect(result._id).toBe(insertedId);
  expect(result.aiAppraisal).toBeNull();
});
