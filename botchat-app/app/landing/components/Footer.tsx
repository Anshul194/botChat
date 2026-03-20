"use client";

import Link from "next/link";
import { Sparkles, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-24 bg-white border-t border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 px-4">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#FF2D78] to-[#E1306C] shadow-lg shadow-pink-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-gray-900 font-display">botChat</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-body">
              Converting every <span className="text-black font-medium">comment into a customer</span>. 
              The most trusted DM automation for scaling creators.
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-8 font-display">Platform</h4>
            <ul className="space-y-4 font-body">
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-all text-sm hover:pl-2">Features</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-all text-sm hover:pl-2">Pricing</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-all text-sm hover:pl-2">Security</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-all text-sm hover:pl-2">API Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-8 font-display">Resources</h4>
            <ul className="space-y-4 font-body">
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-all text-sm hover:pl-2">Creators Blog</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-all text-sm hover:pl-2">Case Studies</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-all text-sm hover:pl-2">Help Center</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-all text-sm hover:pl-2">Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-8 font-display">Contact Us</h4>
            <div className="space-y-6 font-body">
              <Link href="mailto:hello@botchat.ai" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF2D78]/10 group-hover:text-[#FF2D78] transition-all">
                  <Github className="w-5 h-5" /> {/* Using GitHub icon as placeholder for mail if needed, but let's just use Text */}
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Email Support</div>
                  <div className="text-sm text-gray-900 font-medium">hello@botchat.ai</div>
                </div>
              </Link>
              <Link href="https://instagram.com/botchat.ai" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#E1306C]/10 group-hover:text-[#E1306C] transition-all">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">DM Us</div>
                  <div className="text-sm text-gray-900 font-medium">@botchat.ai</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 px-4">
          <p className="text-gray-400 text-[11px] font-body">
            © 2026 botChat Lab. All rights reserved. <span className="text-gray-300">|</span> Built for the next billion creators.
          </p>
          <div className="flex gap-8 text-[11px] text-gray-400 font-bold uppercase tracking-widest font-display">
            <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-black transition-colors">Terms</Link>
            <Link href="#" className="hover:text-black transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
