"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, Globe, Key, Save, Check, RefreshCw } from "lucide-react";
import { useApp, type Role } from "@/lib/store";
import { useAudit } from "@/lib/audit";
import { useNotifSettings } from "@/lib/notif-settings";

export default function SettingsPage() {
  const user = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const notifSettings = useNotifSettings();
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = () => {
    if (user) {
      setUser({ ...user, name, email });
      useAudit.getState().log({
        type: "role_switch",
        actor: name,
        role: user.role,
        detail: "Profile updated",
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const switchRole = (role: Role) => {
    if (user && user.role !== role) {
      setUser({ ...user, role });
      useAudit.getState().log({
        type: "role_switch",
        actor: user.name,
        role: role,
        detail: `Switched to ${role} view`,
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-lg rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl chip-emerald">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl">Profile</h2>
              <p className="text-sm text-muted-foreground">Your personal information</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl surface px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl surface px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saved}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-70"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </motion.div>

        {/* Role Switcher (for demo) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-lg rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl chip-amber">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl">Role Switcher</h2>
              <p className="text-sm text-muted-foreground">Switch between client and lawyer views (demo)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => switchRole("client")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                user?.role === "client"
                  ? "bg-primary text-primary-foreground"
                  : "surface hover:bg-secondary"
              }`}
            >
              Client View
            </button>
            <button
              onClick={() => switchRole("lawyer")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                user?.role === "lawyer"
                  ? "bg-primary text-primary-foreground"
                  : "surface hover:bg-secondary"
              }`}
            >
              Lawyer View
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="surface-lg rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl chip-emerald">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl">Notifications</h2>
              <p className="text-sm text-muted-foreground">Control how you receive updates</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: "email" as const, label: "Email Notifications", desc: "Receive updates via email" },
              { key: "push" as const, label: "Push Notifications", desc: "Browser push notifications" },
              { key: "sms" as const, label: "SMS Alerts", desc: "Critical alerts via SMS" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => notifSettings.toggle(item.key)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    notifSettings[item.key] ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      notifSettings[item.key] ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="surface-lg rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl chip-rose">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl">Security</h2>
              <p className="text-sm text-muted-foreground">Protect your account</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">Change Password</p>
                  <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                </div>
              </div>
              <span className="text-xs text-primary">Update</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <span className="rounded-full chip-emerald px-2 py-0.5 text-[10px]">Enabled</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
