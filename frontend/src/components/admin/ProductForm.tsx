"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

interface Props { productId?: number; }

export default function ProductForm({ productId }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [gstRates, setGstRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<{ variantName: string; sku: string; price: string; }[]>([]);
  const [form, setForm] = useState({
    name: "", sku: "", hsnCode: "2106", brand: "", unit: "NOS",
    categoryId: "", basePrice: "", sellingPrice: "", discountPercent: "0",
    description: "", shortDescription: "", metaTitle: "", metaDescription: "",
    isActive: true, isFeatured: false,
  });

  useEffect(() => {
    adminApi.getCategories().then(setCategories).catch(() => {});
    adminApi.getGstRates().then(setGstRates).catch(() => {});
    if (productId) {
      // fetch existing product
      adminApi.getProducts({ id: productId }).then(data => {
        const p = data.products?.[0] || data;
        if (p) {
          setForm({ name: p.name, sku: p.sku, hsnCode: p.hsnCode, brand: p.brand || "", unit: p.unit, categoryId: p.categoryId?.toString() || "",
            basePrice: p.basePrice, sellingPrice: p.sellingPrice, discountPercent: p.discountPercent,
            description: p.description || "", shortDescription: p.shortDescription || "",
            metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "",
            isActive: p.isActive, isFeatured: p.isFeatured });
          setExistingImages(p.images || []);
          setVariants(p.variants?.map((v: any) => ({ variantName: v.variantName, sku: v.sku, price: v.price })) || []);
        }
      }).catch(() => {});
    }
  }, [productId]);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    images.forEach(img => fd.append("images", img));
    if (variants.length) fd.append("variants", JSON.stringify(variants));
    try {
      if (productId) {
        await adminApi.updateProduct(productId, fd);
        toast.success("Product updated!");
      } else {
        await adminApi.createProduct(fd);
        toast.success("Product created!");
      }
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const UNITS = ["NOS", "PCS", "BOX", "ROLL", "KG", "MTR", "SET", "PACK"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="card md:col-span-2">
          <h2 className="font-bold mb-4" style={{ color: '#627d98' }}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-text">Product Name *</label>
              <input value={form.name} onChange={update("name")} required className="input-field" placeholder="e.g. Electrolyte Orange 30 Sachets" />
            </div>
            <div>
              <label className="label-text">SKU *</label>
              <input value={form.sku} onChange={update("sku")} required className="input-field" placeholder="e.g. ELEC-ORG-30S" />
            </div>
            <div>
              <label className="label-text">Brand</label>
              <input value={form.brand} onChange={update("brand")} className="input-field" placeholder="e.g. 3M, Unbranded" />
            </div>
            <div>
              <label className="label-text">Category</label>
              <select value={form.categoryId} onChange={update("categoryId")} className="input-field">
                <option value="">— Select Category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Unit</label>
              <select value={form.unit} onChange={update("unit")} className="input-field">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <h2 className="font-bold mb-4" style={{ color: '#627d98' }}>Pricing &amp; GST</h2>
          <div className="space-y-3">
            <div>
              <label className="label-text">HSN Code</label>
              <select value={form.hsnCode} onChange={update("hsnCode")} className="input-field">
                <option value="3919">3919 — Adhesive Tapes (18% GST)</option>
                {gstRates.map(g => <option key={g.hsnCode} value={g.hsnCode}>{g.hsnCode} — {g.description}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Base / MRP (₹)</label>
              <input type="number" step="0.01" value={form.basePrice} onChange={update("basePrice")} required className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="label-text">Selling Price (₹) — before GST</label>
              <input type="number" step="0.01" value={form.sellingPrice} onChange={update("sellingPrice")} required className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="label-text">Discount %</label>
              <input type="number" step="0.01" min="0" max="100" value={form.discountPercent} onChange={update("discountPercent")} className="input-field" />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="card">
          <h2 className="font-bold mb-4" style={{ color: '#627d98' }}>Visibility</h2>
          <div className="space-y-4">
            {[["isActive", "Active (visible on store)"], ["isFeatured", "Featured on homepage"]].map(([k, label]) => (
              <label key={k} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm" style={{ color: '#8F9CAE' }}>{label}</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, [k]: !(f as any)[k] }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(form as any)[k] ? "bg-[#FF5C00]" : "bg-[#1E2D4A]"}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${(form as any)[k] ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </label>
            ))}
          </div>

          <div className="border-t mt-4 pt-4" style={{ borderColor: '#1E2D4A' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#627d98' }}>Short Description</h3>
            <textarea value={form.shortDescription} onChange={update("shortDescription")} rows={3}
              className="input-field resize-none text-sm" placeholder="Brief one-liner shown on product card" />
          </div>
        </div>

        {/* Description */}
        <div className="card md:col-span-2">
          <h2 className="font-bold mb-4" style={{ color: '#627d98' }}>Description</h2>
          <textarea value={form.description} onChange={update("description")} rows={6}
            className="input-field resize-y text-sm" placeholder="Full product description (HTML supported)" />
        </div>

        {/* Images */}
        <div className="card md:col-span-2">
          <h2 className="font-bold mb-4" style={{ color: '#627d98' }}>Product Images</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map(img => (
              <div key={img.id} className="relative h-20 w-20 rounded-xl overflow-hidden" style={{ border: '1.5px solid #1E2D4A' }}>
                <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                {img.isPrimary && <span className="absolute bottom-0 left-0 right-0 text-[9px] text-white text-center py-0.5" style={{ background: 'rgba(255,92,0,0.85)' }}>Primary</span>}
              </div>
            ))}
            {images.map((img, i) => (
              <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(255,92,0,0.35)' }}>
                <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors" style={{ background: '#0C1E3E', color: '#8F9CAE' }}>
                  <X size={10} />
                </button>
              </div>
            ))}
            <label className="h-20 w-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors" style={{ border: '2px dashed #FF5C00', background: 'rgba(255,92,0,0.05)' }}>
              <Upload size={18} className="mb-1" style={{ color: '#FF5C00' }} />
              <span className="text-[10px]" style={{ color: '#8F9CAE' }}>Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: '#627d98' }}>Variants (optional)</h2>
            <button type="button" onClick={() => setVariants(v => [...v, { variantName: "", sku: "", price: "" }])}
              className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80" style={{ color: 'var(--or, #FF5C00)' }}>
              <Plus size={14} /> Add Variant
            </button>
          </div>
          {variants.length === 0 && <p className="text-sm" style={{ color: '#8F9CAE' }}>No variants — single SKU product.</p>}
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 mb-3">
              <input value={v.variantName} onChange={e => setVariants(vs => vs.map((x, j) => j === i ? { ...x, variantName: e.target.value } : x))}
                className="input-field text-sm" placeholder="e.g. 2 inch, 3 inch" />
              <input value={v.sku} onChange={e => setVariants(vs => vs.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))}
                className="input-field text-sm" placeholder="Variant SKU" />
              <div className="flex gap-2">
                <input type="number" value={v.price} onChange={e => setVariants(vs => vs.map((x, j) => j === i ? { ...x, price: e.target.value } : x))}
                  className="input-field text-sm flex-1" placeholder="Price ₹" />
                <button type="button" onClick={() => setVariants(vs => vs.filter((_, j) => j !== i))}
                  className="h-full px-2 text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* SEO */}
        <div className="card md:col-span-2">
          <h2 className="font-bold mb-4" style={{ color: '#627d98' }}>SEO (optional)</h2>
          <div className="space-y-3">
            <div>
              <label className="label-text">Meta Title</label>
              <input value={form.metaTitle} onChange={update("metaTitle")} className="input-field text-sm" placeholder="SEO title (max 160 chars)" />
            </div>
            <div>
              <label className="label-text">Meta Description</label>
              <textarea value={form.metaDescription} onChange={update("metaDescription")} rows={2}
                className="input-field resize-none text-sm" placeholder="SEO description (max 300 chars)" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary px-8 py-3 disabled:opacity-50">
          {loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#1E2D4A', borderTopColor: 'transparent' }} />{productId ? "Updating..." : "Creating..."}</span> : productId ? "Update Product" : "Create Product"}
        </motion.button>
        <button type="button" onClick={() => router.push("/admin/products")} className="btn-outline px-6 py-3">Cancel</button>
      </div>
    </form>
  );
}
