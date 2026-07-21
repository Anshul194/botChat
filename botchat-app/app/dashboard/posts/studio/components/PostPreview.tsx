"use client";

import React, { useState } from 'react';
import { 
  Facebook, 
  Instagram, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Monitor, 
  Smartphone, 
  Layout,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useResizeObserver } from '@/hooks/use-resize-observer'; // I'll assume this exists or create a simple one

interface PostPreviewProps {
  content: string;
  media: string[];
  type: string | null;
  carouselItems?: any[];
  sliderImages?: string[];
  carouselTab?: string;
  linkUrl?: string;
  ctaTypeLabel?: string;
}

export function PostPreview({ content, media, type, carouselItems, sliderImages, carouselTab, linkUrl, ctaTypeLabel }: PostPreviewProps) {
  const formatCta = (val: string) => {
    if (!val) return 'Learn More';
    return val.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };
  const displayCtaLabel = formatCta(ctaTypeLabel || 'LEARN_MORE');
  const [platform, setPlatform] = useState<'facebook' | 'instagram'>('instagram');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  React.useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const shellHeight = device === 'mobile' ? 650 : 400; // Expected height of mockup
      const padding = 40;
      const availableHeight = container.clientHeight - padding;
      
      if (availableHeight < shellHeight) {
        setScale(availableHeight / shellHeight);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [device]);

  const displayMedia = type === 'carousel' 
    ? (carouselTab === 'video' ? (sliderImages || []) : (carouselItems?.map(item => item.image).filter(Boolean) || []))
    : media;

  const nextMedia = () => setCurrentMediaIndex((prev) => (prev + 1) % displayMedia.length);
  const prevMedia = () => setCurrentMediaIndex((prev) => (prev - 1 + displayMedia.length) % displayMedia.length);

  return (
    <div className="flex flex-col h-full bg-[var(--background)] p-6 gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Live Preview</h3>
        <div className="flex gap-2">
          <Tabs value={platform} onValueChange={(v: any) => setPlatform(v)} className="w-auto">
            <TabsList className="bg-[var(--card)] border border-[var(--border)] h-8">
              <TabsTrigger value="instagram" className="px-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Instagram
              </TabsTrigger>
              <TabsTrigger value="facebook" className="px-3 text-xs data-[state=active]:bg-[#1877F2] data-[state=active]:text-white">
                Facebook
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex bg-[var(--card)] border border-[var(--border)] rounded-lg p-1 h-8">
            <button 
              onClick={() => setDevice('mobile')}
              className={`px-2 rounded transition-colors ${device === 'mobile' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setDevice('desktop')}
              className={`px-2 rounded transition-colors ${device === 'desktop' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 flex items-center justify-center relative min-h-0">
        {/* Device Shell */}
        <div 
          style={{ transform: `scale(${scale})` }}
          className={`relative transition-all duration-500 ease-out border-[8px] border-[var(--foreground)] rounded-[3rem] bg-[var(--background)] shadow-2xl overflow-hidden shrink-0 origin-center ${
          device === 'mobile' ? 'w-[320px] h-[640px]' : 'w-[500px] h-[375px] rounded-xl'
        }`}>
          
          <div className="h-full bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-y-auto hide-scrollbar">
            {platform === 'instagram' ? (
              /* Instagram Mockup */
              <>
                <div className="p-3 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--background)] z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-[var(--background)] p-[1.5px]">
                            <div className="w-full h-full rounded-full bg-[var(--border)]" />
                        </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">your_page</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Sponsored</p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-[var(--muted-foreground)]" />
                </div>

                {type === 'text' ? (
                  <div 
                    className="aspect-square flex items-center justify-center p-6 text-center shadow-inner border-y border-[var(--border)]"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                  >
                    <p className="text-white font-bold text-[14px] leading-relaxed whitespace-pre-wrap">{content || 'Your text post here'}</p>
                  </div>
                ) : (
                  <div className="aspect-square bg-[var(--card)] border-y border-[var(--border)] flex items-center justify-center relative group">
                    {displayMedia.length > 0 ? (
                      <>
                          <img src={displayMedia[currentMediaIndex]} className="w-full h-full object-cover transition-all" alt="Preview" />
                          {displayMedia.length > 1 && (
                              <>
                                  <button onClick={prevMedia} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button onClick={nextMedia} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ChevronRight className="w-4 h-4" />
                                  </button>
                                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                      {displayMedia.map((_, i) => (
                                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentMediaIndex ? 'bg-primary' : 'bg-[var(--card)]/50'}`} />
                                      ))}
                                  </div>
                              </>
                          )}
                          {/* Carousel Title Overlay (Instagram style bottom) */}
                          {type === 'carousel' && carouselItems?.[currentMediaIndex]?.title && (
                            <div className="absolute bottom-8 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
                               <p className="text-xs font-bold truncate">{carouselItems[currentMediaIndex].title}</p>
                               {carouselItems[currentMediaIndex].description && (
                                 <p className="text-[10px] opacity-80 line-clamp-1">{carouselItems[currentMediaIndex].description}</p>
                               )}
                            </div>
                          )}
                      </>
                    ) : type === 'cta' || type === 'link' ? (
                      <div className="w-full h-full bg-[var(--muted)]/50 flex flex-col items-center justify-center border-y border-[var(--border)] overflow-hidden">
                         {linkUrl ? (
                            <div className="w-full h-full flex flex-col bg-[var(--card)]">
                               <div className="flex-1 bg-[var(--muted)]/70 flex flex-col items-center justify-center text-[var(--muted-foreground)]/70 p-6 text-center">
                                  <ExternalLink className="w-8 h-8 mb-2 opacity-50" />
                                  <span className="text-xs font-bold line-clamp-1 break-all w-full">{linkUrl}</span>
                               </div>
                               <div className="p-3 bg-[var(--muted)]/50 border-t border-[var(--border)]">
                                  <p className="text-xs font-bold text-[var(--foreground)] line-clamp-1">{linkUrl ? new URL(linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`).hostname : 'Link Preview'}</p>
                                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-1 mt-0.5">{content || 'A summary of the linked content will appear here.'}</p>
                               </div>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center gap-2 opacity-30 p-6 text-center">
                              <ExternalLink className="w-10 h-10" />
                              <span className="text-[10px] font-medium uppercase tracking-widest">Link Preview</span>
                            </div>
                         )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <Layout className="w-12 h-12" />
                        <span className="text-[10px] font-medium uppercase tracking-widest">Media Placeholder</span>
                      </div>
                    )}
                    {type === 'cta' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#3897f0] p-2.5 flex items-center justify-between text-white animate-in slide-in-from-bottom-2 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                          <span className="text-[11px] font-bold tracking-wide">{displayCtaLabel}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 pb-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <Heart className="w-6 h-6 hover:text-red-500 transition-colors" />
                      <MessageCircle className="w-6 h-6 hover:text-[var(--muted-foreground)] transition-colors" />
                      <Send className="w-6 h-6 hover:text-[var(--muted-foreground)] transition-colors" />
                    </div>
                    <Bookmark className="w-6 h-6 hover:text-[var(--muted-foreground)] transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold">1,234 likes</p>
                    {type !== 'text' && (
                        <p className="text-[11px] whitespace-pre-wrap">
                          <span className="font-bold mr-1">your_page</span>
                          {content || 'Your caption will appear here...'}
                        </p>
                    )}
                    <p className="text-[9px] text-[var(--muted-foreground)] uppercase">Just now</p>
                  </div>
                </div>
              </>
            ) : (
              /* Facebook Mockup */
              <>
                <div className="p-3 border-b border-[var(--border)] flex flex-col gap-3 sticky top-0 bg-[var(--background)] z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[var(--border)]" />
                        <div>
                            <p className="text-sm font-bold leading-tight">Your Page Name</p>
                            <p className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                                Just now · <GlobeIcon className="w-2 h-2" />
                            </p>
                        </div>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {content || 'Your post text will appear here...'}
                  </p>
                </div>

                {type !== 'text' && (
                  <div className="aspect-square bg-[var(--card)] border-y border-[var(--border)] flex items-center justify-center relative group">
                     {displayMedia.length > 0 ? (
                          <>
                              <img src={displayMedia[currentMediaIndex]} className="w-full h-full object-cover" alt="Preview" />
                               {displayMedia.length > 1 && (
                                  <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border-none text-[10px]">
                                      {currentMediaIndex + 1}/{displayMedia.length}
                                  </Badge>
                               )}
                               {/* Facebook Carousel Content Area */}
                               {type === 'carousel' && carouselItems?.[currentMediaIndex] && (
                                 <div className="absolute bottom-0 left-0 right-0 bg-[var(--card)] p-3 border-t border-[var(--border)]">
                                    <p className="text-xs font-bold text-[var(--foreground)] truncate">
                                      {carouselItems[currentMediaIndex].title || 'Card Title'}
                                    </p>
                                    <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-1">
                                      {carouselItems[currentMediaIndex].description || 'Card description goes here...'}
                                    </p>
                                    {carouselItems[currentMediaIndex].link && (
                                      <div className="mt-1 flex items-center justify-between">
                                        <span className="text-[10px] text-[var(--muted-foreground)] uppercase">
                                          {new URL(carouselItems[currentMediaIndex].link).hostname.replace('www.', '')}
                                        </span>
                                        <button className="px-2 py-0.5 bg-[var(--border)] rounded text-[10px] font-bold">Learn More</button>
                                      </div>
                                    )}
                                 </div>
                               )}
                          </>
                      ) : type === 'cta' || type === 'link' ? (
                          <div className="w-full h-full flex flex-col bg-[var(--muted)]/50">
                             {linkUrl ? (
                                <div className="flex-1 bg-[var(--muted)]/70 flex flex-col items-center justify-center text-[var(--muted-foreground)]/70 p-6 text-center">
                                    <ExternalLink className="w-10 h-10 mb-3 opacity-50" />
                                    <span className="text-sm font-bold line-clamp-1 break-all w-full">{linkUrl}</span>
                                </div>
                             ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-30">
                                    <ExternalLink className="w-12 h-12" />
                                    <span className="text-[10px] font-medium uppercase tracking-widest">Link Image</span>
                                </div>
                             )}
                          </div>
                      ) : (
                          <div className="flex flex-col items-center gap-2 opacity-20">
                              <Layout className="w-12 h-12" />
                              <span className="text-[10px] font-medium uppercase tracking-widest">Media Placeholder</span>
                          </div>
                      )}
                  </div>
                )}

                {(type === 'cta' || type === 'link') && (
                    <div className="p-3 bg-[var(--card)] flex items-center justify-between border-b border-[var(--border)] cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-bold tracking-wider mb-0.5">
                               {linkUrl ? new URL(linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`).hostname : 'EXAMPLE.COM'}
                            </p>
                            <p className="text-sm font-bold truncate text-[var(--foreground)]">{content || 'Learn more about our services'}</p>
                        </div>
                        {type === 'cta' && (
                           <button className="px-4 py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] rounded-md font-semibold text-sm transition-colors">
                              {displayCtaLabel}
                           </button>
                        )}
                    </div>
                )}

                <div className="p-2 px-4 flex items-center justify-between border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <div className="flex items-center gap-1 text-xs">
                        <div className="flex -space-x-1">
                            <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center border border-[var(--background)]">
                                <span className="text-[8px] text-white">👍</span>
                            </div>
                        </div>
                        <span>0</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                        <span>0 comments</span>
                        <span>0 shares</span>
                    </div>
                </div>

                <div className="px-2 pb-10 grid grid-cols-3 pt-1">
                    <div className="flex items-center justify-center gap-2 py-2 hover:bg-[var(--card)] rounded cursor-pointer transition-colors">
                        <span className="text-[var(--muted-foreground)] text-xs font-bold">Like</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2 hover:bg-[var(--card)] rounded cursor-pointer transition-colors">
                        <span className="text-[var(--muted-foreground)] text-xs font-bold">Comment</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2 hover:bg-[var(--card)] rounded cursor-pointer transition-colors">
                        <span className="text-[var(--muted-foreground)] text-xs font-bold">Share</span>
                    </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      </div>
    </div>
  );
}

function GlobeIcon({ className }: { className: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.048.05-.188.017-.441-.047-1.13-.286-2.547-.188-2.83.13-.204.228-.158.465.131.673.35.25.96.25 1.488.225.53-.024 1.157-.123 1.442.277.164.23.111.458-.154.67-.32.256-.75.434-1.21.616-.46.182-.958.364-1.168.64-.176.23-.105.47.211.677.566.37 1.74.225 2.533.15.537-.05 1.018-.095 1.343.153.253.193.266.42.04.62-.224.198-.56.273-.896.353-.336.08-.663.158-.813.33-.11.127-.087.252.063.376.544.448 1.942.27 2.875.143.93-.127 1.83-.25 2.193.182.203.242.146.46-.17.653-.314.192-.767.33-1.258.468-.49.138-.996.275-1.168.497-.131.17-.06.341.214.51.583.358 1.88.2 2.658.07 1.042-.174 1.823-.304 2.115.112.186.265.111.48-.22.65-.33.17-.8.293-1.305.416-.505.123-1.045.255-1.218.442-.114.123-.086.234.083.344.482.312 1.54.183 2.378.076.843-.107 1.59-.202 1.84.095.18.214.11.41-.21.564-.32.154-.77.265-1.257.376-.487.11-1.013.23-1.176.398-.112.115-.084.218.084.32a37.2 37.2 0 0 0 2.215.122c.844-.047 1.57-.09 1.8-.02.176.054.168.192-.023.313-.365.23-1.272.196-2.093.164a35.84 35.84 0 0 0-2.315-.09c-.843.013-1.64.026-1.898.175-.19.11-.168.225.068.34a17.2 17.2 0 0 0 2.18.106c.843-.03 1.58-.06 1.777.01.177.063.14.2-.103.32-.464.23-1.464.204-2.368.178-.9-.026-1.748-.052-2.016.142-.196.142-.162.29.1.44 1.134.654 4.542.483 6.305.29 1.763-.193 3.033-.386 3.4-.04.283.266-.027.643-.918.995-.89.352-2.283.655-3.618.96-.133.03-.267.06-.4.09a8 8 0 1 1-13.96-7.31c.1.1.2.2.3.293ZM3.3 5.2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
        </svg>
    );
}
