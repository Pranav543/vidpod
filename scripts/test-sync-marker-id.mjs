#!/usr/bin/env node
/** Verify POST /api/markers preserves client id (undo/redo sync) */
const BASE = process.env.BASE_URL || "http://localhost:3000";
const TEST_ID = "test-restore-marker-id";

async function req(method, path, body) {
  const opts = { method, headers: {} };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  return { status: res.status, json: await res.json() };
}

let failed = 0;
function assert(name, cond) {
  if (!cond) {
    console.error("FAIL:", name);
    failed++;
  } else {
    console.log("ok:", name);
  }
}

await req("DELETE", `/api/markers/${TEST_ID}`).catch(() => {});

const { status: create, json: created } = await req("POST", "/api/markers", {
  id: TEST_ID,
  startTime: 42,
  mode: "ab",
});
assert("POST with id returns same id", create === 201 && created.id === TEST_ID);

const { status: del } = await req("DELETE", `/api/markers/${TEST_ID}`);
assert("DELETE test marker", del === 200);

const { status: restore, json: restored } = await req("POST", "/api/markers", {
  id: TEST_ID,
  startTime: 42,
  mode: "ab",
});
assert("POST restore same id after delete", restore === 201 && restored.id === TEST_ID);

await req("DELETE", `/api/markers/${TEST_ID}`);

console.log(failed ? `\n${failed} failed` : "\nMarker id sync checks passed");
process.exit(failed ? 1 : 0);
