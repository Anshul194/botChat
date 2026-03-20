"use client";

import Link from "next/link";
import { Sparkles, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#FF2D78] to-[#E1306C]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">ReplyRush</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Empowering creators and brands with AI-driven engagement. Automate your social presence without losing the human touch.
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-colors text-sm">Features</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-colors text-sm">Pricing</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-colors text-sm">Integrations</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-colors text-sm">Enterprise</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-colors text-sm">About Us</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-colors text-sm">Blog</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-colors text-sm">Careers</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-[#FF2D78] transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-6">Stay Connected</h4>
            <div className="flex gap-4 mb-6">
              <Link href="#" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-[#FF2D78]/10 hover:text-[#FF2D78] transition-all">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-[#FF2D78]/10 hover:text-[#FF2D78] transition-all">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-[#FF2D78]/10 hover:text-[#FF2D78] transition-all">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-[#FF2D78]/10 hover:text-[#FF2D78] transition-all">
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            © 2026BotAI AI. All rights reserved. Built with ❤️ for creators.
          </p>
          <div className="flex gap-8 text-xs text-gray-400 font-medium pb-2 md:pb-0">
            <Link href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-700 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
