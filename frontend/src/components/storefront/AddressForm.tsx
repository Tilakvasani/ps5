"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Building, Building2, Home, Briefcase, Hotel, MoreHorizontal, CheckCircle, AlertCircle, Loader2, X, Search } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

// Loads the Google Maps JS SDK once (for the drag-pin confirm map). Safe to
// call multiple times — reuses the same <script> tag if already loading/loaded.
let googleMapsScriptPromise: Promise<void> | null = null;
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window !== "undefined" && (window as any).google?.maps) {
    return Promise.resolve();
  }
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("zw-google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
      return;
    }
    const script = document.createElement("script");
    script.id = "zw-google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return googleMapsScriptPromise;
}

interface AddressFormData {
  fullName: string;
  phone: string;
  flatBlockNo: string;
  buildingName: string;
  streetArea: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  label: string;
  customLabel: string;
  buildingType: string;
}

interface AddressFormProps {
  onSave: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  initialData?: Partial<AddressFormData> & { addressLine1?: string; addressLine2?: string };
  submitText?: string;
}

export default function AddressForm({ onSave, onCancel, initialData, submitText = "Save Address" }: AddressFormProps) {
  // Initialize form state without any hardcoded default city/state/dummy text
  const [formData, setFormData] = useState<AddressFormData>(() => {
    let flat = initialData?.flatBlockNo || "";
    let building = initialData?.buildingName || "";
    let street = initialData?.streetArea || "";
    if (!flat && !street && initialData?.addressLine1) {
      // Older saved addresses only have "flat, street" (2 parts). Newer ones
      // saved from this form will have "flat, building, street" (3 parts).
      const parts = initialData.addressLine1.split(",").map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        flat = parts[0];
        building = parts[1];
        street = parts.slice(2).join(", ");
      } else if (parts.length === 2) {
        flat = parts[0];
        street = parts[1];
      } else if (parts.length === 1) {
        street = parts[0];
      }
    }
    return {
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      flatBlockNo: flat,
      buildingName: building,
      streetArea: street,
      landmark: initialData?.landmark || initialData?.addressLine2 || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      pincode: initialData?.pincode || "",
      gstin: initialData?.gstin || "",
      label: initialData?.label || "home",
      customLabel: initialData?.customLabel || "",
      buildingType: initialData?.buildingType || "",
    };
  });

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState("");
  const [mapModal, setMapModal] = useState<{ open: boolean; lat: number; lng: number }>({ open: false, lat: 0, lng: 0 });
  const [mapLoading, setMapLoading] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchSuggestions, setMapSearchSuggestions] = useState<any[]>([]);

  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const flatInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);

  // Once street/city/pincode exist, the user has been through the location
  // step at least once — show the compact Zepto-style summary card instead
  // of the search/GPS entry UI. (Deliberately lenient: we don't require ALL
  // three, since we show inline fallback inputs below for whichever piece
  // reverse-geocoding couldn't fill in.)
  const [locationStepDone, setLocationStepDone] = useState(false);

  // A location is "confirmed" either because we have real geocoded data, OR
  // because the user has been through the GPS/search + confirm-pin step at
  // least once — even if reverse-geocoding itself came back empty. Without
  // the second half of this OR, a failed geocode lookup would permanently
  // hide the rest of the form (including the manual City/State/Pincode
  // fallback fields) with literally no way for the user to proceed.
  const locationConfirmed = locationStepDone || Boolean(formData.streetArea || formData.city || formData.pincode);

  // Fetch Maps API Key from Backend
  useEffect(() => {
    api.get("/api/address/maps-config")
      .then(r => { if (r.data?.apiKey) setMapsApiKey(r.data.apiKey); })
      .catch(() => {});
  }, []);

  // Close suggestions dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (autocompleteContainerRef.current && !autocompleteContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Top "Your Location" search box — Zepto-style. Typing here searches
  // places; picking one opens the same drag-pin confirm map used for GPS,
  // so every address (typed or detected) gets the same final confirm step.
  const handleLocationSearchChange = async (val: string) => {
    setLocationSearchQuery(val);
    if (!val || val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await api.get(`/api/address/autocomplete?input=${encodeURIComponent(val)}`);
      const predictions = res.data?.predictions || [];
      setSuggestions(predictions);
      setShowSuggestions(predictions.length > 0);
    } catch (err) {
      // Fallback without blocking UI — user can still use GPS instead
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocationSearchSuggestion = async (prediction: any) => {
    setLocationSearchQuery(prediction.description || "");
    setSuggestions([]);
    setShowSuggestions(false);

    if (!prediction.place_id) return;
    try {
      const res = await api.get(`/api/address/place-details?place_id=${prediction.place_id}`);
      const data = res.data;

      if (data?.lat != null && data?.lng != null) {
        // Open the same confirm-pin map used for GPS, centered on the
        // picked place, so the user can fine-tune before we lock it in.
        setMapModal({ open: true, lat: data.lat, lng: data.lng });
        return;
      }

      // No geocode available — fall back to filling straight from the
      // parsed address components.
      setFormData(prev => ({
        ...prev,
        streetArea: prediction.description || prediction.structured_formatting?.main_text || prev.streetArea,
        ...(data?.city ? { city: data.city } : {}),
        ...(data?.state ? { state: data.state } : {}),
        ...(data?.pincode ? { pincode: data.pincode } : {}),
      }));
      setEditingLocation(false);
      setTimeout(() => flatInputRef.current?.focus(), 300);
    } catch {
      // Nothing more we can do automatically — user can still type it in
      // via the inline fallback fields that appear below.
    }
  };

  // Shown whenever we can't get a real GPS fix — tells the user to turn GPS
  // on rather than silently guessing their address from IP (which is only
  // ever accurate to city-level and looked fake, e.g. "Ahmedabad Area").
  const promptEnableGps = (reasonMsg?: string) => {
    toast.error(
      reasonMsg || "Please turn on Location/GPS on your device to auto-fill your address.",
      { id: "geo-detect", duration: 6000 }
    );
  };

  // Calls the backend reverse-geocode route for a given lat/lng and fills the
  // form with the result. Used both right after GPS, and again if the user
  // drags the confirm-map pin to correct the spot.
  const applyReverseGeocodedAddress = async (lat: number, lng: number) => {
    try {
      const res = await api.get(`/api/address/reverse-geocode`, { params: { lat, lng } });
      const data = res.data;
      console.log("[Zupwell] reverse-geocode response:", data);

      if (data && (data.streetArea || data.city || data.state || data.pincode)) {
        setFormData(prev => ({
          ...prev,
          streetArea: data.streetArea || prev.streetArea,
          city: data.city || prev.city,
          state: data.state || prev.state,
          pincode: data.pincode || prev.pincode,
        }));
        toast.success("Location confirmed! Enter your Flat/Building name.", { id: "geo-detect" });
      } else {
        console.warn("[Zupwell] reverse-geocode returned no usable fields for", lat, lng, data);
        promptEnableGps("Couldn't detect the exact address at that spot. Please fill in City/State/Pincode manually below.");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error;
      console.error("[Zupwell] reverse-geocode request failed:", status, serverMsg, err?.message);
      promptEnableGps(
        status
          ? `Location service error (${status}${serverMsg ? ": " + serverMsg : ""}). Please fill the address manually below.`
          : "Couldn't reach the location service (network error). Please fill the address manually below."
      );
    } finally {
      // Always unlock the rest of the form after this step — even a failed
      // lookup shouldn't trap the user with no way to enter an address.
      setLocationStepDone(true);
      setEditingLocation(false);
      setLocationSearchQuery("");
      setTimeout(() => flatInputRef.current?.focus(), 300);
    }
  };

  // Detect Current Location using Geolocation API + Server-Side Reverse Geocoding
  const handleDetectCurrentLocation = () => {
    setDetectingLocation(true);
    toast.loading("Detecting GPS location...", { id: "geo-detect" });

    if (!navigator.geolocation) {
      promptEnableGps("This browser does not support GPS location.");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        toast.dismiss("geo-detect");
        setDetectingLocation(false);
        // Don't trust raw GPS text blindly — GPS can legitimately drift
        // 60m-3km depending on device/signal. Show a pin the user can drag
        // to their exact spot before we fill the form, same as Zomato/Swiggy.
        setMapModal({ open: true, lat, lng });
      },
      (err) => {
        // Note: browsers report the SAME code (1) whether the site itself was
        // blocked or the device's Location/GPS is simply switched off — so we
        // point the user at both rather than guessing which one it is.
        let reason = "Location access unavailable. Please turn on Location/GPS on your device, and make sure this site is allowed to use it, then try again.";
        if (err.code === 2) reason = "Couldn't get a GPS fix. Please turn on Location/GPS on your device and make sure you have signal, then try again.";
        if (err.code === 3) reason = "GPS request timed out. Please make sure Location/GPS is on and try again.";

        promptEnableGps(reason);
        setDetectingLocation(false);
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  };

  // Init the Google Map for the confirm-location modal. Uses the "fixed pin
  // at screen center, drag the map underneath" pattern (same as Zepto/Swiggy)
  // — easier on touch than dragging a tiny marker icon.
  useEffect(() => {
    if (!mapModal.open) return;
    const key = mapsApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!key) {
      // No Maps key configured — fall back to using the raw GPS point directly
      applyReverseGeocodedAddress(mapModal.lat, mapModal.lng);
      setMapModal(m => ({ ...m, open: false }));
      return;
    }

    let cancelled = false;
    setMapLoading(true);
    loadGoogleMapsScript(key)
      .then(() => {
        if (cancelled || !mapContainerRef.current) return;
        const google = (window as any).google;
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: mapModal.lat, lng: mapModal.lng },
          zoom: 17,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        });
        googleMapRef.current = map;
        setMapLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setMapLoading(false);
        toast.error("Couldn't load the map. Using GPS location directly.");
        applyReverseGeocodedAddress(mapModal.lat, mapModal.lng);
        setMapModal(m => ({ ...m, open: false }));
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapModal.open]);

  // Search box inside the map modal — lets the user jump the map to a typed
  // place instead of relying purely on the dragged GPS pin.
  const handleMapSearchChange = async (val: string) => {
    setMapSearchQuery(val);
    if (!val || val.length < 3) {
      setMapSearchSuggestions([]);
      return;
    }
    try {
      const res = await api.get(`/api/address/autocomplete?input=${encodeURIComponent(val)}`);
      setMapSearchSuggestions(res.data?.predictions || []);
    } catch {
      // Ignore — user can still drag the map manually
    }
  };

  const handleSelectMapSearchSuggestion = async (prediction: any) => {
    setMapSearchSuggestions([]);
    setMapSearchQuery(prediction.description || "");
    if (!prediction.place_id) return;
    try {
      const res = await api.get(`/api/address/place-details?place_id=${prediction.place_id}`);
      const data = res.data;
      if (data?.lat != null && data?.lng != null && googleMapRef.current) {
        googleMapRef.current.setCenter({ lat: data.lat, lng: data.lng });
        googleMapRef.current.setZoom(17);
      }
    } catch {
      // Ignore — user can still drag the map manually
    }
  };

  // User confirmed the pin position — re-fetch the address for wherever the
  // map is currently centered (may be the original GPS spot, or wherever
  // they dragged/searched to) and fill the form.
  const handleConfirmMapLocation = async () => {
    const map = googleMapRef.current;
    const center = map ? map.getCenter() : null;
    const lat = center ? center.lat() : mapModal.lat;
    const lng = center ? center.lng() : mapModal.lng;
    setMapModal({ open: false, lat: 0, lng: 0 });
    setMapSearchQuery("");
    setMapSearchSuggestions([]);
    setDetectingLocation(true);
    await applyReverseGeocodedAddress(lat, lng);
    setDetectingLocation(false);
  };

  const handleCancelMapLocation = () => {
    setMapModal({ open: false, lat: 0, lng: 0 });
    setMapSearchQuery("");
    setMapSearchSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Full Name Validation
    const nameClean = formData.fullName.trim();
    if (!nameClean || nameClean.length < 2) {
      return toast.error("Please enter a valid recipient full name");
    }
    if (!/^[a-zA-Z\s'.]{2,50}$/.test(nameClean)) {
      return toast.error("Full name should only contain letters and spaces");
    }

    // 2. Mobile Phone Validation
    const cleanPhone = formData.phone.replace(/[\s-]/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return toast.error("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9");
    }
    if (/^(\d)\1{9}$/.test(cleanPhone) || cleanPhone === "1234567890") {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    // 3. Flat / Floor / Building Validation
    const flatClean = formData.flatBlockNo.trim();
    if (!flatClean || flatClean.length < 1) {
      return toast.error("Please enter Flat No. / Floor");
    }
    const buildingClean = formData.buildingName.trim();
    if (!buildingClean || buildingClean.length < 2) {
      return toast.error("Please enter Building / Society Name");
    }

    // 4. Area / Street / Locality Validation
    const streetClean = formData.streetArea.trim();
    if (!streetClean || streetClean.length < 3) {
      return toast.error("Please enter Area / Street / Locality");
    }

    // 5. City & State Validation
    const cityClean = formData.city.trim();
    const stateClean = formData.state.trim();
    if (!cityClean || cityClean.length < 2) {
      return toast.error("Please enter a valid City name");
    }
    if (!stateClean || stateClean.length < 2) {
      return toast.error("Please enter a valid State name");
    }

    // 6. PIN Code Format Validation
    const pincodeClean = formData.pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(pincodeClean)) {
      return toast.error("Please enter a valid 6-digit Indian PIN code (e.g. 380001)");
    }
    if (["123456", "000000", "111111", "999999", "654321"].includes(pincodeClean)) {
      return toast.error("The PIN code entered is invalid. Please check and try again.");
    }

    setSaving(true);

    // 7. Live PIN Code Verification against India Post API
    try {
      const pinCheckRes = await fetch(`https://api.postalpincode.in/pincode/${pincodeClean}`);
      const pinCheckData = await pinCheckRes.json();
      if (Array.isArray(pinCheckData) && pinCheckData[0]?.Status === "Error") {
        setSaving(false);
        return toast.error(`PIN Code ${pincodeClean} does not exist in India. Please enter a valid PIN code.`);
      }
    } catch (e) {
      // Offline fallback: continue if PIN code format is valid
    }

    // Combine flat, building name, and street into addressLine1, landmark into addressLine2
    const combinedLine1 = `${flatClean}, ${buildingClean}, ${streetClean}`;
    const payload = {
      fullName: nameClean,
      phone: cleanPhone,
      addressLine1: combinedLine1,
      addressLine2: formData.landmark.trim() || null,
      city: cityClean,
      state: stateClean,
      pincode: pincodeClean,
      gstin: formData.gstin?.trim() || null,
      label: formData.label,
      customLabel: formData.customLabel.trim() || null,
      buildingType: formData.buildingType || null,
    };

    try {
      await onSave(payload);
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Location — Zepto-style: search or GPS first (drag-pin map confirms
          it), then collapse into a compact summary card with an Edit link.
          Everything below (street/city/state/pincode) is auto-filled and
          hidden — only Flat No./Floor + Building Name need typing. */}
      {(!locationConfirmed || editingLocation) ? (
        <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="text-xs font-bold text-slate-700 block">Your Location</label>
          <div className="relative" ref={autocompleteContainerRef}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={locationSearchQuery}
                onChange={e => handleLocationSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-white"
                placeholder="Search for area, street name..."
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                {suggestions.map((p, idx) => (
                  <button
                    key={p.place_id || idx}
                    type="button"
                    onClick={() => handleSelectLocationSearchSuggestion(p)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-start gap-2 text-slate-700 transition-colors"
                  >
                    <MapPin size={14} className="text-[var(--or)] shrink-0 mt-0.5" />
                    <span>{p.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={detectingLocation}
            className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[var(--or)] hover:opacity-90 py-2.5 rounded-lg transition-all shadow-sm"
          >
            {detectingLocation ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
            {detectingLocation ? "Detecting..." : "📍 Use Current Location"}
          </button>
          {editingLocation && (
            <button
              type="button"
              onClick={() => setEditingLocation(false)}
              className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-start gap-2 min-w-0">
            <MapPin size={16} className="text-[var(--or)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {[formData.streetArea, formData.city].filter(Boolean).join(", ") || "Location set"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {[formData.state, formData.pincode].filter(Boolean).join(" - ")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setLocationSearchQuery(""); setEditingLocation(true); }}
            className="text-xs font-bold text-[var(--or)] shrink-0 hover:underline"
          >
            Edit
          </button>
        </div>
      )}

      {/* Everything below only appears once a real location has been
          confirmed (via GPS+pin or search+pin) — this is the "zero mistake"
          guarantee: it's physically impossible to type Flat/Building/etc.
          for an address that was never actually located on the map. */}
      {locationConfirmed && !editingLocation ? (
        <>
      {/* Address Type Tag */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1.5 block">Save Address As</label>
        <div className="flex gap-2">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "work", label: "Work", icon: Briefcase },
            { id: "other", label: "Other", icon: Building },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, label: id }))}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                formData.label === id
                  ? "bg-[#0C1E39] text-white border-[#0C1E39]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Type of Building */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1.5 block">Type of Building</label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "society", label: "Society", icon: Building },
            { id: "independent_house", label: "Independent House", icon: Home },
            { id: "standalone", label: "Standalone", icon: Building2 },
            { id: "office", label: "Office", icon: Briefcase },
            { id: "hotel", label: "Hotel", icon: Hotel },
            { id: "others", label: "Others", icon: MoreHorizontal },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, buildingType: prev.buildingType === id ? "" : id }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                formData.buildingType === id
                  ? "bg-[var(--or)]/10 text-[var(--or)] border-[var(--or)]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Flat No. / Floor */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Flat No. / Floor *</label>
        <input
          ref={flatInputRef}
          type="text"
          required
          value={formData.flatBlockNo}
          onChange={e => setFormData(prev => ({ ...prev, flatBlockNo: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="e.g. Flat 402, 4th Floor"
        />
      </div>

      {/* Building Name */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Building Name *</label>
        <input
          type="text"
          required
          value={formData.buildingName}
          onChange={e => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="e.g. Pushkar Heights"
        />
      </div>

      {/* Landmark */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Landmark (Optional)</label>
        <input
          type="text"
          value={formData.landmark}
          onChange={e => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="e.g. Opposite SBI Bank"
        />
      </div>

      {/* Save as — custom nickname for this address, e.g. "Friend's House" */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Save As (Optional)</label>
        <input
          type="text"
          value={formData.customLabel}
          onChange={e => setFormData(prev => ({ ...prev, customLabel: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder={`e.g. "Friend's House"`}
        />
      </div>

      {/* City, State, Pincode — auto-filled by the location step above and
          hidden in the normal case (matches Zepto). Only shown if geocoding
          couldn't fill one of them, so the user always has a way to fix it. */}
      {(!formData.city || !formData.state || !formData.pincode) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {!formData.city && (
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
                placeholder="City"
              />
            </div>
          )}
          {!formData.state && (
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
                placeholder="State"
              />
            </div>
          )}
          {!formData.pincode && (
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Pincode (6 digits) *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, "") }))}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50 font-mono"
                placeholder="382350"
              />
            </div>
          )}
        </div>
      )}

      {/* Receiver Name */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Receiver Name *</label>
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="Recipient's full name"
        />
      </div>

      {/* Receiver Number */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Receiver Number *</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="10-digit mobile number"
        />
      </div>

      {/* GSTIN (Optional) */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">GSTIN (Optional for Tax Invoice)</label>
        <input
          type="text"
          value={formData.gstin}
          onChange={e => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50 font-mono"
          placeholder="24ABCDE1234F1Z5"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[var(--or)] hover:opacity-90 py-2.5 rounded-xl transition-all shadow-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {saving ? "Validating & Saving..." : submitText}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Cancel
          </button>
        )}
      </div>
        </>
      ) : (
        <p className="text-center text-[11px] font-semibold text-slate-400 py-1">
          Select or detect your delivery location above to continue
        </p>
      )}
    </form>

    {/* Confirm-Location Modal — Zepto/Swiggy-style: pin stays fixed at the
        center of the screen, the user drags the MAP underneath it (easier
        on touch than dragging a tiny marker), then confirms. */}
    {mapModal.open && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <span className="font-bold text-sm text-slate-800">Confirm Your Location</span>
            <button type="button" onClick={handleCancelMapLocation} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          {/* Search a different spot */}
          <div className="relative px-5 pt-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={e => handleMapSearchChange(e.target.value)}
                placeholder="Search a new address"
                className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
              />
            </div>
            {mapSearchSuggestions.length > 0 && (
              <div className="absolute z-50 left-5 right-5 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100">
                {mapSearchSuggestions.map((p, idx) => (
                  <button
                    key={p.place_id || idx}
                    type="button"
                    onClick={() => handleSelectMapSearchSuggestion(p)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-start gap-2 text-slate-700 transition-colors"
                  >
                    <MapPin size={14} className="text-[var(--or)] shrink-0 mt-0.5" />
                    <span>{p.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map with a fixed center pin — drag the map to move the pin */}
          <div className="relative mt-4 mx-5 rounded-xl overflow-hidden border border-slate-200" style={{ height: "260px" }}>
            <div ref={mapContainerRef} className="w-full h-full bg-slate-100" />
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                <Loader2 size={22} className="animate-spin text-slate-400" />
              </div>
            )}
            {/* Fixed pin + label, sits above the map, ignores clicks so the map underneath is still draggable */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: "-28px" }}>
              <div className="bg-[#0C1E39] text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg mb-1 text-center shadow-md max-w-[85%]">
                Order will be delivered here<br />Drag the map to adjust the pin
              </div>
              <MapPin size={34} className="text-[var(--or)] drop-shadow-md" fill="currentColor" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-5">
            <button
              type="button"
              onClick={handleConfirmMapLocation}
              className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[var(--or)] hover:opacity-90 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <CheckCircle size={14} /> Confirm This Location
            </button>
            <button
              type="button"
              onClick={handleCancelMapLocation}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}