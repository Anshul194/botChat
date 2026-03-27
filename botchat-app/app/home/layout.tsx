"use client";

import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-[#e2e8f8]">
      <Navbar />
      <div className="relative pt-32 pb-24">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ec4899]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-[#a855f7]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
