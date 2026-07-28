import React from "react";
import { describe, expect, jest, test } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import PrivateRoute from "../src/PrivateRoute/PrivateRoute";
import { AuthContext } from "../src/Firebase/AuthProvider";

jest.mock("../src/Firebase/AuthProvider", () => {
  const ReactModule = require("react");
  return { AuthContext: ReactModule.createContext(null) };
});
jest.mock("../src/Components/Loading", () => function MockLoading() {
  return <div role="status">Loading account</div>;
});

function renderProtectedRoute(authValue, initialEntry = "/protected") {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/protected"
            element={(
              <PrivateRoute>
                <h1>Protected content</h1>
              </PrivateRoute>
            )}
          />
          <Route path="/login" element={<h1>Login page</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("PrivateRoute", () => {
  test("renders a loading state while authentication is resolving", () => {
    renderProtectedRoute({ user: null, loading: true });

    expect(screen.getByRole("status")).toHaveTextContent("Loading account");
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  test("renders protected children for an authenticated user", () => {
    renderProtectedRoute({ user: { email: "user@example.com" }, loading: false });

    expect(screen.getByRole("heading", { name: "Protected content" })).toBeInTheDocument();
  });

  test("redirects an unauthenticated user to login", () => {
    renderProtectedRoute({ user: null, loading: false });

    expect(screen.getByRole("heading", { name: "Login page" })).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });
});
