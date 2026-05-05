import { describe, it, expect, beforeEach } from "vitest";
import { useNotifSettings, isMutedNow } from "@/lib/notif-settings";

beforeEach(() =>
  useNotifSettings.setState({
    enabled: { bookings: true, messages: true, billing: true, security: true, system: false },
    muteUntil: null,
    desktop: false,
    sound: true,
  })
);

describe("Notification settings", () => {
  it("toggles a channel", () => {
    useNotifSettings.getState().toggle("bookings");
    expect(useNotifSettings.getState().enabled.bookings).toBe(false);
  });

  it("isMutedNow reflects future muteUntil", () => {
    expect(isMutedNow({ muteUntil: null })).toBe(false);
    expect(isMutedNow({ muteUntil: Date.now() - 1000 })).toBe(false);
    expect(isMutedNow({ muteUntil: Date.now() + 60_000 })).toBe(true);
  });
});
