"use client";

import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon, 
  Smile, 
  Hash, 
  Sparkles, 
  Plus, 
  X,
  Calendar,
  Send,
  Clock,
  Layers,
  ChevronDown,
  MousePointer2,
  Rss,
  Globe,
  HelpCircle,
  Loader2,
  Upload
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCtaTypes, fetchAutoReplyTemplates } from '@/store/slices/socialPostingSlice';
import type { AppDispatch, RootState } from '@/store/store';
import api from "@/lib/api";
interface ComposerProps {
  onContentChange: (val: string) => void;
  onMediaChange: (val: string[]) => void;
  onTabChange?: (tab: string) => void;
  type: string | null;
  onPublish: (data: any) => void;
  isPublishing: boolean;
  accounts: any[];
  selectedParentAccounts: string[];
}

export function Composer({ 
  onContentChange, 
  onMediaChange, 
  onTabChange,
  type, 
  onPublish, 
  isPublishing,
  accounts = [],
  selectedParentAccounts = []
}: ComposerProps) {
  const [campaignName, setCampaignName] = useState('');
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [ctaType, setCtaType] = useState('LEARN_MORE');
  const [linkUrl, setLinkUrl] = useState('');
  const [rssUrl, setRssUrl] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [isInstagram, setIsInstagram] = useState(false);
  const [isReel, setIsReel] = useState(false);
  const [ctaValue, setCtaValue] = useState('');
  const [autoReplyTemplate, setAutoReplyTemplate] = useState('');
  const [timeZone, setTimeZone] = useState('UTC');
  const [repeatTimes, setRepeatTimes] = useState('0');
  const [timeInterval, setTimeInterval] = useState('0');
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const filteredPages = accounts.filter(a => selectedParentAccounts.includes(a.accountId));

  const dispatch = useDispatch<AppDispatch>();
  const { ctaTypes, autoReplyTemplates } = useSelector((state: RootState) => state.socialPosting);

  useEffect(() => {
    if (ctaTypes.length === 0) {
      dispatch(fetchCtaTypes());
    }
    if (autoReplyTemplates.length === 0) {
      dispatch(fetchAutoReplyTemplates());
    }
  }, [dispatch, ctaTypes.length, autoReplyTemplates.length]);

  const handleCaptionChange = (val: string) => {
    setCaption(val);
    onContentChange(val);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    onTabChange?.(val);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('type', activeTab === 'video' ? 'video' : 'image');
        
        const response = await api.post('/facebook/bot-replies/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const url = response.data.url || response.data.data?.url || response.data;
        uploadedUrls.push(url);
      }
      
      const updated = [...media, ...uploadedUrls];
      setMedia(updated);
      onMediaChange(updated);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerUpload = () => {
    if (activeTab === 'video') videoInputRef.current?.click();
    else fileInputRef.current?.click();
  };

  const handleAddMedia = () => {
    const newMedia = `https://picsum.photos/seed/${Math.random()}/800/800`;
    const updated = [...media, newMedia];
    setMedia(updated);
    onMediaChange(updated);
  };

  const removeMedia = (index: number) => {
    const updated = media.filter((_, i) => i !== index);
    setMedia(updated);
    onMediaChange(updated);
  };

  const handlePublish = () => {
    onPublish({
        campaignName,
        caption,
        media,
        isScheduling,
        scheduleDate,
        scheduleTime,
        ctaType,
        ctaValue: ctaValue || linkUrl,
        linkUrl,
        rssUrl,
        postType: type === 'cta' ? 'link' : activeTab,
        isReel,
        autoReplyTemplate,
        timeZone,
        repeatTimes,
        timeInterval,
        selectedPageId
    });
  };

  if (type === 'cta') {
    return (
      <div className="flex flex-col h-full bg-[var(--card)] p-6 gap-6 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <MousePointer2 className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-lg font-bold">Campaign form</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Setup your call-to-action post</p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            multiple 
            accept="image/*"
          />
          <input 
            type="file" 
            ref={videoInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="video/*"
          />

          <div className="space-y-2">
            <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Select Page to Post</Label>
            <Select value={selectedPageId} onValueChange={setSelectedPageId}>
              <SelectTrigger className="bg-[var(--background)] border-[var(--border)] h-11 rounded-xl shadow-sm">
                <SelectValue placeholder={selectedParentAccounts.length === 0 ? "Select account in top header first" : "Select a page to post"} />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="rounded-xl border-[var(--border)] bg-[var(--card)] shadow-2xl z-[100]">
                {filteredPages.length > 0 ? filteredPages.map(page => (
                  <SelectItem key={page.id} value={String(page.id)} className="rounded-lg py-2.5">
                    <div className="flex items-center gap-2">
                      <img src={page.image} className="w-5 h-5 rounded-full object-cover" alt="" />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{page.name}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">{page.accountName}</span>
                      </div>
                    </div>
                  </SelectItem>
                )) : (
                  <div className="p-4 text-center text-xs text-[var(--muted-foreground)]">
                    {selectedParentAccounts.length === 0 ? "Please select an account from the top bar" : "No pages found for selected account"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Campaign name</Label>
            <Input 
                className="bg-[var(--background)] border-[var(--border)]"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Message</Label>
              <HelpCircle className="w-3 h-3 text-primary" />
            </div>
            <Textarea 
              placeholder="Type your message here..."
              className="min-h-[120px] bg-[var(--background)] border-[var(--border)] resize-none"
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Paste Link</Label>
                <Input 
                    className="bg-[var(--background)] border-[var(--border)]"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">CTA Button Type</Label>
                <Select value={ctaType} onValueChange={setCtaType}>
                  <SelectTrigger className="bg-[var(--background)] border-[var(--border)] h-11 rounded-xl shadow-sm focus:ring-primary/20 transition-all hover:border-primary/50">
                    <SelectValue placeholder="Select Button" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="rounded-xl border-[var(--border)] bg-[var(--card)] shadow-2xl z-50">
                    {Array.isArray(ctaTypes) && ctaTypes.map((t: any, idx) => {
                      const val = typeof t === 'string' ? t : (t?.value || t?.id || String(idx));
                      const lbl = typeof t === 'string' ? t.replace(/_/g, ' ') : (t?.label || t?.name || val);
                      return (
                        <SelectItem key={val} value={val} className="rounded-lg focus:bg-primary/10 focus:text-primary py-2.5">
                           <div className="flex items-center gap-2">
                              <MousePointer2 className="w-3 h-3 opacity-50" />
                              {lbl}
                           </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Auto Reply Template</Label>
                <Select value={autoReplyTemplate} onValueChange={setAutoReplyTemplate}>
                  <SelectTrigger className="bg-[var(--background)] border-[var(--border)] h-11 rounded-xl shadow-sm focus:ring-primary/20 transition-all hover:border-primary/50">
                    <SelectValue placeholder="Please select a template" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="rounded-xl border-[var(--border)] bg-[var(--card)] shadow-2xl z-50">
                    <SelectItem value="none" className="rounded-lg py-2.5">No template</SelectItem>
                    {autoReplyTemplates.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)} className="rounded-lg py-2.5">
                         <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {t.name}
                         </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Posting time</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch 
                    checked={!isScheduling} 
                    onCheckedChange={(checked) => setIsScheduling(!checked)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label className="text-sm font-semibold">Post now</Label>
                </div>
             </div>
          </div>

          {isScheduling && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Schedule time</Label>
                  <div className="flex gap-2">
                    <Input type="date" className="bg-[var(--background)] border-[var(--border)] flex-1" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                    <Input type="time" className="bg-[var(--background)] border-[var(--border)] flex-1" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Time zone</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger className="bg-[var(--background)] border-[var(--border)] h-11 rounded-xl shadow-sm focus:ring-primary/20 transition-all hover:border-primary/50">
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="rounded-xl border-[var(--border)] bg-[var(--card)] shadow-2xl z-50">
                      <SelectItem value="UTC" className="rounded-lg py-2.5">
                         <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-indigo-500" />
                            (GMT+0:00) UTC
                         </div>
                      </SelectItem>
                      <SelectItem value="IST" className="rounded-lg py-2.5">
                         <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-emerald-500" />
                            (GMT+5:30) India Standard Time
                         </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Repeat this post</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="bg-[var(--background)] border-[var(--border)]" value={repeatTimes} onChange={(e) => setRepeatTimes(e.target.value)} />
                    <span className="text-xs text-[var(--muted-foreground)] font-bold">Times</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Time interval</Label>
                  <Select value={timeInterval} onValueChange={setTimeInterval}>
                    <SelectTrigger className="bg-[var(--background)] border-[var(--border)] h-11 rounded-xl shadow-sm focus:ring-primary/20 transition-all hover:border-primary/50">
                      <SelectValue placeholder="Select Interval" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="rounded-xl border-[var(--border)] bg-[var(--card)] shadow-2xl z-50">
                      <SelectItem value="0" className="rounded-lg py-2.5">Periodic schedule</SelectItem>
                      <SelectItem value="1440" className="rounded-lg py-2.5">
                         <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-primary" />
                            Every 24 Hours
                         </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
            <Button variant="outline" className="px-8 border-[var(--border)]">Cancel</Button>
            <Button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-10 font-bold"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Create Campaign
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--card)] p-6 gap-6 overflow-y-auto">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        multiple 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="video/*"
      />
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center justify-between border-b border-[var(--border)] mb-6 pb-2">
            <TabsList className="bg-transparent p-0 h-auto gap-4">
              <TabsTrigger 
                value="text" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1 gap-2 text-[var(--muted-foreground)] font-bold tracking-wide"
              >
                <span className="w-4 h-4 text-xs font-serif font-black">T</span> Text
              </TabsTrigger>
              <TabsTrigger 
                value="link" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1 gap-2 text-[var(--muted-foreground)] font-bold tracking-wide"
              >
                <LinkIcon className="w-4 h-4" /> Link
              </TabsTrigger>
              <TabsTrigger 
                value="image" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1 gap-2 text-[var(--muted-foreground)] font-bold tracking-wide"
              >
                <ImageIcon className="w-4 h-4" /> Image/carousel
              </TabsTrigger>
              <TabsTrigger 
                value="video" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1 gap-2 text-[var(--muted-foreground)] font-bold tracking-wide"
              >
                <Video className="w-4 h-4" /> Video
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="ig-toggle" className="text-xs text-[var(--muted-foreground)] font-semibold">Instagram</Label>
              <Switch id="ig-toggle" checked={isInstagram} onCheckedChange={setIsInstagram} className="data-[state=checked]:bg-primary" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Top Fields Based on Tab */}
            {activeTab === 'link' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="relative">
                  <Input 
                      placeholder="Paste link" 
                      className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] pr-24"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary cursor-pointer hover:underline">Fetch Info</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--muted-foreground)]">CTA Button Type</Label>
                    <Select value={ctaType} onValueChange={setCtaType}>
                      <SelectTrigger className="bg-[var(--background)] border-[var(--border)]">
                        <SelectValue placeholder="Select Button" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(ctaTypes) && ctaTypes.map((type: any, idx) => {
                          const value = typeof type === 'string' ? type : (type?.value || type?.id || String(idx));
                          const label = typeof type === 'string' ? type.replace(/_/g, ' ') : (type?.label || type?.name || value);
                          return (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--muted-foreground)]">CTA Value (URL)</Label>
                    <Input 
                        placeholder="CTA target URL" 
                        className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                        value={ctaValue}
                        onChange={(e) => setCtaValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'image' || activeTab === 'video') && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex gap-2">
                  <Input 
                      placeholder="Paste url" 
                      className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                  />
                  {activeTab === 'image' && (
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 whitespace-nowrap">
                      IG Media Manual
                    </Button>
                  )}
                </div>
                
                <div className="flex items-start gap-4">
                  <Button 
                    className="bg-primary hover:bg-primary/90 rounded-xl"
                    onClick={triggerUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploading ? "Uploading..." : "Upload from computer"}
                  </Button>
                  
                  {activeTab === 'video' && (
                    <div className="flex items-center gap-2 h-10">
                      <Switch checked={isReel} onCheckedChange={setIsReel} className="data-[state=checked]:bg-primary" />
                      <Label className="text-sm text-[var(--muted-foreground)]">Reels post for instagram</Label>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                   {media.map((url, idx) => (
                     <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] group shadow-sm">
                        {activeTab === 'video' ? (
                           <video src={url} className="w-full h-full object-cover" />
                        ) : (
                           <img src={url} alt="" className="w-full h-full object-cover" />
                        )}
                        <button 
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                     </div>
                   ))}
                </div>

                {activeTab === 'image' && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-md text-xs">
                    Multi Image Post Limit: 10 Images. In Facebook it will be posted as multi images post, Instagram as carousel. Instagram Carousel post also supports images+videos. For Facebook multi image post, videos will be ignored.
                  </div>
                )}
              </div>
            )}

            {/* Campaign Name & Text (Global across tabs in this flow) */}
            <div className="space-y-2">
              <Label className="text-[var(--muted-foreground)] text-xs font-bold">Campaign name</Label>
              <Input 
                  className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold">Text</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3 h-3 text-primary" /></TooltipTrigger>
                    <TooltipContent>Post caption text</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="relative group">
                <Textarea 
                  placeholder="Type your message here..."
                  className="min-h-[150px] bg-[var(--background)] border-[var(--border)] focus:border-primary/30 transition-all resize-none text-[var(--foreground)] p-4"
                  value={caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Posting Time */}
            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-1 mb-2">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold">Posting time</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3 h-3 text-primary" /></TooltipTrigger>
                    <TooltipContent>Schedule when to publish</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch 
                  checked={!isScheduling} 
                  onCheckedChange={(checked) => setIsScheduling(!checked)}
                  className="data-[state=checked]:bg-primary"
                />
                <Label className="text-sm font-semibold text-[var(--foreground)]">Post now</Label>
              </div>
              
              {isScheduling && (
                <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 max-w-sm">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <Input 
                      type="date" 
                      className="bg-[var(--card)] border-[var(--border)] pl-10 text-sm text-[var(--foreground)]" 
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <Input 
                      type="time" 
                      className="bg-[var(--card)] border-[var(--border)] pl-10 text-sm text-[var(--foreground)]" 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white shadow-md shadow-blue-500/20 px-8"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2 transform -rotate-45" />}
                Submit
              </Button>
            </div>
          </div>
        </Tabs>
    </div>
  );
}
