"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter as useNextRouter } from 'next/navigation';
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
  Search,
  Grid,
  Layout,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  X,
  Filter,
  CheckCircle2,
  Smartphone
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
  const { showModal, showConfirm } = useModal();
  const searchParams = useSearchParams();
  const nextRouter = useNextRouter();

  // Derive step & postType from URL so they survive a page refresh
  const stepParam = (searchParams.get('step') as 'select' | 'list' | 'studio') || 'select';
  const typeParam = searchParams.get('type') || null;

  const [step, _setStep] = useState<'select' | 'list' | 'studio'>(stepParam);
  const [postType, _setPostType] = useState<string | null>(typeParam);

  // Helpers that update both local state AND the URL
  const setStep = useCallback((s: 'select' | 'list' | 'studio') => {
    _setStep(s);
    const params = new URLSearchParams(window.location.search);
    params.set('step', s);
    nextRouter.replace(`?${params.toString()}`, { scroll: false });
  }, [nextRouter]);

  const setPostType = useCallback((t: string | null) => {
    _setPostType(t);
    const params = new URLSearchParams(window.location.search);
    if (t) params.set('type', t); else params.delete('type');
    nextRouter.replace(`?${params.toString()}`, { scroll: false });
  }, [nextRouter]);
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [carouselItemsPreview, setCarouselItemsPreview] = useState<any[]>([]);
  const [sliderImagesPreview, setSliderImagesPreview] = useState<string[]>([]);
  const [carouselTab, setCarouselTab] = useState<string>('carousel');
  const [linkUrlPreview, setLinkUrlPreview] = useState('');
  const [ctaTypePreview, setCtaTypePreview] = useState('LEARN_MORE');
  const [globalSidebarCollapsed, setGlobalSidebarCollapsed] = useState(true);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [listView, setListView] = useState<'row' | 'card'>('row');
  const [multimediaTab, setMultimediaTab] = useState('text');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedParentAccounts, setSelectedParentAccounts] = useState<string[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { campaigns, ctaCampaigns, isLoading: isLoadingCampaigns } = useSelector((state: RootState) => state.socialPosting);
  const { campaigns: carouselCampaigns, isPublishing: isPublishingCarousel } = useSelector((state: RootState) => state.carousel);
  const dispatch = useDispatch<AppDispatch>();

  // Fetch accounts whenever we're in list or studio mode (also covers post-refresh)
  useEffect(() => {
    if (step === 'list' || step === 'studio') {
      fetchAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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

  const handleCarouselChange = (data: any) => {
    setCaption(data.message);
    setCarouselItemsPreview(data.carouselItems);
    setSliderImagesPreview(data.videoImages || []);
    if (data.activeTab) setCarouselTab(data.activeTab);
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
        platformId: String(a.instagram_id || a.id)
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
    _setPostType(type);
    _setStep('list');
    // Update URL in a single replace to avoid two history entries
    const params = new URLSearchParams();
    params.set('step', 'list');
    params.set('type', type);
    nextRouter.replace(`?${params.toString()}`, { scroll: false });
    fetchAccounts();
  };

  const handleDeleteCampaign = (campId: number) => {
    showConfirm({
      title: "Delete Campaign",
      message: "Are you sure you want to delete this campaign? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
      onConfirm: async () => {
        try {
          let endpoint = '';
          if (postType === 'carousel') endpoint = `/social-posting/carousel/${campId}`;
          else if (postType === 'cta') endpoint = `/social-posting/cta/${campId}`;
          else endpoint = `/social-posting/multimedia/${campId}`;

          await api.delete(endpoint);
          showModal("success", "Deleted", "Campaign deleted successfully.");
          // Refresh list
          if (postType === 'carousel') dispatch(fetchCarouselCampaigns());
          else if (postType === 'cta') dispatch(fetchCtaCampaigns());
          else dispatch(fetchCampaigns());
        } catch (err: any) {
          showModal("error", "Failed", err.message || "Failed to delete campaign");
        }
      }
    });
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
      const finalSelectedPages = selectedAccounts.map(id => {
        const acc = accounts.find(a => a.id === id);
        return {
          id: acc?.platformId || id, // Mapping to platform_id needed by API
          platform_id: String(acc?.platformId || id)
        };
      });

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
          time_interval: parseInt(composerData.timeInterval) || null,
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
          selected_pages: finalSelectedPages
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
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12 relative z-10">
          <Badge variant="secondary" className="mb-4 px-4 py-1">Choose Campaign Type</Badge>
          <h1 data-tour="page-heading" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-[var(--foreground)] to-[var(--muted-foreground)]">
            What are we creating today?
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl w-full relative z-10">
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
    const activeCampaigns = (postType === 'carousel' ? carouselCampaigns : (postType === 'cta' ? ctaCampaigns : campaigns)) || [];
    const filteredCampaigns = activeCampaigns.filter((c: any) =>
      c.campaign_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30">
        <div className="h-auto sm:h-20 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md sm:px-8 sm:py-0">
          <div className="sm:hidden flex items-center justify-between gap-2 px-3">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => setStep('select')} className="rounded-xl hover:bg-primary/10 shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-black tracking-tight capitalize truncate">{postType?.replace('-', ' ')} Campaigns</h1>
            </div>
            <Button onClick={() => setStep('studio')} className="rounded-xl h-9 px-3 font-bold shadow-lg shadow-primary/20 text-xs shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="sm:hidden flex items-center gap-2 px-3 pb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Search campaigns..."
                className="pl-10 h-9 bg-[var(--background)] border-[var(--border)] rounded-xl focus-visible:ring-1 focus-visible:ring-primary text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-xl p-1 h-9 shadow-sm">
              <button onClick={() => setListView('row')} className={cn("px-2 py-1 rounded-lg transition-all", listView === 'row' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)]")}>
                <Layout className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setListView('card')} className={cn("px-2 py-1 rounded-lg transition-all", listView === 'card' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)]")}>
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:h-full sm:px-0">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={() => setStep('select')} className="rounded-xl hover:bg-primary/10 shrink-0">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-black tracking-tight capitalize truncate">{postType?.replace('-', ' ')} Campaigns</h1>
                <p className="text-xs text-[var(--muted-foreground)] font-medium">Manage and track your social media campaigns</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input placeholder="Search campaigns..." className="pl-10 h-10 bg-[var(--background)] border-[var(--border)] rounded-xl focus-visible:ring-1 focus-visible:ring-primary" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-xl p-1 h-10 shadow-sm">
                <button onClick={() => setListView('row')} className={cn("px-3 py-1.5 rounded-lg transition-all flex items-center gap-2", listView === 'row' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
                  <Layout className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Row</span>
                </button>
                <button onClick={() => setListView('card')} className={cn("px-3 py-1.5 rounded-lg transition-all flex items-center gap-2", listView === 'card' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
                  <Grid className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Card</span>
                </button>
              </div>
              <Button onClick={() => setStep('studio')} className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20 text-sm">
                <Plus className="w-4 h-4 mr-2" /> New Campaign
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[var(--background)]/50 p-4 sm:p-6">
          {filteredCampaigns.length === 0 ? (
            <div className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-[var(--border)]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Send className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">No campaigns found</h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xs mx-auto mb-6 sm:mb-8">
                {search ? "Try adjusting your search query." : `Start by creating your first ${postType} campaign.`}
              </p>
              {!search && (
                <Button onClick={() => setStep('studio')} className="rounded-xl sm:rounded-2xl h-10 sm:h-12 px-6 sm:px-8 text-[11px] sm:text-[13px] font-black uppercase tracking-widest">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> New Campaign
                </Button>
              )}
            </div>
          ) : listView === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredCampaigns.map((camp: any, idx: number) => (
                <div key={camp.id || idx} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm sm:shadow-xl hover:shadow-lg sm:hover:shadow-2xl hover:border-primary/30 sm:hover:border-primary/50 transition-all duration-300 flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className={cn(
                      "shrink-0 px-2.5 sm:px-3 py-1 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-tight whitespace-nowrap",
                      camp.posting_status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        camp.posting_status === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {camp.posting_status || 'Pending'}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-lg truncate text-[var(--foreground)]">{camp.campaign_name}</h3>
                    <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mt-0.5">ID: #{camp.id}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-[var(--muted-foreground)]">
                    <Badge variant="secondary" className="rounded-md text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5">
                      {camp.post_type || postType}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      {camp.schedule_type === 'later' ? 'Scheduled' : 'Direct'}
                    </div>
                  </div>

                  {camp.schedule_time && (
                    <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">
                      {new Date(camp.schedule_time).toLocaleString()}
                    </p>
                  )}

                  {camp.error_message && (
                    <div className="text-[9px] sm:text-[10px] text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/10 line-clamp-2 leading-relaxed">
                      {camp.error_message}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[var(--border)]/30">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                      {camp.media_type === 'facebook' ? <Facebook className="w-3 h-3 text-[#1877F2]" /> : <Instagram className="w-3 h-3 text-[#E1306C]" />}
                      {camp.media_type === 'facebook' ? 'Facebook' : 'Instagram'}
                    </div>
                    <div className="flex items-center gap-1">
                      {camp.post_url && (
                        <Button variant="ghost" size="icon" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => window.open(camp.post_url, '_blank')}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-red-500/10 hover:text-red-500" onClick={() => handleDeleteCampaign(camp.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)]/40">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Campaign</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Type</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Schedule</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Status</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((camp: any, idx: number) => (
                    <tr key={camp.id || idx} className={cn("transition-colors", idx % 2 === 0 ? "bg-[var(--card)]/30 dark:bg-[var(--card)]/[0.02]" : "bg-transparent", "hover:bg-primary/[0.04]")}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 relative ring-1 ring-inset ring-primary/20">
                            <Layers className="w-5 h-5" />
                            <div className="absolute -bottom-px -right-px w-4 h-4 rounded-full bg-[var(--background)] border-2 border-[var(--card)] flex items-center justify-center">
                              {camp.media_type === 'facebook' ? <Facebook className="w-2 h-2 text-[#1877F2]" /> : <Instagram className="w-2 h-2 text-[#E1306C]" />}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate text-[var(--foreground)]">{camp.campaign_name}</p>
                            <p className="text-[11px] text-[var(--muted-foreground)] mt-px">#{camp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-[var(--background)] text-[var(--muted-foreground)] ring-1 ring-inset ring-[var(--border)]">
                          {camp.post_type || postType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">{camp.schedule_type === 'later' ? 'Scheduled' : 'Direct'}</span>
                        {camp.schedule_time && (
                          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{new Date(camp.schedule_time).toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-tight",
                          camp.posting_status === 'completed'
                            ? "bg-emerald-500/10 text-emerald-600"
                            : camp.posting_status === 'failed'
                              ? "bg-red-500/10 text-red-600"
                              : "bg-amber-500/10 text-amber-600"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", camp.posting_status === 'completed' ? "bg-emerald-500" : camp.posting_status === 'failed' ? "bg-red-500" : "bg-amber-500")} />
                          {camp.posting_status || 'Pending'}
                        </div>
                        {camp.error_message && (
                          <p className="mt-1 text-[10px] text-red-500 truncate max-w-[160px]" title={camp.error_message}>{camp.error_message}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-[var(--muted-foreground)] hover:text-primary hover:bg-primary/10" onClick={() => camp.post_url && window.open(camp.post_url, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteCampaign(camp.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <div className="sm:hidden flex flex-col gap-3 p-3">
                {filteredCampaigns.map((camp: any, idx: number) => (
                  <div key={camp.id || idx} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-3 active:bg-[var(--card)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {camp.media_type === 'facebook' ? <Facebook className="w-4 h-4 text-[#1877F2]" /> : <Instagram className="w-4 h-4 text-[#E1306C]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate text-[var(--foreground)]">{camp.campaign_name}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] truncate">{camp.post_type || postType} &middot; {camp.schedule_type === 'later' ? 'Scheduled' : 'Now'}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight",
                        camp.posting_status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                          camp.posting_status === 'failed' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {camp.posting_status || 'Pending'}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-primary hover:bg-primary/10 active:scale-95" onClick={() => camp.post_url && window.open(camp.post_url, '_blank')}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 active:scale-95" onClick={() => handleDeleteCampaign(camp.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {camp.error_message && (
                      <p className="mt-1.5 text-[9px] text-red-500 leading-relaxed truncate pl-[42px]">{camp.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30">
      {/* Top Header & Account Bar */}
      <div className="flex flex-col border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl z-30">
        <div className="h-12 lg:h-14 flex items-center justify-between px-3 lg:px-4 border-b border-[var(--border)]/50">
          <div className="flex items-center gap-2 lg:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('list')}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] shrink-0"
            >
              <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <div className="h-4 lg:h-6 w-px bg-[var(--border)]" />
            <h1 className="text-xs lg:text-sm font-semibold tracking-wide text-[var(--foreground)]/80 truncate">
              <span className="hidden lg:inline">Social Poster /</span>
              <span className="text-[var(--foreground)] capitalize font-bold ml-0 lg:ml-2">{postType?.replace('-', ' ')} Studio</span>
            </h1>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="w-7 h-7 lg:w-9 lg:h-9 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left - Account Selector & Composer */}
        <section className="flex-1 flex flex-col min-h-0 bg-[var(--background)] lg:border-r border-[var(--border)]">
          {/* Account Selector */}
          <div className="border-b border-[var(--border)] bg-[var(--card)] px-3 lg:px-6 py-2 lg:py-3 shrink-0">
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] shrink-0">
                {postType === 'multimedia' ? 'Pages' : 'Accounts'}
              </span>
              <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-md p-0.5 h-6 lg:h-7">
                <button onClick={() => setPlatform('all')} className={cn("px-1.5 lg:px-2 text-[9px] lg:text-[10px] rounded font-medium h-full", platform === 'all' ? "bg-primary text-primary-foreground" : "text-[var(--muted-foreground)]")}>All</button>
                <button onClick={() => setPlatform('facebook')} className={cn("flex items-center gap-0.5 px-1.5 lg:px-2 text-[9px] lg:text-[10px] rounded font-medium h-full", platform === 'facebook' ? "bg-[#1877F2] text-white" : "text-[var(--muted-foreground)]")}>
                  <Facebook className="w-2 h-2" /> FB
                </button>
                {(postType !== 'cta' && postType !== 'carousel') && (
                  <button onClick={() => setPlatform('instagram')} className={cn("flex items-center gap-0.5 px-1.5 lg:px-2 text-[9px] lg:text-[10px] rounded font-medium h-full", platform === 'instagram' ? "bg-[#E1306C] text-white" : "text-[var(--muted-foreground)]")}>
                    <Instagram className="w-2 h-2" /> IG
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {isLoadingAccounts ? (
                <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
              ) : (postType === 'cta' || postType === 'carousel') ? (
                uniqueAccounts.filter(a => a.type === 'facebook').map(acc => (
                  <button key={acc.accountId} onClick={() => setSelectedParentAccounts(prev => prev.includes(acc.accountId) ? prev.filter(id => id !== acc.accountId) : [...prev, acc.accountId])}
                    className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium whitespace-nowrap shrink-0", selectedParentAccounts.includes(acc.accountId) ? "bg-primary/10 border-primary" : "bg-[var(--background)] border-[var(--border)]")}>
                    <img src={acc.image} alt="" className="w-4 h-4 rounded-full" />
                    {acc.accountName}
                  </button>
                ))
              ) : (
                filteredAccounts.map(acc => (
                  <button key={acc.id} onClick={() => setSelectedAccounts(prev => prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
                    className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium whitespace-nowrap shrink-0", selectedAccounts.includes(acc.id) ? "bg-primary/5 border-primary" : "bg-[var(--background)] border-[var(--border)]")}>
                    <img src={acc.image} alt="" className="w-4 h-4 rounded-full" />
                    {acc.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {step === 'studio' && postType === 'carousel' ? (
              <CarouselComposer
                onPublish={handlePublish}
                isPublishing={isPublishingCarousel}
                accounts={accounts}
                isLoadingAccounts={isLoadingAccounts}
                selectedParentAccounts={selectedParentAccounts}
                onChange={handleCarouselChange}
              />
            ) : (
              <Composer
                onContentChange={setCaption}
                onMediaChange={setMedia}
                type={postType}
                onPublish={handlePublish}
                isPublishing={isPublishing}
                accounts={accounts}
                selectedParentAccounts={selectedParentAccounts}
                onTabChange={setMultimediaTab}
                onLinkChange={setLinkUrlPreview}
                onCtaTypeChange={setCtaTypePreview}
              />
            )}
          </div>
        </section>

          {/* Right - Preview (Desktop) */}
          <section className="hidden lg:block w-[400px] xl:w-[480px] shrink-0 h-full bg-[var(--background)] shadow-[-10px_0_30px_rgba(0,0,0,0.02)] relative z-20">
            <PostPreview
              content={caption}
              media={media}
              type={postType === 'multimedia' ? multimediaTab : postType}
              carouselItems={carouselItemsPreview}
              sliderImages={sliderImagesPreview}
              carouselTab={carouselTab}
              linkUrl={linkUrlPreview}
              ctaTypeLabel={ctaTypePreview}
            />
          </section>
        {/* Mobile Preview Button */}
        <button
          onClick={() => setShowMobilePreview(true)}
          className="lg:hidden fixed bottom-6 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Smartphone className="w-5 h-5" />
        </button>

        {/* Mobile Preview Overlay */}
        {showMobilePreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-[var(--background)] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
                <h2 className="text-sm font-bold">Preview</h2>
                <button onClick={() => setShowMobilePreview(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--background)] active:scale-90 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <PostPreview
                  content={caption}
                  media={media}
                  type={postType === 'multimedia' ? multimediaTab : postType}
                  carouselItems={carouselItemsPreview}
                  sliderImages={sliderImagesPreview}
                  carouselTab={carouselTab}
                  linkUrl={linkUrlPreview}
                  ctaTypeLabel={ctaTypePreview}
                />
              </div>
            </div>
          </div>
        )}
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
