/**
 * useSettings — Central Settings Hook
 * =====================================
 * Single source of truth for all admin-controlled values.
 * Fetches from /api/settings once per session and caches in memory.
 * 
 * Usage:
 *   const { shipping, gstRate, gstin, siteName } = useSettings();
 * 
 * All values update LIVE when admin changes them — no code changes needed.
 */
"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// In-memory cache so we don't fetch on every component mount
let _cache: Record<string, string> | null = null;
let _fetchPromise: Promise<Record<string, string>> | null = null;

async function fetchSettings(): Promise<Record<string, string>> {
  if (_cache) return _cache;
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = fetch(`${API_URL}/api/settings`)
    .then(r => r.json())
    .then(data => { _cache = data; return data; })
    .catch(() => ({}));
  return _fetchPromise;
}

// Call this to force a refresh after admin saves settings
export function invalidateSettingsCache() {
  _cache = null;
  _fetchPromise = null;
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
  const [raw, setRaw] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings().then(data => {
      setRaw(data);
      setLoading(false);
    });
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