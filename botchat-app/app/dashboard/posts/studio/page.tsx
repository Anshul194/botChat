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
  Search,
  Grid,
  Layout,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  X,
  Filter,
  CheckCircle2
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
  const [step, setStep] = useState<'select' | 'list' | 'studio'>('select');
  const [postType, setPostType] = useState<string | null>(null);
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
    setPostType(type);
    setStep('list');
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
        const selectedPages = selectedAccounts.map(id => {
            const acc = accounts.find(a => a.id === id);
            return {
                id: acc?.platformId || id, // Mapping to platform_id needed by API
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
    const activeCampaigns = (postType === 'carousel' ? carouselCampaigns : (postType === 'cta' ? ctaCampaigns : campaigns)) || [];
    const filteredCampaigns = activeCampaigns.filter((c: any) =>
      c.campaign_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30">
        <div className="h-20 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => setStep('select')} className="rounded-xl hover:bg-primary/10">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight capitalize">{postType?.replace('-', ' ')} Campaigns</h1>
              <p className="text-xs text-[var(--muted-foreground)] font-medium">Manage and track your social media campaigns</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search campaigns..."
                className="pl-10 h-10 bg-[var(--background)] border-[var(--border)] rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-xl p-1 h-10 shadow-sm">
              <button
                onClick={() => setListView('row')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2",
                  listView === 'row' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <Layout className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Row</span>
              </button>
              <button
                onClick={() => setListView('card')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2",
                  listView === 'card' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <Grid className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Card</span>
              </button>
            </div>

            <Button onClick={() => setStep('studio')} className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[var(--background)]/50">
          {filteredCampaigns.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Send className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">No campaigns found</h3>
              <p className="text-sm">Start by creating your first {postType} campaign</p>
            </div>
          ) : listView === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredCampaigns.map((camp: any, idx: number) => (
                <div key={camp.id || idx} className="group bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-500 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Send className="w-20 h-20" />
                  </div>

                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Layers className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="bg-[var(--background)] text-[10px] font-bold tracking-tighter uppercase px-2 py-0.5 rounded-lg border-[var(--border)]">
                      {camp.post_type || postType}
                    </Badge>
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors truncate">{camp.campaign_name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--background)] rounded-full border border-[var(--border)]">
                        <Clock className="w-3 h-3" />
                        {camp.schedule_type === 'later' ? 'Scheduled' : 'Posted Now'}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-bold text-[10px] uppercase",
                        camp.posting_status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          camp.posting_status === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {camp.posting_status || 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                        {camp.media_type === 'facebook' ? <Facebook className="w-3 h-3 text-[#1877F2]" /> : <Instagram className="w-3 h-3 text-[#E1306C]" />}
                      </div>
                      <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase truncate max-w-[100px]">
                        {camp.social_account_id || 'Page ID: ' + camp.page_group_user_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {camp.post_url && (
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => window.open(camp.post_url, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-red-500/10 hover:text-red-500" onClick={() => handleDeleteCampaign(camp.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-primary/10 hover:text-primary">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  {camp.error_message && (
                    <div className="mt-2 text-[10px] text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/10 line-clamp-2">
                      {camp.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Campaign & Account</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-center">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Schedule</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((camp: any, idx: number) => (
                    <tr key={camp.id || idx} className="group hover:bg-primary/[0.02] transition-colors border-b border-[var(--border)]/50 last:border-none">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform relative">
                            <Layers className="w-6 h-6" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                              {camp.media_type === 'facebook' ? <Facebook className="w-3 h-3 text-[#1877F2]" /> : <Instagram className="w-3 h-3 text-[#E1306C]" />}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{camp.campaign_name}</p>
                            <p className="text-[10px] text-[var(--muted-foreground)] font-bold flex items-center gap-1">
                              ID: #{camp.id} <span className="opacity-30">•</span> {camp.media_type?.toUpperCase()} ACCOUNT #{camp.social_account_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge variant="outline" className="rounded-lg text-[10px] font-bold tracking-tight uppercase px-3 py-1 bg-[var(--background)]">
                          {camp.post_type || postType}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {camp.schedule_type === 'later' ? 'Scheduled' : 'Direct Post'}
                          </div>
                          <p className="text-[10px] text-[var(--muted-foreground)] pl-5">
                            {camp.schedule_time ? new Date(camp.schedule_time).toLocaleString() : 'Executed immediately'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter",
                          camp.posting_status === 'completed'
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : camp.posting_status === 'failed'
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            camp.posting_status === 'completed' ? "bg-emerald-500" :
                              camp.posting_status === 'failed' ? "bg-red-500" : "bg-amber-500 animate-pulse"
                          )} />
                          {camp.posting_status || 'Pending'}
                        </div>
                        {camp.error_message && (
                          <div className="mt-2 text-[10px] text-red-500 font-medium max-w-[200px] truncate hover:whitespace-normal hover:overflow-visible hover:bg-[var(--background)] hover:p-2 hover:rounded hover:shadow-lg transition-all" title={camp.error_message}>
                            {camp.error_message}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {camp.post_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                              onClick={() => window.open(camp.post_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                            onClick={() => handleDeleteCampaign(camp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex h-full overflow-hidden">
          {/* Left - Account Selector & Composer */}
          <section className="flex-1 border-r border-[var(--border)] h-full flex flex-col overflow-hidden bg-[var(--background)]">
            {/* Account Selector */}
            <div className="flex flex-col border-b border-[var(--border)] bg-[var(--card)] px-6 py-3 gap-3 shrink-0 z-10">
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
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  <div className="flex items-center gap-2 bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--border)] shadow-sm shrink-0">
                    <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase flex items-center gap-1.5">
                      <Filter className="w-3 h-3" /> Filter by Account:
                    </span>
                    <div className="h-3 w-px bg-[var(--border)] mx-1" />
                    <div className="flex items-center gap-1.5">
                      {uniqueAccounts
                        .filter(acc => platform === 'all' || acc.type === platform)
                        .map(acc => (
                          <button
                            key={acc.accountId}
                            onClick={() => setSelectedParentAccounts(prev => prev.includes(acc.accountId) ? prev.filter(id => id !== acc.accountId) : [...prev, acc.accountId])}
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                              selectedParentAccounts.includes(acc.accountId)
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                            )}
                          >
                            {acc.type === 'facebook' ? <Facebook className="w-3 h-3" /> : <Instagram className="w-3 h-3" />}
                            {acc.accountName}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccounts(prev => prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
                        className={cn(
                          "relative flex items-center gap-3 pl-3 pr-8 py-2.5 rounded-xl border transition-all whitespace-nowrap shrink-0 overflow-hidden group",
                          selectedAccounts.includes(acc.id)
                            ? "bg-primary/5 border-primary shadow-[0_0_0_1px_var(--theme-primary)]"
                            : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--muted-foreground)] hover:bg-[var(--background)]"
                        )}
                      >
                        {selectedAccounts.includes(acc.id) && (
                          <div className="absolute inset-0 bg-primary/5" />
                        )}
                        <div className="relative z-10 flex items-center justify-center">
                          <img src={acc.image} alt="" className="w-7 h-7 rounded-full object-cover shadow-sm ring-2 ring-[var(--background)]" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--background)] rounded-full flex items-center justify-center shadow-sm">
                            {acc.type === 'facebook' ? <Facebook className="w-3 h-3 text-[#1877F2]" /> : <Instagram className="w-3 h-3 text-[#E1306C]" />}
                          </div>
                        </div>
                        <div className="flex flex-col items-start relative z-10">
                          <span className="text-sm font-bold leading-none mb-1 text-[var(--foreground)]">{acc.name}</span>
                          <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{acc.accountName}</span>
                        </div>
                        {selectedAccounts.includes(acc.id) && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-2 py-2">
                      <Loader2 className="w-3 h-3 animate-pulse opacity-50" /> No matching pages found for this post type.
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>

            {/* Composer */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
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

          {/* Right - Preview */}
          <section className="w-[400px] xl:w-[480px] shrink-0 h-full bg-[var(--background)] shadow-[-10px_0_30px_rgba(0,0,0,0.02)] relative z-20">
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
