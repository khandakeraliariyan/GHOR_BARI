import React from "react";
import { jest, test, expect, beforeEach, afterEach } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WishlistProvider } from "../src/context/WishlistContext.jsx";
import useWishlist from "../src/Hooks/useWishlist";
import mockUseAuth from "../src/Hooks/useAuth";

const mockAxiosSecure = {
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};
const mockGetIdToken = jest.fn().mockResolvedValue("test-token");
const mockUser = { email: "user@example.com", getIdToken: mockGetIdToken };

jest.mock("../src/Hooks/useAxiosSecure", () => ({
  __esModule: true,
  default: () => mockAxiosSecure,
}));
jest.mock("../src/Hooks/useAuth", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const GEO_RESPONSES = {
  "/divisions.json": [{ id: "1", name: "Dhaka" }],
  "/districts.json": [{ id: "10", name: "Dhaka District" }],
  "/upzillas.json": [{ id: "100", name: "Uttara" }],
  "/thanas.json": [],
};

function mockFetchOk(body) {
  return { ok: true, json: async () => body };
}

function WishlistProbe() {
  const { wishlistItems, loading, add, remove, updateNote, isInWishlist, toggle } = useWishlist();

  return (
    <div>
      <p data-testid="loading">{loading ? "loading" : "idle"}</p>
      <p data-testid="count">{wishlistItems.length}</p>
      <ul>
        {wishlistItems.map((item) => (
          <li key={item._id}>
            {item._id}|{item.addressString}|{item.wishlistNote || ""}|{item.isPremium ? "premium" : "standard"}|{item.isVerified ? "verified" : "unverified"}
          </li>
        ))}
      </ul>
      <p data-testid="in-wishlist-p1">{isInWishlist("p1") ? "yes" : "no"}</p>
      <button onClick={() => add("p2", "note")}>Add p2</button>
      <button onClick={() => remove("p1")}>Remove p1</button>
      <button onClick={() => updateNote("p1", "updated note")}>Update Note p1</button>
      <button onClick={() => toggle("p1")}>Toggle p1</button>
    </div>
  );
}

function renderWishlist() {
  return render(
    <WishlistProvider>
      <WishlistProbe />
    </WishlistProvider>,
  );
}

beforeEach(() => {
  mockAxiosSecure.get.mockReset();
  mockAxiosSecure.post.mockReset();
  mockAxiosSecure.delete.mockReset();
  mockAxiosSecure.patch.mockReset();
  mockUseAuth.mockReset();
  global.fetch = jest.fn((url) => {
    const path = Object.keys(GEO_RESPONSES).find((key) => url.includes(key));
    return Promise.resolve(mockFetchOk(GEO_RESPONSES[path] || []));
  });
});

afterEach(() => {
  delete global.fetch;
});

test("does not fetch and stays empty when there is no authenticated user", async () => {
  mockUseAuth.mockReturnValue({ user: null });

  renderWishlist();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("idle"));
  expect(screen.getByTestId("count")).toHaveTextContent("0");
  expect(mockAxiosSecure.get).not.toHaveBeenCalled();
});

test("fetches and normalizes wishlist properties, resolving readable address and premium/verified flags", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });
  mockAxiosSecure.get.mockImplementation((url) => {
    if (url === "/user-wishlist") {
      return Promise.resolve({
        data: [
          {
            _id: "p1",
            price: 120000,
            listingType: "sale",
            address: { street: "House 5", upazila_id: "100", district_id: "10", division_id: "1" },
            owner: { email: "owner@example.com" },
            isOwnerVerified: false,
          },
        ],
      });
    }
    if (url.startsWith("/users-by-emails")) {
      return Promise.resolve({ data: [{ email: "owner@example.com", nidVerified: "verified", rating: { average: 4.5 } }] });
    }
    return Promise.resolve({ data: [] });
  });

  renderWishlist();

  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
  expect(screen.getByText(/p1\|House 5, Uttara, Dhaka District, Dhaka\|\|premium\|verified/)).toBeInTheDocument();
});

test("defaults to standard, unverified when the property price is low and owner is unverified", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });
  mockAxiosSecure.get.mockImplementation((url) => {
    if (url === "/user-wishlist") {
      return Promise.resolve({
        data: [{ _id: "p1", price: 5000, listingType: "rent", owner: { email: "owner@example.com" } }],
      });
    }
    return Promise.resolve({ data: [] });
  });

  renderWishlist();

  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
  expect(screen.getByText(/p1\|\|\|standard\|unverified/)).toBeInTheDocument();
});

test("clears the wishlist and stops loading when the backend request fails", async () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  mockUseAuth.mockReturnValue({ user: mockUser });
  mockAxiosSecure.get.mockRejectedValue(new Error("network down"));

  renderWishlist();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("idle"));
  expect(screen.getByTestId("count")).toHaveTextContent("0");

  consoleErrorSpy.mockRestore();
});

test("add() posts the property and note, then refetches the wishlist", async () => {
  const user = userEvent.setup();
  mockUseAuth.mockReturnValue({ user: mockUser });
  mockAxiosSecure.get.mockResolvedValue({ data: [] });
  mockAxiosSecure.post.mockResolvedValue({ data: { success: true } });

  renderWishlist();
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("idle"));

  await user.click(screen.getByText("Add p2"));

  await waitFor(() => expect(mockAxiosSecure.post).toHaveBeenCalledWith(
    "/wishlist/add",
    { propertyId: "p2", note: "note" },
    expect.objectContaining({ headers: { Authorization: "Bearer test-token" } }),
  ));
  expect(mockAxiosSecure.get).toHaveBeenCalledTimes(2);
});

test("remove() deletes on the backend and filters the item out locally", async () => {
  const user = userEvent.setup();
  mockUseAuth.mockReturnValue({ user: mockUser });
  mockAxiosSecure.get.mockResolvedValue({
    data: [{ _id: "p1", price: 1000, listingType: "rent", owner: {} }],
  });
  mockAxiosSecure.delete.mockResolvedValue({ data: { success: true } });

  renderWishlist();
  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));

  await user.click(screen.getByText("Remove p1"));

  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
  expect(mockAxiosSecure.delete).toHaveBeenCalledWith(
    "/wishlist/p1",
    expect.objectContaining({ headers: { Authorization: "Bearer test-token" } }),
  );
});

test("updateNote() patches the backend and updates the note locally without a full refetch", async () => {
  const user = userEvent.setup();
  mockUseAuth.mockReturnValue({ user: mockUser });
  mockAxiosSecure.get.mockResolvedValue({
    data: [{ _id: "p1", price: 1000, listingType: "rent", owner: {} }],
  });
  mockAxiosSecure.patch.mockResolvedValue({ data: { success: true } });

  renderWishlist();
  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
  const getCallsBefore = mockAxiosSecure.get.mock.calls.length;

  await user.click(screen.getByText("Update Note p1"));

  await waitFor(() => expect(screen.getByText(/p1\|\|updated note\|/)).toBeInTheDocument());
  expect(mockAxiosSecure.patch).toHaveBeenCalledWith(
    "/wishlist/p1",
    { note: "updated note" },
    expect.objectContaining({ headers: { Authorization: "Bearer test-token" } }),
  );
  expect(mockAxiosSecure.get.mock.calls.length).toBe(getCallsBefore);
});

test("toggle() removes an item already in the wishlist instead of adding it again", async () => {
  const user = userEvent.setup();
  mockUseAuth.mockReturnValue({ user: mockUser });
  mockAxiosSecure.get.mockResolvedValue({
    data: [{ _id: "p1", price: 1000, listingType: "rent", owner: {} }],
  });
  mockAxiosSecure.delete.mockResolvedValue({ data: { success: true } });

  renderWishlist();
  await waitFor(() => expect(screen.getByTestId("in-wishlist-p1")).toHaveTextContent("yes"));

  await user.click(screen.getByText("Toggle p1"));

  await waitFor(() => expect(screen.getByTestId("in-wishlist-p1")).toHaveTextContent("no"));
  expect(mockAxiosSecure.delete).toHaveBeenCalledWith("/wishlist/p1", expect.anything());
  expect(mockAxiosSecure.post).not.toHaveBeenCalled();
});
