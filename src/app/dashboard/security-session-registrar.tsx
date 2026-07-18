"use client";

import { useEffect } from "react";

export function SecuritySessionRegistrar() {
  useEffect(() => {
    if (window.sessionStorage.getItem("pf_device_checked") === "1") return;
    let deviceId = window.localStorage.getItem("pf_device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      window.localStorage.setItem("pf_device_id", deviceId);
    }

    fetch("/api/account/device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    }).then((response) => {
      if (response.ok) window.sessionStorage.setItem("pf_device_checked", "1");
    }).catch(() => {});
  }, []);

  return null;
}
