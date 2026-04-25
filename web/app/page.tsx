"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { motion } from "framer-motion";
import { ReusableBackground } from "@/components/ReusableBackground";
import ProductShowcase from "@/components/ProductShowcase";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#050505]">
      <Navbar />
      <LoadingScreen />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <ReusableBackground
          sphereColors={["#ec4899", "#8b5cf6", "#0ea5e9"]}
          sphereCount={3}
          starCount={300}
          sparkleCount={50}
          ambientIntensity={0.5}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-pink-500">
              Future of Skin Nutrition
            </p>
            <h1 className="text-6xl font-black tracking-tighter md:text-7xl lg:text-8xl mb-6">
              <span className="gradient-text">zupwell</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-white/60 md:text-2xl mb-12">
              Harnessing the pure essence of nature through advanced 3D molecular extraction. Your daily wellness, redefined.
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                >
                  Start Journey
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-all"
                >
                  Explore Products
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">Why Choose zupwell?</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Experience premium skin nutrition backed by science</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🧬", title: "3D Molecular Tech", desc: "Advanced extraction technology for maximum potency" },
              { icon: "✨", title: "Premium Quality", desc: "Only the finest natural ingredients selected" },
              { icon: "🌍", title: "Sustainable", desc: "Eco-friendly sourcing and packaging" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-lg hover:border-pink-500/30 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <ProductShowcase />

      {/* Testimonials Section */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">What People Say</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Real results from real customers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                role: "Beauty Enthusiast",
                text: "My skin has never felt this radiant. The 3D molecular technology truly makes a difference you can see and feel.",
                rating: 5,
              },
              {
                name: "James K.",
                role: "Wellness Coach",
                text: "I recommend zupwell to all my clients. The quality and sustainability approach is unmatched in the industry.",
                rating: 5,
              },
              {
                name: "Elena R.",
                role: "Dermatologist",
                text: "Scientifically formulated with precision. I've seen remarkable improvements in my patients' skin health.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-lg"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-white/80 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/50">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-12 backdrop-blur-lg text-center"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to zupwell?</h2>
            <p className="text-white/60 mb-8">Join thousands of satisfied customers and start your transformation today</p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-pink-500/50"
              >
                Get Started Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 px-6 bg-black/50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">zupwell</h3>
              <p className="text-white/60">Premium 3D molecular nutrition</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-white/60">
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><a href="#" className="hover:text-white">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/40">
            <p>&copy; 2024 zupwell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
 
