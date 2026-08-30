import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readJson = async (fileName: string) =>
  JSON.parse(await readFile(resolve(process.cwd(), fileName), "utf8"));

describe("deployment configuration", () => {
  it("serves Next.js pages and rewrites only API traffic to FastAPI", async () => {
    const config = await readJson("vercel.json");

    expect(config.framework).toBe("nextjs");
    expect(config.rewrites).toEqual([
      { source: "/api/(.*)", destination: "/api/index.py" },
    ]);
    expect(config.builds).toBeUndefined();
    expect(config.routes).toBeUndefined();
  });

  it("declares a Node runtime supported by the locked frontend toolchain", async () => {
    const packageJson = await readJson("package.json");

    expect(packageJson.engines.node).toBe(">=20.19.0");
  });
});
