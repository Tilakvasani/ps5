import dynamic from "next/dynamic";

const ProductShowcase = dynamic(
  () => import("@/components/ProductShowcase"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/20">
        Loading products...
      </div>
    ),
  }
);

export default function ProductsPage() {
  return <ProductShowcase />;
}
