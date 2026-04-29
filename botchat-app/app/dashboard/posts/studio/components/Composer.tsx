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
  Loader2
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

interface ComposerProps {
  onContentChange: (val: string) => void;
  onMediaChange: (val: string[]) => void;
  type: string | null;
  onPublish: (data: any) => void;
  isPublishing: boolean;
}

export function Composer({ onContentChange, onMediaChange, type, onPublish, isPublishing }: ComposerProps) {
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

  const handleCaptionChange = (val: string) => {
    setCaption(val);
    onContentChange(val);
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
        media: activeTab === 'video' ? [videoUrl] : media,
        isScheduling,
        scheduleDate,
        scheduleTime,
        ctaType,
        linkUrl,
        rssUrl,
        postType: activeTab, // 'text', 'link', 'image', 'video'
        isReel
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--card)] p-6 gap-6 overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <div className="space-y-2 animate-in fade-in">
                <div className="relative">
                  <Input 
                      placeholder="Paste link" 
                      className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] pr-24"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">Fetch Info</div>
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
                  <Button className="bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4 mr-2 transform -rotate-90" /> Upload
                  </Button>
                  
                  {activeTab === 'video' && (
                    <div className="flex items-center gap-2 h-10">
                      <Switch checked={isReel} onCheckedChange={setIsReel} className="data-[state=checked]:bg-primary" />
                      <Label className="text-sm text-[var(--muted-foreground)]">Reels post for instagram</Label>
                    </div>
                  )}
                </div>

                {activeTab === 'image' && media.length > 0 && (
                   <div className="flex gap-2 flex-wrap">
                      {media.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-[var(--border)]">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                   </div>
                )}
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
