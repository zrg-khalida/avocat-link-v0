import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { can, type Action } from "@/lib/rbac";
import { useAudit } from "@/lib/audit";
import { AccessDenied } from "./AccessDenied";

/**
 * Wraps a page/section. If the current user lacks the required action,
 * renders <AccessDenied/> and logs an `access_denied` audit event.
 */
export function RoleGuard({
  action,
  requiredRole,
  children,
}: {
  action: Action;
  requiredRole?: "client" | "lawyer";
  children: React.ReactNode;
}) {
  const user = useApp((s) => s.user);
  const log = useAudit((s) => s.log);
  const allowed = can(user?.role, action);

  useEffect(() => {
    if (!allowed) {
      log({
        type: "access_denied",
        actor: user?.name ?? "Anonymous",
        role: user?.role ?? "anonymous",
        detail: `Blocked: ${action}`,
      });
    }
    // intentionally only run when allowed flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, action]);

  if (!allowed) return <AccessDenied requiredRole={requiredRole} />;
  return <>{children}</>;
}
