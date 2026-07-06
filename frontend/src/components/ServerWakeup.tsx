"use client";

/**
 * ServerWakeup.tsx — Silent Keep-Alive for Render Free Tier
 * =========================================================
 * Pings both Render backends (Node API + Python Chatbot) on mount
 * and every 14 minutes to prevent cold-start spin-down.
 *
 * This component renders nothing — it's purely a side-effect.
 */

import { useEffect } from "react";

const NODE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ps5-ufm2.onrender.com";

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

function pingServers() {
  fetch(`${NODE_API_URL}/health`).catch(() => {});
}

export default function ServerWakeup() {
  useEffect(() => {
    // Immediate ping on page load
    pingServers();

    // Keep pinging every 14 minutes while tab is open
    const id = setInterval(pingServers, PING_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null; // Renders nothing
}
