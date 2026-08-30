import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Vercel serves Next.js pages and rewrites only API traffic to FastAPI", async () => {
  const config = JSON.parse(
    await readFile(new URL("vercel.json", root), "utf8"),
  );

  assert.equal(config.framework, "nextjs");
  assert.deepEqual(config.rewrites, [
    { source: "/api/(.*)", destination: "/api/index.py" },
  ]);
  assert.equal(config.builds, undefined);
  assert.equal(config.routes, undefined);
});

test("the declared Node runtime supports the locked frontend toolchain", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("package.json", root), "utf8"),
  );

  assert.equal(packageJson.engines.node, ">=20.19.0");
});
