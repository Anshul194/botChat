"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountSelector } from './components/AccountSelector';
import { PostPreview } from './components/PostPreview';
import { Composer } from './components/Composer';
import { CarouselComposer } from "./components/CarouselComposer";
import { 
  ChevronLeft, 
  Settings, 
  HelpCircle, 
  Bell,
  PanelLeftClose,
  PanelLeft,
  Send,
  MousePointer2,
  Layers,
  Rss,
  Youtube,
  ArrowRight,
  Sparkles,
  Loader2,
  Facebook,
  Instagram,
  Plus,
  Clock,
  Search
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from '@/components/ThemeToggle';
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { createCampaign, fetchCampaigns, createCtaCampaign, fetchCtaCampaigns } from "@/store/slices/socialPostingSlice";
import { fetchCarouselCampaigns, createCarouselCampaign } from "@/store/slices/carouselSlice";
import type { AppDispatch, RootState } from "@/store/store";
import api from "@/lib/api";

export default function PostStudioPage() {
  const { showModal } = useModal();
  const [step, setStep] = useState<'select' | 'list' | 'studio'>('select');
  const [postType, setPostType] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [globalSidebarCollapsed, setGlobalSidebarCollapsed] = useState(true);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedParentAccounts, setSelectedParentAccounts] = useState<string[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { campaigns, ctaCampaigns, isLoading: isLoadingCampaigns } = useSelector((state: RootState) => state.socialPosting);
  const { campaigns: carouselCampaigns, isPublishing: isPublishingCarousel } = useSelector((state: RootState) => state.carousel);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (step === 'list') {
      if (postType === 'carousel') {
        dispatch(fetchCarouselCampaigns());
      } else if (postType === 'cta') {
        dispatch(fetchCtaCampaigns({ per_page: 50 }));
      } else {
        dispatch(fetchCampaigns({ per_page: 50 }));
      }
    }
    
    window.dispatchEvent(new Event("collapseDesktopSidebar"));
    setGlobalSidebarCollapsed(true);
    
    return () => {
        window.dispatchEvent(new Event("expandDesktopSidebar"));
    };
  }, [step, dispatch, postType]);

  const toggleGlobalSidebar = () => {
      if (globalSidebarCollapsed) {
          window.dispatchEvent(new Event("expandDesktopSidebar"));
      } else {
          window.dispatchEvent(new Event("collapseDesktopSidebar"));
      }
      setGlobalSidebarCollapsed(!globalSidebarCollapsed);
  };

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const [fbRes, igRes] = await Promise.all([
        api.get("/social/facebook-connect"),
        api.get("/social/instagram-connect")
      ]);

      const fbAccounts = fbRes.data.data.facebook_accounts || [];
      const igAccounts = igRes.data.data.instagram_accounts || [];

      const normalizedFb = fbAccounts.flatMap((acc: any) => (acc.pages || []).map((p: any) => ({
        id: p.id,
        name: p.page_name,
        accountName: acc.name,
        accountId: acc.id,
        type: 'facebook',
        image: p.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${p.page_name}`,
        platformId: String(p.page_id)
      })));

      const normalizedIg = igAccounts.map((a: any) => ({
        id: a.id,
        name: a.name || a.username,
        accountName: a.name || a.username,
        accountId: a.id,
        type: 'instagram',
        image: a.profile_picture_url || `https://api.dicebear.com/7.x/initials/svg?seed=${a.username}`,
        platformId: a.id
      }));

      setAccounts([...normalizedFb, ...normalizedIg]);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      showModal("error", "Error", "Could not load social accounts. Please check your connections.");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleSelectType = (type: string) => {
    setPostType(type);
    setStep('list');
    fetchAccounts();
  };

  const handlePublish = async (composerData: any) => {
    if (!composerData.campaignName && !composerData.campaign_name) {
        showModal("error", "Validation Error", "Please provide a campaign name.");
        return;
    }
    // Validation based on post type
    if (postType === 'carousel') {
        if (!composerData.selected_pages || composerData.selected_pages.length === 0) {
            showModal("error", "Validation Error", "Please select a page to post in the form.");
            return;
        }
    } else if (postType === 'cta') {
        if (selectedParentAccounts.length === 0) {
            showModal("error", "Validation Error", "Please select at least one account in the top header.");
            return;
        }
    } else {
        if (selectedAccounts.length === 0) {
            showModal("error", "Validation Error", "Please select at least one account.");
            return;
        }
    }

    setIsPublishing(true);

    try {
        let finalSelectedPages = [];
        
        if (postType === 'carousel') {
            finalSelectedPages = composerData.selectedPages;
        } else if (postType === 'cta') {
            // For CTA, we take all pages belonging to the selected parent accounts
            finalSelectedPages = accounts
                .filter(a => selectedParentAccounts.includes(a.accountId))
                .map(a => ({
                    id: a.id,
                    platform_id: String(a.platformId)
                }));
        } else {
            finalSelectedPages = selectedAccounts.map(id => {
                const acc = accounts.find(a => a.id === id);
                return {
                    id: acc?.id || id,
                    platform_id: String(acc?.platformId || id)
                };
            });
        }

        const primaryAccountType = accounts.find(a => a.id === (selectedAccounts[0] || selectedParentAccounts[0]))?.type || 'facebook';

        if (postType === 'carousel') {
             await dispatch(createCarouselCampaign(composerData)).unwrap();
        } else if (postType === 'cta' || composerData.postType === 'link') {
            const ctaPayload: any = {
                campaign_name: composerData.campaignName,
                publisher_type: primaryAccountType === 'facebook' ? 'page' : 'account',
                message: composerData.caption,
                link: composerData.linkUrl,
                cta_type: composerData.ctaType,
                cta_value: composerData.ctaValue || composerData.linkUrl,
                schedule_type: composerData.isScheduling ? 'later' : 'now',
                selected_pages: finalSelectedPages,
                repeat_times: parseInt(composerData.repeatTimes) || 0,
                time_interval: parseInt(composerData.timeInterval) || 0,
                auto_reply_template: composerData.autoReplyTemplate,
                timezone: composerData.timeZone
            };

            if (ctaPayload.schedule_type === 'later') {
                ctaPayload.schedule_time = `${composerData.scheduleDate} ${composerData.scheduleTime}:00`;
            }

            await dispatch(createCtaCampaign(ctaPayload)).unwrap();
        } else {
            const payload: any = {
                campaign_name: composerData.campaignName,
                media_type: primaryAccountType,
                publisher_type: primaryAccountType === 'facebook' ? 'page' : 'account',
                post_type: composerData.postType,
                message: composerData.caption,
                schedule_type: composerData.isScheduling ? 'later' : 'now',
                selected_pages: selectedPages
            };

            if (payload.post_type === 'image') {
                payload.image_urls = composerData.media;
            } else if (payload.post_type === 'video') {
                payload.video_url = composerData.media[0];
            } else if (payload.post_type === 'link') {
                payload.link = composerData.linkUrl;
            }

            if (payload.schedule_type === 'later') {
                payload.schedule_time = `${composerData.scheduleDate} ${composerData.scheduleTime}:00`;
            }

            await dispatch(createCampaign(payload)).unwrap();
        }

        showModal("success", "Success", "Campaign created successfully!");
        setStep('select');
        setCaption('');
        setMedia([]);
        setSelectedAccounts([]);
    } catch (err: any) {
        showModal("error", "Publishing Failed", err.toString());
    } finally {
        setIsPublishing(false);
    }
  };

  const uniqueAccounts = Array.from(new Map(accounts.map(a => [a.accountId, a])).values())
    .filter(a => postType !== 'cta' || a.type === 'facebook');

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.accountName.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platform === 'all' || a.type === platform;
    const matchesAccountFilter = selectedParentAccounts.length === 0 || selectedParentAccounts.includes(a.accountId);
    const isAllowedForType = postType !== 'cta' || a.type === 'facebook';
    return matchesSearch && matchesPlatform && matchesAccountFilter && isAllowedForType;
  });

  const fbCount = accounts.filter(a => a.type === 'facebook').length;
  const igCount = accounts.filter(a => a.type === 'instagram').length;

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 relative z-10">
          <Badge variant="secondary" className="mb-4 px-4 py-1">Choose Campaign Type</Badge>
          <h1 className="text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-[var(--foreground)] to-[var(--muted-foreground)]">
            What are we creating today?
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full relative z-10">
          <SelectionCard 
            title="Multimedia Post"
            description="Post text, link, image, or video on Facebook & Instagram automatically."
            icon={<Send className="w-8 h-8" />}
            color="indigo"
            onClick={() => handleSelectType('multimedia')}
          />
          <SelectionCard 
            title="CTA Post"
            description="Create posts with professional call-to-action buttons on Facebook."
            icon={<MousePointer2 className="w-8 h-8" />}
            color="fuchsia"
            onClick={() => handleSelectType('cta')}
          />
          <SelectionCard 
            title="Carousel/Video"
            description="Publish multi-image carousel or high-quality video posts seamlessly."
            icon={<Layers className="w-8 h-8" />}
            color="cyan"
            onClick={() => handleSelectType('carousel')}
          />
        </div>
      </div>
    );
  }

  if (step === 'list') {
    return (
      <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30">
        <div className="h-16 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setStep('select')}><ChevronLeft className="w-5 h-5" /></Button>
            <h1 className="text-xl font-bold capitalize">{postType?.replace('-', ' ')} Campaigns</h1>
          </div>
          <Button onClick={() => setStep('studio')}><Plus className="w-4 h-4 mr-2" /> Create Post</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {((postType === 'carousel' ? carouselCampaigns : (postType === 'cta' ? ctaCampaigns : campaigns)) || []).map((camp: any, idx: number) => (
                  <div key={camp.id || idx} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/50 transition-all">
                    <h3 className="font-bold mb-2">{camp.campaign_name}</h3>
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {camp.schedule_type === 'later' && camp.schedule_time ? new Date(camp.schedule_time).toLocaleString() : 'Now'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden selection:bg-primary/30">
      {/* Top Header & Account Bar */}
      <div className="flex flex-col border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl z-30">
        <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)]/50">
          <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleGlobalSidebar}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
                {globalSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              onClick={() => setStep('list')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="h-6 w-px bg-[var(--border)]" />
            <h1 className="text-sm font-semibold tracking-wide text-[var(--foreground)]/80">
              Social Poster <span className="text-[var(--muted-foreground)] mx-2">/</span> 
              <span className="text-[var(--foreground)] capitalize font-bold">{postType?.replace('-', ' ')} Studio</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Top Bar Account Selector */}
        <div className="flex flex-col border-t border-[var(--border)] bg-[var(--card)] px-6 py-2 gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] shrink-0 whitespace-nowrap">
                Select {postType === 'multimedia' ? 'Pages' : 'Accounts'} ({(postType === 'cta' || postType === 'carousel') ? selectedParentAccounts.length : selectedAccounts.length})
              </div>
              <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-md p-1 h-8">
                <button 
                  onClick={() => setPlatform('all')}
                  className={cn("px-3 text-xs rounded transition-colors font-medium h-full", platform === 'all' ? "bg-primary text-primary-foreground" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
                >
                  All
                </button>
                <button 
                  onClick={() => setPlatform('facebook')}
                  className={cn("flex items-center gap-1 px-3 text-xs rounded transition-colors font-medium h-full", platform === 'facebook' ? "bg-[#1877F2] text-white" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
                >
                  <Facebook className="w-3 h-3" /> FB ({uniqueAccounts.filter(a => a.type === 'facebook').length})
                </button>
                {(postType !== 'cta' && postType !== 'carousel') && (
                  <button 
                    onClick={() => setPlatform('instagram')}
                    className={cn("flex items-center gap-1 px-3 text-xs rounded transition-colors font-medium h-full", platform === 'instagram' ? "bg-[#E1306C] text-white" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
                  >
                    <Instagram className="w-3 h-3" /> IG ({uniqueAccounts.filter(a => a.type === 'instagram').length})
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <Input 
                placeholder="Quick find..." 
                className="h-8 bg-[var(--background)] border-[var(--border)] pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {isLoadingAccounts ? (
              <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading accounts...
              </div>
            ) : (postType === 'cta' || postType === 'carousel') ? (
              // CTA/Carousel Mode: Show ONLY parent accounts (FB ONLY as requested)
              uniqueAccounts
                .filter(acc => acc.type === 'facebook')
                .map((acc) => (
                <button
                  key={acc.accountId}
                  onClick={() => {
                    // Selection logic: toggle the parent account
                    setSelectedParentAccounts(prev => prev.includes(acc.accountId) ? prev.filter(id => id !== acc.accountId) : [...prev, acc.accountId]);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap shrink-0",
                    selectedParentAccounts.includes(acc.accountId) 
                      ? "bg-primary/10 border-primary text-[var(--foreground)] shadow-sm" 
                      : "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-primary/50"
                  )}
                >
                  <img src={acc.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                  {acc.type === 'facebook' ? <Facebook className="w-3 h-3 text-[#1877F2]" /> : <Instagram className="w-3 h-3 text-[#E1306C]" />}
                  <span className="text-sm font-medium">{acc.accountName}</span>
                </button>
              ))
            ) : (
              // Multimedia Mode: Show Account filters + Page list
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase mr-2">Filter by Acc:</span>
                  {uniqueAccounts
                    .filter(acc => platform === 'all' || acc.type === platform)
                    .map(acc => (
                    <button
                      key={acc.accountId}
                      onClick={() => setSelectedParentAccounts(prev => prev.includes(acc.accountId) ? prev.filter(id => id !== acc.accountId) : [...prev, acc.accountId])}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] border transition-all whitespace-nowrap",
                        selectedParentAccounts.includes(acc.accountId) ? "bg-primary text-white border-primary" : "border-[var(--border)] text-[var(--muted-foreground)]"
                      )}
                    >
                      {acc.accountName}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccounts(prev => prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-full border transition-all whitespace-nowrap shrink-0",
                          selectedAccounts.includes(acc.id) 
                            ? "bg-primary/10 border-primary text-[var(--foreground)] shadow-sm" 
                            : "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-primary/50"
                        )}
                      >
                        <img src={acc.image} alt="" className="w-4 h-4 rounded-full object-cover" />
                        <span className="text-xs font-medium">{acc.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-[var(--muted-foreground)]">No matching pages found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex h-full overflow-hidden">
          {/* Center - Composer */}
          <section className="flex-[1.2] border-r border-[var(--border)] h-full">
            {step === 'studio' && postType === 'carousel' ? (
                <CarouselComposer 
                    onPublish={handlePublish} 
                    isPublishing={isPublishingCarousel} 
                    accounts={accounts}
                    isLoadingAccounts={isLoadingAccounts}
                    selectedParentAccounts={selectedParentAccounts}
                />
            ) : (
              <Composer 
                onContentChange={setCaption}
                onMediaChange={setMedia}
                type={postType}
                onPublish={handlePublish}
                isPublishing={isPublishing}
              />
            )}
          </section>

          {/* Right - Preview */}
          <section className="flex-1 h-full bg-[var(--background)]">
            <PostPreview 
              content={caption}
              media={media}
              type={postType}
            />
          </section>
        </main>
      </div>

      {/* Decorative Gradient Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}

function SelectionCard({ title, description, icon, color, onClick }: any) {
  const colorMap: any = {
    indigo: "from-primary/10 to-transparent border-primary/20 hover:border-primary/50 text-primary",
    fuchsia: "from-accent/10 to-transparent border-accent/20 hover:border-accent/50 text-accent",
    cyan: "from-cyan-500/10 to-transparent border-cyan-500/20 hover:border-cyan-500/50 text-cyan-500"
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "group relative bg-gradient-to-br border p-8 rounded-[2.5rem] cursor-pointer transition-all duration-300 flex flex-col gap-6 overflow-hidden bg-[var(--card)]",
        colorMap[color]
      )}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-150 transition-transform duration-500">
        {icon}
      </div>
      
      <div className="w-16 h-16 rounded-2xl bg-[var(--background)] flex items-center justify-center shadow-2xl border border-[var(--border)]">
        {icon}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
          {title} <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border)]">
         <span className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)]">Select Platform</span>
         <div className="flex gap-2">
            <Facebook className="w-4 h-4 text-[var(--muted-foreground)]" />
            <Instagram className="w-4 h-4 text-[var(--muted-foreground)]" />
         </div>
      </div>
    </motion.div>
  );
}
