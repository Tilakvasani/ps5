/**
 * useSettings — Central Settings Hook
 * =====================================
 * Single source of truth for all admin-controlled values.
 *
 * Strategy (no flash of defaults):
 *   1. On module load, read last-known settings from localStorage instantly
 *   2. Fetch fresh settings from the API in the background
 *   3. Save fresh values back to localStorage for next load
 *   4. Only fall back to hardcoded DEFAULTS when a key is missing from BOTH
 *      the localStorage cache AND the API response
 *
 * Result: after the very first visit, users always see real values immediately.
 */
"use client";
import { useEffect, useState } from "react";
import { publicApi } from "./api";

const LS_KEY = "zupwell-settings-cache";

/** Read the last-saved settings from localStorage synchronously (SSR-safe). */
function readLocalCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/** Persist fresh settings to localStorage so next load is instant. */
function writeLocalCache(data: Record<string, string>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

// Module-level in-memory cache (populated from localStorage on first import)
let _cache: Record<string, string> | null = readLocalCache();
let _fetchPromise: Promise<Record<string, string>> | null = null;

async function fetchSettings(): Promise<Record<string, string>> {
  // Return in-memory cache only if it came from API (not just localStorage)
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = publicApi.getSettings()
    .then(data => {
      _cache = data;
      writeLocalCache(data);
      return data;
    })
    .catch(() => _cache ?? {});
  return _fetchPromise;
}

/** Call this after admin saves settings to force a fresh fetch everywhere. */
export function invalidateSettingsCache() {
  _cache = null;
  _fetchPromise = null;
  if (typeof window !== "undefined") {
    try { localStorage.removeItem(LS_KEY); } catch {}
  }
}

/** Read the current in-memory/localStorage cache synchronously — use as useState initializer. */
export function getSettingsCache(): Record<string, string> {
  return _cache ?? {};
}

interface SiteSettings {
  // Store info
  siteName:    string;
  siteEmail:   string;
  sitePhone:   string;
  siteAddress: string;
  gstin:       string;
  stateCode:   string;
  fssai:       string;

  // Pricing
  freeShippingThreshold: number;  // e.g. 500
  defaultShippingCharge: number;  // e.g. 50
  gstRate:               number;  // e.g. 0.025 (2.5%)
  cgstRate:              number;  // e.g. 0.025
  sgstRate:              number;  // e.g. 0.025

  // Contact
  whatsapp:       string;
  supportEmail:   string;
  infoEmail:      string;
  instagram:      string;
  facebook:       string;

  // Raw settings object for anything else
  raw: Record<string, string>;

  // Loading state
  loading: boolean;
}

const DEFAULTS: Omit<SiteSettings, "raw" | "loading"> = {
  siteName:              "Zupwell",
  siteEmail:             "info@zupwell.com",
  sitePhone:             "+91 6355466208",
  siteAddress:           "Ahmedabad, Gujarat",
  gstin:                 "",
  stateCode:             "24 (Gujarat)",
  fssai:                 "",
  freeShippingThreshold: 500,
  defaultShippingCharge: 50,
  gstRate:               0.025,
  cgstRate:              0.025,
  sgstRate:              0.025,
  whatsapp:              "",
  supportEmail:          "support@zupwell.com",
  infoEmail:             "info@zupwell.com",
  instagram:             "",
  facebook:              "",
};

export function useSettings(): SiteSettings {
  // Seed from the module-level cache (already populated from localStorage)
  // so components never render with an empty raw on the very first paint.
  const [raw, setRaw] = useState<Record<string, string>>(() => _cache ?? {});
  const [loading, setLoading] = useState(() => Object.keys(_cache ?? {}).length === 0);

  useEffect(() => {
    fetchSettings().then(data => {
      setRaw(data);
      setLoading(false);
    });

    // Listen for admin settings save in other tabs — re-fetch immediately
    const onStorage = (e: StorageEvent) => {
      if (e.key === "zupwell-settings-bust") {
        invalidateSettingsCache();
        fetchSettings().then(data => {
          setRaw(data);
          setLoading(false);
        });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const n = (key: string, fallback: number) => {
    const v = raw[key];
    if (!v && v !== "0") return fallback;
    const parsed = parseFloat(v);
    return isNaN(parsed) ? fallback : parsed;
  };

  const s = (key: string, fallback: string) => raw[key] ?? fallback;

  // GST rate from settings (stored as percentage e.g. "2.5", convert to decimal)
  const gstPct = n("gst_rate", 2.5);
  const gstRate = gstPct / 100;

  return {
    siteName:              s("site_name",    DEFAULTS.siteName),
    siteEmail:             s("site_email",   DEFAULTS.siteEmail),
    sitePhone:             s("site_phone",   DEFAULTS.sitePhone),
    siteAddress:           s("site_address", DEFAULTS.siteAddress),
    gstin:                 s("site_gstin",   DEFAULTS.gstin),
    stateCode:             s("site_state_code", DEFAULTS.stateCode),
    fssai:                 s("site_fssai",   DEFAULTS.fssai),
    freeShippingThreshold: n("free_shipping_threshold", DEFAULTS.freeShippingThreshold),
    defaultShippingCharge: n("default_shipping_charge", DEFAULTS.defaultShippingCharge),
    gstRate,
    cgstRate:              gstRate / 2,  // split equally
    sgstRate:              gstRate / 2,
    whatsapp:              s("contact_whatsapp",      DEFAULTS.whatsapp),
    supportEmail:          s("contact_support_email", DEFAULTS.supportEmail),
    infoEmail:             s("contact_info_email",    DEFAULTS.infoEmail),
    instagram:             s("social_instagram",      DEFAULTS.instagram),
    facebook:              s("social_facebook",       DEFAULTS.facebook),
    raw,
    loading,
  };
}

// Helper: calculate shipping based on settings
export function calcShipping(subtotal: number, threshold: number, charge: number): number {
  return subtotal >= threshold ? 0 : charge;
}