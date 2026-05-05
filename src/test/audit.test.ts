import { describe, it, expect, beforeEach } from "vitest";
import { useAudit } from "@/lib/audit";

beforeEach(() => useAudit.setState({ events: [] }));

describe("Audit log store", () => {
  it("records new events at the top with id + timestamp", () => {
    useAudit.getState().log({ type: "login", actor: "Alex", role: "client", detail: "ok" });
    const e = useAudit.getState().events[0];
    expect(e.id).toBeTruthy();
    expect(e.at).toBeTruthy();
    expect(e.type).toBe("login");
  });

  it("caps the log at 200 events", () => {
    for (let i = 0; i < 250; i++) {
      useAudit.getState().log({ type: "booking", actor: "x", role: "client", detail: `${i}` });
    }
    expect(useAudit.getState().events.length).toBe(200);
  });

  it("clear() empties the log", () => {
    useAudit.getState().log({ type: "logout", actor: "x", role: "client", detail: "" });
    useAudit.getState().clear();
    expect(useAudit.getState().events).toHaveLength(0);
  });
});
