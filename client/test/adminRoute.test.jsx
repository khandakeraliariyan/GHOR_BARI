import React from "react";
import { describe, expect, jest, test } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import AdminRoute from "../src/PrivateRoute/AdminRoute";

const mockUseAuth = jest.fn();
const mockUseAdmin = jest.fn();
const mockShowToast = jest.fn();
const mockLogoutUser = jest.fn();

jest.mock("../src/Hooks/useAuth", () => ({
  __esModule: true,
  default: () => mockUseAuth(),
}));
jest.mock("../src/Hooks/useAdmin", () => ({
  __esModule: true,
  default: () => mockUseAdmin(),
}));
jest.mock("../src/Utilities/ToastMessage", () => ({
  showToast: (...args) => mockShowToast(...args),
}));
jest.mock("../src/Components/Loading", () => function MockLoading() {
  return <div role="status">Loading account</div>;
});

function renderAdminRoute(initialEntry = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <h1>Admin content</h1>
            </AdminRoute>
          )}
        />
        <Route path="/login" element={<h1>Login page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminRoute", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseAdmin.mockReset();
    mockShowToast.mockReset();
    mockLogoutUser.mockReset();
  });

  test("renders a loading state while auth is still resolving", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, logoutUser: mockLogoutUser });
    mockUseAdmin.mockReturnValue([undefined, true]);

    renderAdminRoute();

    expect(screen.getByRole("status")).toHaveTextContent("Loading account");
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  test("renders a loading state while the admin check is still resolving", () => {
    mockUseAuth.mockReturnValue({ user: { email: "user@example.com" }, loading: false, logoutUser: mockLogoutUser });
    mockUseAdmin.mockReturnValue([undefined, true]);

    renderAdminRoute();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  test("renders protected content for an authenticated admin", () => {
    mockUseAuth.mockReturnValue({ user: { email: "admin@example.com" }, loading: false, logoutUser: mockLogoutUser });
    mockUseAdmin.mockReturnValue([true, false]);

    renderAdminRoute();

    expect(screen.getByRole("heading", { name: "Admin content" })).toBeInTheDocument();
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  test("redirects an unauthenticated user to login without logging out", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, logoutUser: mockLogoutUser });
    mockUseAdmin.mockReturnValue([false, false]);

    renderAdminRoute();

    expect(screen.getByRole("heading", { name: "Login page" })).toBeInTheDocument();
    expect(mockLogoutUser).not.toHaveBeenCalled();
  });

  test("ejects a logged-in non-admin user: logs them out, toasts, and redirects to login", async () => {
    mockLogoutUser.mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ user: { email: "user@example.com" }, loading: false, logoutUser: mockLogoutUser });
    mockUseAdmin.mockReturnValue([false, false]);

    renderAdminRoute();

    expect(screen.getByRole("heading", { name: "Login page" })).toBeInTheDocument();

    await waitFor(() => expect(mockLogoutUser).toHaveBeenCalledTimes(1));
    expect(mockShowToast).toHaveBeenCalledWith(
      "Security: Admin privileges required. Account logged out.",
      "error",
    );
  });
});
