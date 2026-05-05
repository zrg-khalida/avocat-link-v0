import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const ROUTES_DIR = join(process.cwd(), "src/routes");

function listRouteFiles(): string[] {
  return readdirSync(ROUTES_DIR)
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .map((f) => join(ROUTES_DIR, f));
}

describe("route module compile integrity", () => {
  const files = listRouteFiles();

  it("discovers route files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("parses %s without syntax errors", (file) => {
    const source = readFileSync(file, "utf8");
    expect(() =>
      parse(source, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
        errorRecovery: false,
      }),
    ).not.toThrow();
  });

  it.each(files)("has no module-scope `return` in %s", (file) => {
    const source = readFileSync(file, "utf8");
    const ast = parse(source, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    const offenders: number[] = [];
    // @ts-expect-error - traverse default interop
    const visit = traverse.default ?? traverse;
    visit(ast, {
      ReturnStatement(path: { parent: { type: string }; node: { loc?: { start: { line: number } } } }) {
        if (path.parent.type === "Program") {
          offenders.push(path.node.loc?.start.line ?? -1);
        }
      },
    });
    expect(offenders, `module-scope return in ${file} at lines ${offenders.join(",")}`).toEqual([]);
  });

  it("exports a Route from every route file (except __root convention)", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const hasRoute = /export\s+const\s+Route\b/.test(source);
      expect(hasRoute, `${file} must export const Route`).toBe(true);
    }
  });
});
