"use client";

import { useEffect } from "react";

export function ReferralRedeemer() {
  useEffect(() => {
    const code = window.localStorage.getItem("pf_pending_ref");
    if (!code) return;

    async function redeem() {
      try {
        const response = await fetch("/api/invite/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const payload = await response.json().catch(() => null);

        if (response.ok && payload?.ok) {
          window.dispatchEvent(new Event("pf:referral-redeemed"));
        }

        if (response.ok || (response.status >= 400 && response.status < 500)) {
          window.localStorage.removeItem("pf_pending_ref");
        }
      } catch {
        // Keep the code so the next dashboard visit can retry safely.
      }
    }

    redeem();
  }, []);

  return null;
}
