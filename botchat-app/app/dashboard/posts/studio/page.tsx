"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountSelector } from './components/AccountSelector';
import { PostPreview } from './components/PostPreview';
import { Composer } from './components/Composer';
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
import { createCampaign, fetchCampaigns } from "@/store/slices/socialPostingSlice";
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
  
  // Real Account State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { campaigns, isLoading: isLoadingCampaigns } = useSelector((state: RootState) => state.socialPosting);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (step === 'list') {
      dispatch(fetchCampaigns({ per_page: 50 }));
    }
    
    window.dispatchEvent(new Event("collapseDesktopSidebar"));
    setGlobalSidebarCollapsed(true);
    
    return () => {
        window.dispatchEvent(new Event("expandDesktopSidebar"));
    };
  }, [step, dispatch]);

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

      const normalizedFb = fbAccounts.flatMap((acc: any) => acc.pages || []).map((p: any) => ({
        id: p.page_id,
        name: p.page_name,
        type: 'facebook',
        image: p.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${p.page_name}`,
        platformId: p.id
      }));

      const normalizedIg = igAccounts.map((a: any) => ({
        id: a.username,
        name: a.name || a.username,
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
    if (!composerData.campaignName) {
        showModal("error", "Validation Error", "Please provide a campaign name.");
        return;
    }
    if (selectedAccounts.length === 0) {
        showModal("error", "Validation Error", "Please select at least one account.");
        return;
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

        // Use the first selected account to determine media_type for simplicity,
        // or loop through to send separate requests if mixed.
        // Assuming Postman body: "media_type": "facebook" | "instagram"
        const primaryAccountType = accounts.find(a => a.id === selectedAccounts[0])?.type || 'facebook';

        const payload: any = {
            campaign_name: composerData.campaignName,
            media_type: primaryAccountType,
            publisher_type: primaryAccountType === 'facebook' ? 'page' : 'account',
            post_type: composerData.postType, // mapped from activeTab ('text', 'link', 'image', 'video')
            message: composerData.caption,
            schedule_type: composerData.isScheduling ? 'later' : 'now',
            selected_pages: selectedPages
        };

        if (payload.post_type === 'image') {
            payload.image_urls = composerData.media;
        } else if (payload.post_type === 'video') {
            payload.video_url = composerData.media[0]; // Assuming video tab sets media array to [videoUrl]
        } else if (payload.post_type === 'link') {
            payload.link = composerData.linkUrl;
        }

        if (payload.schedule_type === 'later') {
            payload.schedule_time = `${composerData.scheduleDate} ${composerData.scheduleTime}:00`;
        }

        const result = await dispatch(createCampaign(payload)).unwrap();
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

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platform === 'all' || a.type === platform;
    return matchesSearch && matchesPlatform;
  });

  const fbCount = accounts.filter(a => a.type === 'facebook').length;
  const igCount = accounts.filter(a => a.type === 'instagram').length;

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative z-10"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1">Choose Campaign Type</Badge>
          <h1 className="text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-[var(--foreground)] to-[var(--muted-foreground)]">
            What are we creating today?
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
            Select the type of post you want to publish across your social channels.
          </p>
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

        <div className="mt-12 w-full max-w-6xl relative z-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-widest">Automation Sources</span>
                <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                    onClick={() => handleSelectType('auto')}
                    className="group relative bg-[var(--card)] border border-[var(--border)] p-8 rounded-[2rem] hover:bg-[var(--secondary)] hover:border-primary/30 transition-all cursor-pointer overflow-hidden shadow-sm"
                >
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Rss className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1 text-[var(--foreground)]">RSS Auto-Post</h3>
                            <p className="text-[var(--muted-foreground)] text-sm">Automatically sync and post from your blog or news feed.</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-[var(--muted-foreground)] group-hover:text-primary transform group-hover:translate-x-2 transition-all" />
                    </div>
                </div>

                <div 
                    onClick={() => handleSelectType('auto')}
                    className="group relative bg-[var(--card)] border border-[var(--border)] p-8 rounded-[2rem] hover:bg-[var(--secondary)] hover:border-destructive/30 transition-all cursor-pointer overflow-hidden shadow-sm"
                >
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                            <Youtube className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1 text-[var(--foreground)]">Youtube Sync</h3>
                            <p className="text-[var(--muted-foreground)] text-sm">Share your new Youtube videos on Facebook & Instagram instantly.</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-[var(--muted-foreground)] group-hover:text-destructive transform group-hover:translate-x-2 transition-all" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (step === 'list') {
    return (
      <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30">
        <div className="h-16 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              onClick={() => setStep('select')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] capitalize">
              {postType?.replace('-', ' ')} Campaigns
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              onClick={() => setStep('studio')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Post
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Recent Posts</h2>
              <div className="flex gap-2">
                 <Badge variant="outline" className="border-[var(--border)] text-[var(--muted-foreground)]">All</Badge>
                 <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Scheduled</Badge>
                 <Badge variant="outline" className="border-[var(--border)] text-[var(--muted-foreground)]">Published</Badge>
              </div>
            </div>

            {isLoadingCampaigns ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]/50">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">No campaigns yet</h3>
                <p className="text-[var(--muted-foreground)] max-w-sm mx-auto mb-6">
                  Get started by creating your first multi-platform social media post.
                </p>
                <Button onClick={() => setStep('studio')} className="bg-primary">
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(camp => (
                  <div key={camp.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-primary/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        {camp.media_type === 'facebook' && <div className="p-2 bg-[#1877F2]/10 rounded-lg text-[#1877F2]"><Facebook className="w-4 h-4" /></div>}
                        {camp.media_type === 'instagram' && <div className="p-2 bg-[#E1306C]/10 rounded-lg text-[#E1306C]"><Instagram className="w-4 h-4" /></div>}
                      </div>
                      <Badge variant="outline" className={cn(
                        "capitalize text-xs font-semibold",
                        camp.posting_status === 'published' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      )}>
                        {camp.posting_status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-[var(--foreground)] truncate">{camp.campaign_name}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">{camp.message || "No caption provided"}</p>
                    
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-4 border-t border-[var(--border)]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {camp.schedule_type === 'later' && camp.schedule_time 
                          ? new Date(camp.schedule_time).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) 
                          : 'Publish Now'}
                      </div>
                      <div className="font-medium capitalize">{camp.post_type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                Select Accounts ({selectedAccounts.length})
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
                  <Facebook className="w-3 h-3" /> FB ({fbCount})
                </button>
                <button 
                  onClick={() => setPlatform('instagram')}
                  className={cn("flex items-center gap-1 px-3 text-xs rounded transition-colors font-medium h-full", platform === 'instagram' ? "bg-[#E1306C] text-white" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}
                >
                  <Instagram className="w-3 h-3" /> IG ({igCount})
                </button>
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
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccounts(prev => prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap shrink-0",
                    selectedAccounts.includes(acc.id) 
                      ? "bg-primary/10 border-primary text-[var(--foreground)] shadow-sm" 
                      : "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-primary/50"
                  )}
                >
                  <img src={acc.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                  {acc.type === 'facebook' ? <Facebook className="w-3 h-3 text-[#1877F2]" /> : <Instagram className="w-3 h-3 text-[#E1306C]" />}
                  <span className="text-sm font-medium">{acc.name}</span>
                </button>
              ))
            ) : (
              <div className="text-sm text-[var(--muted-foreground)]">No matching accounts found.</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex h-full overflow-hidden">
          {/* Center - Composer */}
          <section className="flex-[1.2] border-r border-[var(--border)] h-full">
            <Composer 
              onContentChange={setCaption}
              onMediaChange={setMedia}
              type={postType}
              onPublish={handlePublish}
              isPublishing={isPublishing}
            />
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
