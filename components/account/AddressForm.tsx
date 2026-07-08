"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface AddressFormProps {
  initialAddress: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
    phone?: string;
  } | null;
}

export default function AddressForm({ initialAddress }: AddressFormProps) {
  const [editing, setEditing] = useState(false);
  const [address1, setAddress1] = useState(initialAddress?.address1 || "");
  const [address2, setAddress2] = useState(initialAddress?.address2 || "");
  const [city, setCity] = useState(initialAddress?.city || "");
  const [province, setProvince] = useState(initialAddress?.province || "");
  const [zip, setZip] = useState(initialAddress?.zip || "");
  const [country, setCountry] = useState(initialAddress?.country || "India");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/me/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address1, address2, city, province, zip, country }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div>
        {success && (
          <p className="text-green-600 text-sm mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Address saved!
          </p>
        )}
        {initialAddress ? (
          <div className="text-gray-600 text-sm space-y-1">
            <p>{initialAddress.address1}</p>
            {initialAddress.address2 && <p>{initialAddress.address2}</p>}
            <p>{initialAddress.city}, {initialAddress.province} {initialAddress.zip}</p>
            <p>{initialAddress.country}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No default address saved.</p>
        )}
        <button
          onClick={() => { setEditing(true); setError(""); }}
          className="mt-3 text-sm font-semibold text-primary hover:underline"
        >
          {initialAddress ? "Edit Address" : "Add Address"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-widest">
        {initialAddress ? "Edit Address" : "Add Address"}
      </h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Address Line 1</label>
        <input
          type="text"
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Address Line 2 (Optional)</label>
        <input
          type="text"
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">State</label>
          <input
            type="text"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Pincode</label>
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-gray-600 text-sm font-semibold hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
