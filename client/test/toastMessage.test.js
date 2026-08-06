import { jest, test, expect, beforeEach } from "@jest/globals";
import toast from "react-hot-toast";

import { showToast } from "../src/Utilities/ToastMessage.jsx";

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

beforeEach(() => {
  toast.success.mockReset();
  toast.error.mockReset();
});

test("defaults to a success toast when no type is given", () => {
  showToast("Saved successfully");

  expect(toast.success).toHaveBeenCalledTimes(1);
  expect(toast.success).toHaveBeenCalledWith(
    "Saved successfully",
    expect.objectContaining({ duration: 3000 }),
  );
  expect(toast.error).not.toHaveBeenCalled();
});

test("routes to the error toast when type is 'error'", () => {
  showToast("Something went wrong", "error");

  expect(toast.error).toHaveBeenCalledTimes(1);
  expect(toast.error).toHaveBeenCalledWith(
    "Something went wrong",
    expect.objectContaining({ duration: 3000 }),
  );
  expect(toast.success).not.toHaveBeenCalled();
});

test("applies the shared red/bold style to every toast", () => {
  showToast("Styled message", "error");

  const options = toast.error.mock.calls[0][1];
  expect(options.style).toEqual({
    padding: "16px 24px",
    fontSize: "16px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "bold",
  });
});

test("silently does nothing for an unrecognized toast type", () => {
  showToast("No-op message", "warning");

  expect(toast.success).not.toHaveBeenCalled();
  expect(toast.error).not.toHaveBeenCalled();
});
