import { describe, it, expect } from "vitest";
import { can, homeFor, ROUTE_GUARDS } from "@/lib/rbac";

describe("RBAC matrix", () => {
  it("clients can view directory and dashboard", () => {
    expect(can("client", "view:directory")).toBe(true);
    expect(can("client", "view:dashboard")).toBe(true);
  });

  it("clients cannot view workspace or decide requests", () => {
    expect(can("client", "view:workspace")).toBe(false);
    expect(can("client", "decide:request")).toBe(false);
    expect(can("client", "unlock:vault")).toBe(false);
    expect(can("client", "generate:invoice")).toBe(false);
  });

  it("lawyers can view workspace and manage cases", () => {
    expect(can("lawyer", "view:workspace")).toBe(true);
    expect(can("lawyer", "decide:request")).toBe(true);
    expect(can("lawyer", "unlock:vault")).toBe(true);
    expect(can("lawyer", "generate:invoice")).toBe(true);
  });

  it("lawyers cannot book consultations or browse the directory", () => {
    expect(can("lawyer", "view:directory")).toBe(false);
    expect(can("lawyer", "view:dashboard")).toBe(false);
    expect(can("lawyer", "book:consultation")).toBe(false);
  });

  it("anonymous (null role) is denied everything", () => {
    expect(can(null, "view:directory")).toBe(false);
    expect(can(undefined, "view:workspace")).toBe(false);
  });

  it("audit and settings are visible to both roles", () => {
    expect(can("client", "view:audit")).toBe(true);
    expect(can("lawyer", "view:audit")).toBe(true);
    expect(can("client", "view:settings")).toBe(true);
    expect(can("lawyer", "view:settings")).toBe(true);
  });

  it("homeFor routes each role to their portal", () => {
    expect(homeFor("client")).toBe("/directory");
    expect(homeFor("lawyer")).toBe("/workspace");
  });

  it("every guarded route has a corresponding action", () => {
    for (const action of Object.values(ROUTE_GUARDS)) {
      expect(typeof action).toBe("string");
    }
  });
});
