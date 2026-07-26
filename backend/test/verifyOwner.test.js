import test from "node:test";
import assert from "node:assert/strict";

import { verifyOwner } from "../src/middleware/verifyOwner.js";

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
  };
}

test("allows an owner whose authenticated email matches the query", () => {
  const res = responseRecorder();
  let called = false;
  verifyOwner({ user: { email: "owner@example.com" }, query: { email: "owner@example.com" } }, res, () => { called = true; });
  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});

test("rejects a mismatched owner identity", () => {
  const res = responseRecorder();
  let called = false;
  verifyOwner({ user: { email: "a@example.com" }, query: { email: "b@example.com" } }, res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: "Forbidden Access" });
});
