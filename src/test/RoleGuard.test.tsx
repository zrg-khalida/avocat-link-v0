import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createRouter, createRootRoute, createRoute, createMemoryHistory, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { useApp } from "@/lib/store";
import { useAudit } from "@/lib/audit";

function renderWithRouter(ui: React.ReactNode) {
  const root = createRootRoute({ component: () => <Outlet /> });
  const index = createRoute({ getParentRoute: () => root, path: "/", component: () => <>{ui}</> });
  const login = createRoute({ getParentRoute: () => root, path: "/login", component: () => <div>login</div> });
  const directory = createRoute({ getParentRoute: () => root, path: "/directory", component: () => <div>directory</div> });
  const workspace = createRoute({ getParentRoute: () => root, path: "/workspace", component: () => <div>workspace</div> });
  const router = createRouter({
    routeTree: root.addChildren([index, login, directory, workspace]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return render(<RouterProvider router={router as never} />);
}

beforeEach(() => useAudit.setState({ events: [] }));

describe("RoleGuard", () => {
  it("renders children when role is allowed", async () => {
    useApp.setState({ user: { name: "Alex", email: "a@a", role: "client" } });
    renderWithRouter(
      <RoleGuard action="view:directory" requiredRole="client">
        <div>directory content</div>
      </RoleGuard>
    );
    expect(await screen.findByText("directory content")).toBeInTheDocument();
  });

  it("blocks wrong role and shows Access denied state", async () => {
    useApp.setState({ user: { name: "Alex", email: "a@a", role: "client" } });
    renderWithRouter(
      <RoleGuard action="view:workspace" requiredRole="lawyer">
        <div>workspace content</div>
      </RoleGuard>
    );
    expect(await screen.findByTestId("access-denied")).toBeInTheDocument();
    expect(screen.queryByText("workspace content")).not.toBeInTheDocument();
  });

  it("logs an access_denied audit event when blocked", async () => {
    useApp.setState({ user: { name: "Alex", email: "a@a", role: "client" } });
    renderWithRouter(
      <RoleGuard action="generate:invoice">
        <div>secret</div>
      </RoleGuard>
    );
    await screen.findByTestId("access-denied");
    await waitFor(() => {
      const events = useAudit.getState().events;
      expect(events.some((e) => e.type === "access_denied" && e.detail.includes("generate:invoice"))).toBe(true);
    });
  });

  it("blocks unauthenticated users", async () => {
    useApp.setState({ user: null });
    renderWithRouter(
      <RoleGuard action="view:dashboard">
        <div>dash</div>
      </RoleGuard>
    );
    expect(await screen.findByTestId("access-denied")).toBeInTheDocument();
    expect(screen.queryByText("dash")).not.toBeInTheDocument();
  });
});
