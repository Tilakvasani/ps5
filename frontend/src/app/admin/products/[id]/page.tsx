"use client";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="flex items-center gap-1 text-sm transition-colors" style={{ color: "#0C1E39" }} onMouseEnter={e => e.currentTarget.style.color = "var(--or)"} onMouseLeave={e => e.currentTarget.style.color = "#0C1E39"}>
          <ChevronLeft size={16} /> Products
        </Link>
        <span style={{ color: "rgba(12, 30, 57, 0.3)" }}>/</span>
        <span className="font-semibold" style={{ color: "#4A5568" }}>Edit Product</span>
      </div>
      <h1 className="text-3xl font-black mb-6" style={{ color: "#0C1E39", letterSpacing: "-0.04em" }}>Edit Product</h1>
      <ProductForm productId={Number(params.id)} />
    </div>
  );
}
