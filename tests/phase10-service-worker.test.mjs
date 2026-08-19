import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const source = fs.readFileSync(path.join(root, "sw.js"), "utf8");

const listeners = new Map();
const cacheEntries = new Map();
const deletedCaches = [];
let addAllAssets = [];
let skipWaitingCalled = false;
let claimCalled = false;

const appCache = {
  async addAll(assets) {
    addAllAssets = [...assets];
    cacheEntries.set("https://app.test/index.html", new Response("INDEX", { status: 200 }));
  },
  async match(request) {
    const key = typeof request === "string" ? request : request.url;
    return cacheEntries.get(key) ?? null;
  },
  async put(request, response) {
    const key = typeof request === "string" ? request : request.url;
    cacheEntries.set(key, response);
  },
};

const cachesMock = {
  async open(name) {
    assert.equal(name, "workout-tracker-sitewise-redesign-v1");
    return appCache;
  },
  async keys() {
    return ["workout-tracker-phase10-v1", "workout-tracker-sitewise-redesign-v1"];
  },
  async delete(name) {
    deletedCaches.push(name);
    return true;
  },
  async match(request) {
    const key = typeof request === "string" ? request : request.url;
    return cacheEntries.get(key) ?? null;
  },
};

const selfMock = {
  location: { origin: "https://app.test" },
  registration: { scope: "https://app.test/" },
  clients: { async claim() { claimCalled = true; } },
  async skipWaiting() { skipWaitingCalled = true; },
  addEventListener(type, handler) { listeners.set(type, handler); },
};

let networkMode = "offline";
async function fetchMock(request) {
  if (networkMode === "offline") throw new Error("offline");
  return new Response(`NETWORK:${typeof request === "string" ? request : request.url}`, { status: 200 });
}

const context = vm.createContext({
  self: selfMock,
  caches: cachesMock,
  fetch: fetchMock,
  URL,
  Response,
  Promise,
  console,
});
vm.runInContext(source, context, { filename: "sw.js" });

async function fireWaitUntil(type, event = {}) {
  let promise = Promise.resolve();
  listeners.get(type)({ ...event, waitUntil(value) { promise = Promise.resolve(value); } });
  await promise;
}

await fireWaitUntil("install");
assert.equal(skipWaitingCalled, true);
assert.ok(addAllAssets.includes("./index.html"));
assert.ok(addAllAssets.includes("./js/app.js"));

await fireWaitUntil("activate");
assert.equal(claimCalled, true);
assert.deepEqual(deletedCaches, ["workout-tracker-phase10-v1"]);

// Offline navigation must fall back to the cached app shell.
{
  let responsePromise;
  const request = { method: "GET", mode: "navigate", url: "https://app.test/history" };
  listeners.get("fetch")({ request, respondWith(value) { responsePromise = Promise.resolve(value); } });
  const response = await responsePromise;
  assert.equal(await response.text(), "INDEX");
}

// Same-origin cached static assets remain usable while offline.
{
  const request = { method: "GET", mode: "cors", url: "https://app.test/index.html?cache-bust=1" };
  let responsePromise;
  // cache.match in this mock does not implement ignoreSearch, so seed exact key for behavior test.
  cacheEntries.set(request.url, new Response("CACHED-ASSET", { status: 200 }));
  listeners.get("fetch")({ request, respondWith(value) { responsePromise = Promise.resolve(value); } });
  const response = await responsePromise;
  assert.equal(await response.text(), "CACHED-ASSET");
}

// Cross-origin requests must be ignored by the service worker handler.
{
  let responded = false;
  const request = { method: "GET", mode: "cors", url: "https://cdn.example.test/file.js" };
  listeners.get("fetch")({ request, respondWith() { responded = true; } });
  assert.equal(responded, false);
}

console.log("FAZ 10 service-worker behavior tests passed.");
