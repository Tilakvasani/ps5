"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Building, Home, Briefcase, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface AddressFormData {
  fullName: string;
  phone: string;
  flatBlockNo: string;
  streetArea: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  label: string;
}

interface AddressFormProps {
  onSave: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  initialData?: Partial<AddressFormData> & { addressLine1?: string; addressLine2?: string };
  submitText?: string;
}

export default function AddressForm({ onSave, onCancel, initialData, submitText = "Save Address" }: AddressFormProps) {
  // Parse initial addressLine1 if flatBlockNo / streetArea are missing
  const [formData, setFormData] = useState<AddressFormData>(() => {
    let flat = initialData?.flatBlockNo || "";
    let street = initialData?.streetArea || "";
    if (!flat && !street && initialData?.addressLine1) {
      const line1 = initialData.addressLine1;
      const commaIdx = line1.indexOf(",");
      if (commaIdx > -1) {
        flat = line1.substring(0, commaIdx).trim();
        street = line1.substring(commaIdx + 1).trim();
      } else {
        flat = line1;
      }
    }
    return {
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      flatBlockNo: flat,
      streetArea: street,
      landmark: initialData?.landmark || initialData?.addressLine2 || "",
      city: initialData?.city || "Ahmedabad",
      state: initialData?.state || "Gujarat",
      pincode: initialData?.pincode || "",
      gstin: initialData?.gstin || "",
      label: initialData?.label || "home",
    };
  });

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState("");
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

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

  // Fetch Google Places Autocomplete Suggestions
  const handleStreetChange = async (val: string) => {
    setFormData(prev => ({ ...prev, streetArea: val }));
    if (!val || val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (mapsApiKey) {
      try {
        const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(val)}&components=country:in&key=${mapsApiKey}`);
        const data = await res.json();
        if (data?.predictions?.length) {
          setSuggestions(data.predictions);
          setShowSuggestions(true);
        }
      } catch (err) {
        // Fallback to basic state update without blocking UI
      }
    }
  };

  const handleSelectSuggestion = (prediction: any) => {
    setFormData(prev => ({
      ...prev,
      streetArea: prediction.description || prediction.structured_formatting?.main_text || "",
    }));
    setSuggestions([]);
    setShowSuggestions(false);

    // Fetch place details for pincode / city if available
    if (mapsApiKey && prediction.place_id) {
      fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=address_components&key=${mapsApiKey}`)
        .then(r => r.json())
        .then(data => {
          const comps = data?.result?.address_components || [];
          let city = "";
          let state = "";
          let pincode = "";
          comps.forEach((c: any) => {
            if (c.types.includes("locality") || c.types.includes("administrative_area_level_2")) city = c.long_name;
            if (c.types.includes("administrative_area_level_1")) state = c.long_name;
            if (c.types.includes("postal_code")) pincode = c.long_name;
          });
          setFormData(prev => ({
            ...prev,
            ...(city ? { city } : {}),
            ...(state ? { state } : {}),
            ...(pincode ? { pincode } : {}),
          }));
        })
        .catch(() => {});
    }
  };

  const fetchIPLocationFallback = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data?.city || data?.region || data?.postal) {
        setFormData(prev => ({
          ...prev,
          city: data.city || prev.city,
          state: data.region || prev.state,
          pincode: data.postal || prev.pincode,
        }));
        toast.success(`Location detected (${data.city || "Area"}, ${data.region || "State"})`, { id: "geo-detect" });
        return true;
      }
    } catch {}
    return false;
  };

  // Detect Current Location using Geolocation API + IP Fallback + Reverse Geocoding
  const handleDetectCurrentLocation = () => {
    setDetectingLocation(true);
    toast.loading("Detecting current location...", { id: "geo-detect" });

    if (!navigator.geolocation) {
      fetchIPLocationFallback().finally(() => setDetectingLocation(false));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Reverse geocode using Google Maps API or OpenStreetMap Geocoding
          let reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
          if (mapsApiKey) {
            reverseUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${mapsApiKey}`;
          }

          const res = await fetch(reverseUrl);
          const data = await res.json();

          let detectedFlat = "";
          let detectedStreet = "";
          let detectedCity = "";
          let detectedState = "";
          let detectedPincode = "";

          if (mapsApiKey && data?.results?.length) {
            for (const result of data.results) {
              const comps = result.address_components || [];
              comps.forEach((c: any) => {
                if (c.types.includes("premise") || c.types.includes("subpremise") || c.types.includes("building")) {
                  if (!detectedFlat) detectedFlat = c.long_name;
                }
                if (c.types.includes("route") || c.types.includes("sublocality_level_1") || c.types.includes("neighborhood")) {
                  if (!detectedStreet.includes(c.long_name)) {
                    detectedStreet += (detectedStreet ? ", " : "") + c.long_name;
                  }
                }
                if (!detectedCity && (c.types.includes("locality") || c.types.includes("administrative_area_level_2"))) {
                  detectedCity = c.long_name;
                }
                if (!detectedState && c.types.includes("administrative_area_level_1")) {
                  detectedState = c.long_name;
                }
                if (!detectedPincode && c.types.includes("postal_code")) {
                  detectedPincode = c.long_name;
                }
              });
            }
            if (!detectedStreet && data.results[0]?.formatted_address) {
              detectedStreet = data.results[0].formatted_address;
            }
          } else if (data?.address) {
            detectedFlat = data.address.building || data.address.house_number || "";
            detectedStreet = data.address.road || data.address.neighbourhood || data.address.suburb || "";
            detectedCity = data.address.city || data.address.town || data.address.village || data.address.county || "";
            detectedState = data.address.state || "";
            detectedPincode = data.address.postcode || "";
          }

          // If detectedFlat is empty, split detectedStreet or fill intelligently so flatBlockNo is not blank
          if (!detectedFlat && detectedStreet) {
            const parts = detectedStreet.split(",");
            if (parts.length > 1) {
              detectedFlat = parts[0].trim();
              detectedStreet = parts.slice(1).join(",").trim();
            } else {
              detectedFlat = detectedStreet;
            }
          }

          setFormData(prev => ({
            ...prev,
            flatBlockNo: detectedFlat || prev.flatBlockNo,
            streetArea: detectedStreet || prev.streetArea,
            city: detectedCity || prev.city || "Ahmedabad",
            state: detectedState || prev.state || "Gujarat",
            pincode: detectedPincode || prev.pincode,
          }));

          toast.success("Location detected & fields auto-filled!", { id: "geo-detect" });
        } catch (err) {
          const fallbackSuccess = await fetchIPLocationFallback();
          if (!fallbackSuccess) {
            toast.error("Could not fetch location details", { id: "geo-detect" });
          }
        } finally {
          setDetectingLocation(false);
        }
      },
      async (err) => {
        const ok = await fetchIPLocationFallback();
        if (!ok) {
          setDetectingLocation(false);
          if (err.code === 1) {
            toast.error("Location permission denied in browser", { id: "geo-detect" });
          } else {
            toast.error("Could not detect GPS location. Please enter address manually.", { id: "geo-detect" });
          }
        } else {
          setDetectingLocation(false);
        }
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 30000 }
    );
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

    // 3. Flat / House / Building Validation
    const flatClean = formData.flatBlockNo.trim();
    if (!flatClean || flatClean.length < 2) {
      return toast.error("Please enter House / Flat / Block No. & Building Name");
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

    // Combine flat/building and street into addressLine1, landmark into addressLine2
    const combinedLine1 = `${flatClean}, ${streetClean}`;
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
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top Banner: Detect Location */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-[var(--or)] shrink-0" />
          <span className="text-xs font-semibold text-slate-700">Quick Auto-Fill using GPS Location</span>
        </div>
        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={detectingLocation}
          className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[var(--or)] hover:opacity-90 px-3.5 py-2 rounded-lg transition-all shadow-sm shrink-0"
        >
          {detectingLocation ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
          {detectingLocation ? "Detecting..." : "📍 Use Current Location"}
        </button>
      </div>

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

      {/* Full Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name *</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
            placeholder="Recipient's full name"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1 block">Mobile Number (10 digits) *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
            placeholder="10-digit mobile number"
          />
        </div>
      </div>

      {/* Flat, House No, Building Name */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Flat / House No. / Building Name *</label>
        <input
          type="text"
          required
          value={formData.flatBlockNo}
          onChange={e => setFormData(prev => ({ ...prev, flatBlockNo: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="e.g. Flat 402, Block B, Pushkar Heights"
        />
      </div>

      {/* Street / Area / Locality with Google Places Suggestions */}
      <div className="relative" ref={autocompleteContainerRef}>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Area / Street / Locality *</label>
        <input
          type="text"
          required
          value={formData.streetArea}
          onChange={e => handleStreetChange(e.target.value)}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="e.g. Nikol Road, Near Devashya School"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
            {suggestions.map((p, idx) => (
              <button
                key={p.place_id || idx}
                type="button"
                onClick={() => handleSelectSuggestion(p)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-start gap-2 text-slate-700 transition-colors"
              >
                <MapPin size={14} className="text-[var(--or)] shrink-0 mt-0.5" />
                <span>{p.description}</span>
              </button>
            ))}
          </div>
        )}
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

      {/* City, State, Pincode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
    </form>
  );
}
