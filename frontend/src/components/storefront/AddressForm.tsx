"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Building, Building2, Home, Briefcase, Hotel, MoreHorizontal, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

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

  const [saving, setSaving] = useState(false);

  // Pincode-first flow: user types the 6-digit PIN code, we look it up
  // against India Post and auto-fill City/State. Only once that's done do
  // we reveal the rest of the address fields (Flat/Building/Area/etc).
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  // Editing the PIN starts open unless we already have a saved address
  // (e.g. editing an existing address), in which case we show the compact
  // summary card straight away.
  const [editingPincode, setEditingPincode] = useState(!initialData?.pincode);
  // True once we've attempted a lookup for the current pincode (success or
  // failure) — this unlocks the rest of the form. We don't require the
  // lookup to succeed, so a flaky network never traps the user with no way
  // to type their address.
  const [pincodeStepDone, setPincodeStepDone] = useState(Boolean(initialData?.pincode));

  const flatInputRef = useRef<HTMLInputElement>(null);
  const pincodeInputRef = useRef<HTMLInputElement>(null);

  const pincodeValid = /^[1-9][0-9]{5}$/.test(formData.pincode.trim());
  const addressUnlocked = pincodeValid && pincodeStepDone && !editingPincode;

  // Auto-lookup City/State the moment a valid 6-digit PIN code is typed.
  useEffect(() => {
    if (!pincodeValid) {
      setPincodeStepDone(false);
      setPincodeError("");
      return;
    }
    let cancelled = false;
    setCheckingPincode(true);
    setPincodeError("");
    api.get(`/api/address/pincode-lookup`, { params: { pincode: formData.pincode.trim() } })
      .then(r => {
        if (cancelled) return;
        const data = r.data;
        if (data?.valid && (data.city || data.state)) {
          setFormData(prev => ({
            ...prev,
            city: data.city || prev.city,
            state: data.state || prev.state,
          }));
        } else {
          setPincodeError("Couldn't find this PIN code. Please double-check it, or enter City/State manually below.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Backend unreachable — don't block the user, just let them
          // fill City/State manually via the fallback fields.
          setPincodeError("Couldn't auto-detect City/State right now. Please fill them in manually below.");
        }
      })
      .finally(() => {
        if (cancelled) return;
        setCheckingPincode(false);
        setPincodeStepDone(true);
        setEditingPincode(false);
        setTimeout(() => flatInputRef.current?.focus(), 300);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.pincode]);

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
      return toast.error("Please enter Building / Office / Society Name");
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

    // 7. Live PIN Code Verification against India Post API (final safety net,
    // in case the earlier auto-lookup was skipped, e.g. offline then online).
    try {
      const pinCheckRes = await api.get(`/api/address/pincode-lookup`, { params: { pincode: pincodeClean } });
      if (pinCheckRes.data && pinCheckRes.data.valid === false) {
        setSaving(false);
        return toast.error(`PIN Code ${pincodeClean} does not exist in India. Please enter a valid PIN code.`);
      }
    } catch (e) {
      // Backend unreachable: continue if PIN code format is valid
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
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Pincode — the very first thing we ask for. Typing a valid 6-digit
          PIN auto-fills City/State; everything else (Flat/Building/Area)
          stays hidden until that's done, then collapses into a compact
          summary card with an Edit link. */}
      {(!addressUnlocked) ? (
        <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="text-xs font-bold text-slate-700 block">Pincode *</label>
          <div className="relative">
            <input
              ref={pincodeInputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={formData.pincode}
              onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, "") }))}
              className="w-full px-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-white font-mono tracking-wide"
              placeholder="Enter 6-digit pincode"
              autoFocus
            />
            {checkingPincode && (
              <Loader2 size={16} className="animate-spin text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>
          {pincodeError && (
            <p className="text-[11px] font-semibold text-amber-600">{pincodeError}</p>
          )}
          {editingPincode && initialData?.pincode && (
            <button
              type="button"
              onClick={() => { setEditingPincode(false); }}
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
                Pincode {formData.pincode}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {[formData.city, formData.state].filter(Boolean).join(", ") || "Fill City/State below"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingPincode(true)}
            className="text-xs font-bold text-[var(--or)] shrink-0 hover:underline"
          >
            Edit
          </button>
        </div>
      )}

      {/* Everything below only appears once a pincode has been entered and
          looked up — Flat/Building/Area, then Receiver details. */}
      {addressUnlocked ? (
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

      {/* Building / Office Name */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Building / Office Name *</label>
        <input
          type="text"
          required
          value={formData.buildingName}
          onChange={e => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="e.g. Pushkar Heights / Infinity Tower"
        />
      </div>

      {/* Area / Street / Locality */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1 block">Area / Street / Locality *</label>
        <input
          type="text"
          required
          value={formData.streetArea}
          onChange={e => setFormData(prev => ({ ...prev, streetArea: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--or)] bg-slate-50/50"
          placeholder="e.g. New India Colony"
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

      {/* City & State — auto-filled from the pincode lookup above, but
          always editable in case India Post got it wrong. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>

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
          Enter your pincode above to continue
        </p>
      )}
    </form>
  );
}