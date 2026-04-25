"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Stars, Sparkles, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import { GlowingSphere } from "./3D/GlowingSphere";
import { FloatingCard } from "./3D/FloatingCard";
import { productApi } from "@/lib/api";
import { store, Product } from "@/lib/store";
import { useSnapshot } from "valtio";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "@/components/Toast";

export default function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const snap = useSnapshot(store);

  useEffect(() => {
    const loadData = async () => {
      try {
        store.isLoading = true;
        const [productsData, categoriesData] = await Promise.all([
          productApi.list(),
          productApi.listCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        store.products = productsData;
        if (productsData.length > 0) setSelectedProduct(productsData[0]);
      } catch (error) {
        store.error = "Failed to load products";
        console.error(error);
      } finally {
        store.isLoading = false;
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadFiltered = async () => {
      try {
        store.isLoading = true;
        const data = await productApi.list({
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
        });
        setProducts(data);
        if (data.length > 0) setSelectedProduct(data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        store.isLoading = false;
      }
    };

    const timer = setTimeout(loadFiltered, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const colors = ["#ec4899", "#8b5cf6", "#0ea5e9", "#10b981"];

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const item = store.cart.find((i) => i.product.id === selectedProduct.id);
    if (item) {
      item.quantity += 1;
    } else {
      store.cart.push({
        product: selectedProduct,
        quantity: 1,
      });
    }
    showToast(`${selectedProduct.name} added to cart`, "success");
  };

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-[#050505] via-[#1a1a1a] to-[#050505] relative overflow-hidden py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-black md:text-5xl lg:text-6xl">
              Our <span className="gradient-text">Products</span>
            </h2>
            <p className="text-lg text-white/60">
              Crafted with precision, powered by innovation
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
            />
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory("")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === ""
                    ? "bg-pink-500 text-white"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === cat.name
                      ? "bg-pink-500 text-white"
                      : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 3D Canvas */}
            <div className="lg:col-span-2">
              <div className="h-[500px] rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 overflow-hidden backdrop-blur-md">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <Suspense fallback={null}>
                    <Environment preset="night" />
                    <Stars radius={100} depth={50} count={200} factor={4} fade speed={1} />
                    <Sparkles count={20} scale={5} size={3} speed={0.5} />

                    {/* Products as floating cards */}
                    {products.map((product, idx) => (
                      <FloatingCard
                        key={product.id}
                        position={[
                          (idx - products.length / 2) * 2.5,
                          0,
                          0,
                        ] as [number, number, number]}
                        color={colors[idx % colors.length]}
                        title={product.name}
                        price={product.price}
                      />
                    ))}

                    {/* Ambient light for better visibility */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                  </Suspense>
                </Canvas>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {selectedProduct && (
                  <motion.div
                    key={selectedProduct.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-8 backdrop-blur-md"
                  >
                    {selectedProduct.image && (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="mb-4 h-40 w-full rounded-xl object-cover"
                      />
                    )}
                    <h3 className="text-2xl font-bold mb-2">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-pink-500 font-bold text-2xl mb-4">
                      ${selectedProduct.price.toFixed(2)}
                    </p>
                    <p className="text-white/60 mb-6">
                      {selectedProduct.description ||
                        "Premium quality product crafted with care and advanced technology."}
                    </p>

                    {selectedProduct.tags && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddToCart}
                      className="w-full rounded-full bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-pink-500/50"
                    >
                      Add to Cart
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Product List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {products.map((product, idx) => (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full rounded-lg p-4 transition-all border flex items-center gap-3 ${
                      selectedProduct?.id === product.id
                        ? "border-pink-500 bg-pink-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    )}
                    <div className="text-left flex-1">
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-pink-400 text-sm">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    {!product.in_stock && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                        Out of stock
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

