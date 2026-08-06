import React, { useContext } from "react";
import { test, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ComparisonContext, ComparisonProvider } from "../src/context/ComparisonContext.jsx";

function ComparisonProbe({ property }) {
  const { selectedProperties, addProperty, removeProperty, isPropertySelected, clearAllProperties, selectedCount } = useContext(ComparisonContext);

  return (
    <div>
      <p data-testid="count">{selectedCount}</p>
      <p data-testid="selected">{isPropertySelected(property._id) ? "selected" : "not-selected"}</p>
      <ul>
        {selectedProperties.map((p) => (
          <li key={p._id}>{p._id}</li>
        ))}
      </ul>
      <button onClick={() => addProperty(property)}>Add</button>
      <button onClick={() => removeProperty(property._id)}>Remove</button>
      <button onClick={clearAllProperties}>Clear</button>
    </div>
  );
}

function renderWithProvider(property) {
  return render(
    <ComparisonProvider>
      <ComparisonProbe property={property} />
    </ComparisonProvider>,
  );
}

test("starts with no properties selected", () => {
  renderWithProvider({ _id: "p1" });
  expect(screen.getByTestId("count")).toHaveTextContent("0");
  expect(screen.getByTestId("selected")).toHaveTextContent("not-selected");
});

test("addProperty adds a property and updates the count", async () => {
  const user = userEvent.setup();
  renderWithProvider({ _id: "p1" });

  await user.click(screen.getByText("Add"));

  expect(screen.getByTestId("count")).toHaveTextContent("1");
  expect(screen.getByTestId("selected")).toHaveTextContent("selected");
  expect(screen.getByText("p1")).toBeInTheDocument();
});

test("addProperty does not add the same property twice", async () => {
  const user = userEvent.setup();
  renderWithProvider({ _id: "p1" });

  await user.click(screen.getByText("Add"));
  await user.click(screen.getByText("Add"));

  expect(screen.getByTestId("count")).toHaveTextContent("1");
});

test("removeProperty removes a selected property", async () => {
  const user = userEvent.setup();
  renderWithProvider({ _id: "p1" });

  await user.click(screen.getByText("Add"));
  await user.click(screen.getByText("Remove"));

  expect(screen.getByTestId("count")).toHaveTextContent("0");
  expect(screen.getByTestId("selected")).toHaveTextContent("not-selected");
});

test("clearAllProperties empties the selection", async () => {
  const user = userEvent.setup();
  renderWithProvider({ _id: "p1" });

  await user.click(screen.getByText("Add"));
  await user.click(screen.getByText("Clear"));

  expect(screen.getByTestId("count")).toHaveTextContent("0");
});

test("caps the selection at 5 properties when added one click at a time", async () => {
  const user = userEvent.setup();

  function MultiAddProbe() {
    const { addProperty, selectedCount } = useContext(ComparisonContext);
    return (
      <div>
        <p data-testid="count">{selectedCount}</p>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button key={n} onClick={() => addProperty({ _id: `p${n}` })}>{`Add p${n}`}</button>
        ))}
      </div>
    );
  }

  render(
    <ComparisonProvider>
      <MultiAddProbe />
    </ComparisonProvider>,
  );

  for (const n of [1, 2, 3, 4, 5, 6]) {
    await user.click(screen.getByText(`Add p${n}`));
  }

  expect(screen.getByTestId("count")).toHaveTextContent("5");
});
