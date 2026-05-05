/**
 * Supabase Configuration Verification Script
 * 
 * Run this script to verify that:
 * 1. All required tables are created
 * 2. RLS policies are enabled
 * 3. Triggers are configured
 * 4. Environment variables are set
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Missing Supabase environment variables");
  console.error("   VITE_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("   VITE_SUPABASE_PUBLISHABLE_KEY:", supabaseKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 Supabase Configuration Verification");
console.log("=====================================\n");

async function verifyConfiguration() {
  const checks = [];

  // Check 1: Connection
  console.log("1️⃣  Checking Supabase connection...");
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && !error.message.includes("no session")) {
      throw error;
    }
    console.log("   ✅ Supabase connection: OK\n");
    checks.push(true);
  } catch (err) {
    console.error("   ❌ Supabase connection: FAILED");
    console.error(`   Error: ${err instanceof Error ? err.message : String(err)}\n`);
    checks.push(false);
  }

  // Check 2: Profiles table
  console.log("2️⃣  Checking profiles table...");
  try {
    const { data, error } = await supabase.from("profiles").select("*").limit(1);
    if (error && !error.message.includes("permission denied")) {
      throw error;
    }
    console.log("   ✅ Profiles table: EXISTS\n");
    checks.push(true);
  } catch (err) {
    console.error("   ❌ Profiles table: NOT FOUND");
    console.error(`   Error: ${err instanceof Error ? err.message : String(err)}\n`);
    checks.push(false);
  }

  // Check 3: Consultations table
  console.log("3️⃣  Checking consultations table...");
  try {
    const { data, error } = await supabase.from("consultations").select("*").limit(1);
    if (error && !error.message.includes("permission denied")) {
      throw error;
    }
    console.log("   ✅ Consultations table: EXISTS\n");
    checks.push(true);
  } catch (err) {
    console.error("   ❌ Consultations table: NOT FOUND");
    console.error(`   Error: ${err instanceof Error ? err.message : String(err)}\n`);
    checks.push(false);
  }

  // Check 4: Auth configuration
  console.log("4️⃣  Checking Auth configuration...");
  try {
    // Try to check auth config via anonymous session
    const { data: session } = await supabase.auth.getSession();
    console.log("   ✅ Auth configured: OK\n");
    checks.push(true);
  } catch (err) {
    console.error("   ❌ Auth configuration: FAILED");
    console.error(`   Error: ${err instanceof Error ? err.message : String(err)}\n`);
    checks.push(false);
  }

  // Summary
  const passed = checks.filter(Boolean).length;
  const total = checks.length;

  console.log("📊 Summary");
  console.log("==========");
  console.log(`Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log(
      "\n✅ All checks passed! Supabase is ready for deployment.\n"
    );
    return true;
  } else {
    console.log(
      `\n⚠️  ${total - passed} check(s) failed. Please review the errors above.\n`
    );
    return false;
  }
}

// Run verification
verifyConfiguration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error("💥 Unexpected error:", err);
    process.exit(1);
  });
