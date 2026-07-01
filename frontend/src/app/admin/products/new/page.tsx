"use client";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="flex items-center gap-1 text-[#45353E] hover:text-[#0B1B3D] text-sm transition-colors">
          <ChevronLeft size={16} /> Products
        </Link>
        <span className="text-[#0B1B3D]/30">/</span>
        <span className="text-[#0B1B3D] font-semibold">New Product</span>
      </div>
      <h1 className="text-3xl font-black text-[#0B1B3D] mb-6">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
