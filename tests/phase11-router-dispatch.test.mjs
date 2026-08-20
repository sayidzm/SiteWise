import assert from "node:assert/strict";
import { getRootRoute } from "../js/router.js";

assert.equal(getRootRoute("home"), "home");
assert.equal(getRootRoute("settings"), "settings");
assert.equal(getRootRoute("history/abc-123"), "history", "Path segments must not change the root route.");
assert.equal(getRootRoute("workout/completed/abc"), "workout");
assert.equal(getRootRoute("history?filter=upper"), "history", "Query strings must not break root route resolution.");
assert.equal(getRootRoute("history?filter=lower"), "history");
assert.equal(getRootRoute("history?filter=30g"), "history");

console.log("FAZ 11 router dispatch regression tests passed.");