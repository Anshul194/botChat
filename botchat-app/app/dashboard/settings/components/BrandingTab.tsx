// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  updateGeneralSettings, fetchGeneralSettings, updateAppSettings,
} from "../../../../store/slices/settingsSlice";
import {
  selectIsSuperAdmin as isSuperAdminSelector,
  selectIsReseller as isResellerSelector,
  selectIsTenant as isTenantSelector,
} from "../../../../store/slices/authSlice";
import { useModal } from "@/components/providers/ModalProvider";
import {
  Save, Globe, Palette, UploadCloud, Link2, Sparkles, AlertCircle, Copy,
} from "lucide-react";

function InputField({ label, name, type = "text", placeholder, defaultValue, value, onChange, readOnly }: { label: string; name?: string; type?: string; placeholder?: string; defaultValue?: string; value?: string; onChange?: any; readOnly?: boolean }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>{label}</label>}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value !== undefined ? value : undefined}
        onChange={onChange}
        readOnly={readOnly}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)", opacity: readOnly ? 0.6 : 1, cursor: readOnly ? "not-allowed" : "text" }}
      />
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl transition-all duration-300" style={{ background: "var(--card-bg)", border: "1px solid var(--glass-border)" }}>
      <div className="mb-5">
        <h3 className="text-sm font-bold tracking-tight" style={{ color: "var(--foreground)" }}>{title}</h3>
        {desc && <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function IntegrationHeader({ title, desc, Icon, color, isConnected }: { title: string; desc: string; Icon: any; color: string; isConnected?: boolean }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-300" style={{ background: "var(--card-bg)", border: "1px solid var(--glass-border)" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${color}15` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex-1">
        <h2 className="text-base font-bold tracking-tight flex items-center gap-3" style={{ color: "var(--foreground)" }}>
          {title}
          {isConnected !== undefined && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${isConnected ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground bg-muted/20'}`}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          )}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
      </div>
    </div>
  );
}

export default function BrandingTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { showModal } = useModal();
  const { general, isLoadingGeneral } = useSelector((state: RootState) => state.settings);
  const isSuperAdmin = useSelector(isSuperAdminSelector);
  const isReseller = useSelector(isResellerSelector);
  const isTenant = useSelector(isTenantSelector);

  const [generalForm, setGeneralForm] = useState({
    brandName: "",
    whiteLabelDomain: "",
    timezone: "UTC",
    locale: "en",
    twoFactorAuth: false,
    emailVerification: false,
    smsVerification: false,
    rtlEnabled: false,
    landingPageEnabled: true,
    registerEnabled: false,
    theme: { primaryColor: "#1d6ef5", sidebarTransparent: true, darkLayout: false },
    defaultLanguage: "en",
    defaultTimezone: "UTC",
    dateFormat: "MMM DD, YYYY",
    timeFormat: "hh:mm A",
    logo: "",
    favicon: "",
    gtag: "",
    databasePermission: false,
    appName: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (general) {
      setGeneralForm({
        ...general,
        theme: general.theme || { primaryColor: "#1d6ef5", sidebarTransparent: true, darkLayout: false },
      });
      if (general.logo) setLogoPreview(general.logo.startsWith('http') ? general.logo : `${process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '')}/uploads/${general.logo}`);
      if (general.favicon) setFaviconPreview(general.favicon.startsWith('http') ? general.favicon : `${process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '')}/uploads/${general.favicon}`);
    }
  }, [general]);

  const [isSavingBrandAssets, setIsSavingBrandAssets] = useState(false);

  const handleSaveGeneral = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const { logo, favicon, ...settingsData } = generalForm;
      await dispatch(updateGeneralSettings(settingsData)).unwrap();
      const brandPayload: any = { app_name: generalForm.appName || 'My Application' };
      if (logoFile) brandPayload.app_logo = logoFile;
      if (faviconFile) brandPayload.favicon_logo = faviconFile;
      if (logoFile || faviconFile) {
        await dispatch(updateAppSettings(brandPayload)).unwrap();
      }
      dispatch(fetchGeneralSettings({}));
      showModal("success", "Saved", "Settings saved successfully!");
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || "Failed to update settings";
      showModal("error", "Error", msg);
    }
  };

  const handleSaveBrandAssets = async () => {
    setIsSavingBrandAssets(true);
    try {
      const payload: any = { app_name: generalForm.appName || 'My Application' };
      if (logoFile) payload.app_logo = logoFile;
      if (faviconFile) payload.favicon_logo = faviconFile;
      await dispatch(updateAppSettings(payload)).unwrap();
      dispatch(fetchGeneralSettings({}));
      showModal("success", "Saved", "Brand assets saved successfully!");
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || "Failed to save brand assets";
      showModal("error", "Error", msg);
    } finally {
      setIsSavingBrandAssets(false);
    }
  };

  return (
    <div className="space-y-6 slide-up">
      <IntegrationHeader title="General Settings" desc="Configure platform-wide branding, localization, and features." Icon={Globe} color="#ec4899" />
      <form onSubmit={handleSaveGeneral} className="space-y-6">
        <Section title="Site Identity" desc="Configure how your workspace is presented to users">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {isSuperAdmin && (
              <InputField label="Site Name" value={generalForm.brandName} onChange={(e: any) => setGeneralForm({ ...generalForm, brandName: e.target.value })} placeholder="e.g. Acme Automation" />
            )}
            {(isTenant || isReseller) && (
              <InputField label="Custom Domain" value={generalForm.whiteLabelDomain} onChange={(e: any) => setGeneralForm({ ...generalForm, whiteLabelDomain: e.target.value })} placeholder="app.botchat.com" />
            )}
          </div>
        </Section>



        <Section title="Localization" desc="Configure default language, timezones and data formats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>System Timezone</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                value={generalForm.timezone} onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })}
              >
                <option value="UTC">UTC (Universal)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Date Format</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                value={generalForm.dateFormat} onChange={(e) => setGeneralForm({ ...generalForm, dateFormat: e.target.value })}
              >
                <option value="MMM DD, YYYY">MMM DD, YYYY (Mar 02, 2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (02/03/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (03/02/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-03-02)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Time Format</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                value={generalForm.timeFormat} onChange={(e) => setGeneralForm({ ...generalForm, timeFormat: e.target.value })}
              >
                <option value="hh:mm A">hh:mm A (12-hour)</option>
                <option value="HH:mm">HH:mm (24-hour)</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Feature Flags" desc="Toggle core platform functionalities">
          <div className="space-y-1">
            <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Landing Page Enabled</p>
                <p className="text-xs text-[var(--muted-foreground)]">Show the public landing page for this workspace</p>
              </div>
              <button type="button" onClick={() => setGeneralForm({ ...generalForm, landingPageEnabled: !generalForm.landingPageEnabled })}
                className="relative w-11 h-6 rounded-full transition-all duration-300"
                style={{ background: generalForm.landingPageEnabled ? "var(--brand-purple)" : "var(--glass-border)" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-[var(--card)] shadow transition-all duration-300"
                  style={{ left: generalForm.landingPageEnabled ? "calc(100% - 22px)" : "2px" }} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Email Verification</p>
                <p className="text-xs text-[var(--muted-foreground)]">Force users to verify email before access</p>
              </div>
              <button type="button" onClick={() => setGeneralForm({ ...generalForm, emailVerification: !generalForm.emailVerification })}
                className="relative w-11 h-6 rounded-full transition-all duration-300"
                style={{ background: generalForm.emailVerification ? "var(--brand-purple)" : "var(--glass-border)" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-[var(--card)] shadow transition-all duration-300"
                  style={{ left: generalForm.emailVerification ? "calc(100% - 22px)" : "2px" }} />
              </button>
            </div>
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
          <button type="submit" disabled={isLoadingGeneral} className="flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg sm:w-auto"
            style={{ background: "var(--brand-gradient)", color: "white", opacity: isLoadingGeneral ? 0.7 : 1 }}>
            <Save className="w-5 h-4" />{isLoadingGeneral ? "Saving..." : "Save Platform Settings"}
          </button>
        </div>
      </form>

      <Section title="Brand Assets" desc="Customize your workspace branding with logos and favicons">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <Palette className="w-4 h-4 text-purple-500" /> Main Logo
              </label>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>SVG/PNG</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <input type="text" placeholder="Paste logo URL here..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                value={generalForm.logo || ""}
                onChange={(e) => setGeneralForm({ ...generalForm, logo: e.target.value })}
              />
            </div>
            <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-[1.01] group cursor-pointer relative overflow-hidden"
              style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}
              onClick={() => logoInputRef.current?.click()}
            >
              {generalForm.logo ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white font-bold text-xs uppercase cursor-pointer">
                  Click to Replace
                </div>
              ) : null}
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="max-h-24 w-auto object-contain mb-2" />
              ) : (
                <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm" style={{ background: "rgba(168,85,247,0.15)" }}>
                  <UploadCloud className="w-6 h-6 text-purple-500" />
                </div>
              )}
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLogoFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setLogoPreview(reader.result as string);
                    reader.readAsDataURL(file);
                    showModal("success", "Logo", "Logo selected!");
                  }
                }}
              />
              <p className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>{logoPreview ? "Change Logo" : "Upload Logo"}</p>
              <p className="text-xs text-muted-foreground">{logoPreview ? "Click to replace" : "Or drag & drop file here"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Favicon
              </label>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: "rgba(236,72,153,0.1)", color: "#ec4899" }}>ICO/PNG</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <input type="text" placeholder="Paste favicon URL here..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                value={generalForm.favicon || ""}
                onChange={(e) => setGeneralForm({ ...generalForm, favicon: e.target.value })}
              />
            </div>
            <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-[1.01] group cursor-pointer relative overflow-hidden"
              style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}
              onClick={() => faviconInputRef.current?.click()}
            >
              {generalForm.favicon ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white font-bold text-xs uppercase cursor-pointer">
                  Replace
                </div>
              ) : null}
              {faviconPreview ? (
                <img src={faviconPreview} alt="Favicon Preview" className="w-12 h-12 object-contain mb-2 shadow-lg" />
              ) : (
                <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 group-hover:-rotate-6 shadow-sm" style={{ background: "rgba(236,72,153,0.15)" }}>
                  <UploadCloud className="w-6 h-6 text-[var(--primary)]" />
                </div>
              )}
              <input type="file" ref={faviconInputRef} className="hidden" accept="image/x-icon,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFaviconFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setFaviconPreview(reader.result as string);
                    reader.readAsDataURL(file);
                    showModal("success", "Favicon", "Favicon selected!");
                  }
                }}
              />
              <p className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>{faviconPreview ? "Change Favicon" : "Upload Favicon"}</p>
              <p className="text-xs text-muted-foreground">{faviconPreview ? "Click to replace" : "Or drag & drop file here"}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleSaveBrandAssets} disabled={isSavingBrandAssets}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all sm:w-auto"
            style={{ background: "var(--brand-gradient)", color: "white", opacity: isSavingBrandAssets ? 0.7 : 1 }}>
            <Save className="w-4 h-4" />{isSavingBrandAssets ? "Saving..." : "Save Brand Assets"}
          </button>
        </div>
      </Section>

      {(isTenant || isReseller) && (
        <Section title="Custom Domains" desc="Connect your own white-labeled domain or subdomain">
          <div className="flex flex-col sm:flex-row gap-3">
            <InputField label="" placeholder="e.g. app.yourdomain.com" />
            <div className="sm:pt-1.5 flex items-end">
              <button className="h-[42px] px-4 rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
                style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "var(--shadow-pink)" }}>
                <Link2 className="w-4 h-4" />Add Domain
              </button>
            </div>
          </div>
          <div className="mt-6 rounded-xl overflow-hidden border transition-all" style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--glass-border)", background: "var(--nav-hover-bg)" }}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full pulse-dot status-online" style={{ background: "#f59e0b" }} />
                <span className="text-sm font-bold tracking-tight" style={{ color: "var(--foreground)" }}>app.yourdomain.com</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1.5" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                Pending Validation
              </span>
            </div>
            <div className="p-5 space-y-5">
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                Set the following records in your DNS provider to verify and associate the underlying domain.
              </p>
              <div className="rounded-xl overflow-x-auto border" style={{ borderColor: "var(--glass-border)" }}>
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--glass-border)", background: "var(--nav-hover-bg)" }}>
                      <th className="px-5 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
                    <tr className="group hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-semibold">CNAME</td>
                      <td className="px-5 py-4 text-foreground font-semibold">app</td>
                      <td className="px-5 py-4 font-mono text-xs flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                        cname.botchat.com
                        <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-foreground" />
                      </td>
                    </tr>
                    <tr className="group hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-semibold">TXT</td>
                      <td className="px-5 py-4 text-foreground font-semibold">_botchat-verify.app</td>
                      <td className="px-5 py-4 font-mono text-xs flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                        vc_verify_q3f8d9sk2lxyz
                        <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-foreground" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl transition-all hover:bg-opacity-80" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  <strong style={{ color: "var(--foreground)" }}>Note:</strong> DNS changes can take up to 48 hours to propagate worldwide, although they typically take effect within 15 minutes. Ensure nameservers are accurate.
                </p>
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
