"use client";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="flex items-center gap-1 text-[#45353E] hover:text-[#002A30] text-sm transition-colors">
          <ChevronLeft size={16} /> Products
        </Link>
        <span className="text-[#002A30]/30">/</span>
        <span className="text-[#002A30] font-semibold">Edit Product</span>
      </div>
      <h1 className="text-3xl font-black text-[#002A30] mb-6">Edit Product</h1>
      <ProductForm productId={Number(params.id)} />
    </div>
  );
}
