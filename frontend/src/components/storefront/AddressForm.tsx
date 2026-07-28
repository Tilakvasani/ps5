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
  initialData?: Partial<AddressFormData>;
  submitText?: string;
}

export default function AddressForm({ onSave, onCancel, initialData, submitText = "Save Address" }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    flatBlockNo: initialData?.flatBlockNo || "",
    streetArea: initialData?.streetArea || "",
    landmark: initialData?.landmark || "",
    city: initialData?.city || "Ahmedabad",
    state: initialData?.state || "Gujarat",
    pincode: initialData?.pincode || "",
    gstin: initialData?.gstin || "",
    label: initialData?.label || "home",
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
            if (c.types.includes("locality")) city = c.long_name;
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

  // Detect Current Location using Geolocation API + Reverse Geocoding
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    toast.loading("Detecting current location...", { id: "geo-detect" });

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

          let detectedStreet = "";
          let detectedCity = "";
          let detectedState = "";
          let detectedPincode = "";

          if (mapsApiKey && data?.results?.[0]) {
            const comps = data.results[0].address_components || [];
            comps.forEach((c: any) => {
              if (c.types.includes("route") || c.types.includes("sublocality")) detectedStreet += c.long_name + ", ";
              if (c.types.includes("locality")) detectedCity = c.long_name;
              if (c.types.includes("administrative_area_level_1")) detectedState = c.long_name;
              if (c.types.includes("postal_code")) detectedPincode = c.long_name;
            });
            detectedStreet = data.results[0].formatted_address || detectedStreet;
          } else if (data?.address) {
            detectedStreet = data.address.road || data.address.suburb || data.address.neighbourhood || "";
            detectedCity = data.address.city || data.address.town || data.address.village || "Ahmedabad";
            detectedState = data.address.state || "Gujarat";
            detectedPincode = data.address.postcode || "";
          }

          setFormData(prev => ({
            ...prev,
            streetArea: detectedStreet || prev.streetArea,
            city: detectedCity || prev.city,
            state: detectedState || prev.state,
            pincode: detectedPincode || prev.pincode,
          }));

          toast.success("Location detected successfully!", { id: "geo-detect" });
        } catch (err) {
          toast.error("Could not fetch address details for coordinates", { id: "geo-detect" });
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        toast.error("Please allow location access to auto-fill your address", { id: "geo-detect" });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.fullName.trim()) return toast.error("Enter your full name");
    if (!/^\+?\d{10,12}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      return toast.error("Enter a valid 10-digit phone number");
    }
    if (!formData.flatBlockNo.trim()) return toast.error("Enter House / Flat / Block No. & Building Name");
    if (!formData.streetArea.trim()) return toast.error("Enter Street / Area / Locality");
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      return toast.error("Enter a valid 6-digit PIN code");
    }

    setSaving(true);

    // Combine flat/building and street into addressLine1, landmark into addressLine2
    const combinedLine1 = `${formData.flatBlockNo.trim()}, ${formData.streetArea.trim()}`;
    const payload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      addressLine1: combinedLine1,
      addressLine2: formData.landmark.trim() || null,
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
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
          {saving ? "Saving..." : submitText}
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
