"use client";

import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-muted/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} MegaDM. Operated by MEGASTACK AI LLP. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <Link href="/home/privacy_policy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link href="/home/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
        <Link href="/home/terms_use" className="hover:text-white transition-colors">Terms of Use</Link>
        <Link href="/home/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("openCookieConsent"))}
          className="hover:text-white transition-colors cursor-pointer uppercase text-[10px] font-bold tracking-widest"
          aria-label="Open cookie preferences dialog"
        >
          Cookie Settings
        </button>
      </div>
    </footer>
  );
}