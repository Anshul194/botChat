"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AppFooter() {
  return (
    <footer className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-muted/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} BotChat Lab. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <Link href="/home/privacy_policy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link href="/home/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
        <Link href="/home/terms_use" className="hover:text-white transition-colors">Terms of Use</Link>
        <Link href="/home/terms_use" className="hover:text-white transition-colors">Terms</Link>
      </div>
    </footer>
  );
}