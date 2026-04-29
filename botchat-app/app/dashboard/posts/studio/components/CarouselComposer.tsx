"use client";

import React, { useState } from 'react';
import {
  Plus,
  X,
  Send,
  Loader2,
  Layers,
  HelpCircle,
  Clock,
  Globe,
  Layout
} from 'lucide-react';
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CarouselComposerProps {
  onPublish: (data: any) => void;
  isPublishing: boolean;
  accounts: any[];
  isLoadingAccounts: boolean;
  selectedParentAccounts: string[];
  onChange?: (data: any) => void;
}

export function CarouselComposer({ onPublish, isPublishing, accounts, isLoadingAccounts, selectedParentAccounts, onChange }: CarouselComposerProps) {
  const [activeTab, setActiveTab] = useState<'carousel' | 'video'>('carousel');
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [carouselItems, setCarouselItems] = useState([{ title: '', description: '', link: '', image: '' }]);
  const [imageDuration, setImageDuration] = useState('1');
  const [transitionDuration, setTransitionDuration] = useState('1');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [repeatTimes, setRepeatTimes] = useState('0');
  const [timeInterval, setTimeInterval] = useState('0');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const [selectedPageId, setSelectedPageId] = useState<string>('');

  React.useEffect(() => {
    if (onChange) {
      onChange({
        campaignName,
        message,
        carouselItems,
        activeTab,
        imageDuration,
        transitionDuration,
        selectedPageId
      });
    }
  }, [campaignName, message, carouselItems, activeTab, imageDuration, transitionDuration, selectedPageId, onChange]);

  const filteredPages = accounts.filter(a => selectedParentAccounts.includes(a.accountId));

  const addCarouselItem = () => {
    setCarouselItems([...carouselItems, { title: '', description: '', link: '', image: '' }]);
  };

  const removeCarouselItem = (index: number) => {
    const updated = carouselItems.filter((_, i) => i !== index);
    setCarouselItems(updated.length ? updated : [{ title: '', description: '', link: '', image: '' }]);
  };

  const updateItemValue = (index: number, field: string, val: string) => {
    const updated = [...carouselItems];
    (updated[index] as any)[field] = val;
    setCarouselItems(updated);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    try {
      const response = await api.post('/facebook/bot-replies/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response.data.url || response.data.data?.url || response.data;
      updateItemValue(index, 'image', url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleVideoImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsVideoUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('type', 'image');
        const response = await api.post('/facebook/bot-replies/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = response.data.url || response.data.data?.url || response.data;
        uploadedUrls.push(url);
      }
      console.log('Uploaded video images:', uploadedUrls);
      // Batch update or handle video images state here
    } catch (err) {
      console.error('Video images upload failed', err);
    } finally {
      setIsVideoUploading(false);
    }
  };

  const handlePublish = () => {
    // Correctly find the selected page by converting both to string for safe comparison
    const selectedPage = accounts.find(a => String(a.id) === String(selectedPageId));

    console?.log("my page", selectedPage)

    const baseData = {
      campaign_name: campaignName,
      publisher_type: 'page',
      message: message,
      schedule_type: isScheduling ? 'later' : 'now',
      schedule_time: isScheduling && scheduleDate && scheduleTime ? `${scheduleDate} ${scheduleTime}:00` : null,
      repeat_times: isScheduling ? (parseInt(repeatTimes) || 0) : 0,
      time_interval: isScheduling ? (parseInt(timeInterval) || 0) : null,
      selected_pages: selectedPage ? [{
        id: selectedPage.id,
        platform_id: String(selectedPage.platformId)
      }] : []
    };

    if (activeTab === 'carousel') {
      onPublish({
        ...baseData,
        post_type: 'carousel',
        carousel_content: carouselItems
          .filter(item => item.image.trim() !== '')
          .map(item => ({
            name: item.title,
            description: item.description,
            link: item.link,
            picture: item.image
          }))
      });
    } else {
      onPublish({
        ...baseData,
        post_type: 'slider',
        slider_images: [] // TODO: Add logic for video slideshow images if applicable
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--card)] p-6 gap-6 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Slider/Carousel form</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Create a multi-image slider post</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Campaign name</Label>
            <Input
              className="bg-[var(--background)] border-[var(--border)] h-11 rounded-xl"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('carousel')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all border-b-2",
            activeTab === 'carousel' ? "border-primary text-primary" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          Carousel
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all border-b-2",
            activeTab === 'video' ? "border-primary text-primary" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          Video Slide Show
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {activeTab === 'carousel' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="space-y-2">
              <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Select Page to Post</Label>
              <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                <SelectTrigger className="bg-[var(--background)] border-[var(--border)] h-11 rounded-xl">
                  <SelectValue placeholder={selectedParentAccounts.length === 0 ? "Select account in top header first" : "Select a page to post"} />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="rounded-xl border-[var(--border)] bg-[var(--card)] shadow-2xl z-50">
                  {filteredPages.length > 0 ? filteredPages.map(page => (
                    <SelectItem key={page.id} value={page.id} className="rounded-lg py-2.5">
                      <div className="flex items-center gap-2">
                        <img src={page.image} className="w-4 h-4 rounded-full" />
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
              <div className="flex items-center gap-1">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Message</Label>
                <HelpCircle className="w-3 h-3 text-primary" />
              </div>
              <Textarea
                placeholder="Type your message here..."
                className="min-h-[100px] bg-[var(--background)] border-[var(--border)] resize-none rounded-xl p-4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Carousel Items</Label>
                <Button variant="ghost" size="sm" onClick={addCarouselItem} className="text-primary hover:bg-primary/10 text-xs font-bold">
                  <Plus className="w-3 h-3 mr-1" /> Add Slide
                </Button>
              </div>

              <div className="space-y-6">
                {carouselItems.map((item, idx) => (
                  <div key={idx} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 relative group">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="text-[10px] font-black text-primary/30 uppercase">Slide #{idx + 1}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCarouselItem(idx)}
                        className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Title</Label>
                        <Input
                          className="bg-[var(--card)] border-[var(--border)] h-10 rounded-xl text-sm"
                          value={item.title}
                          onChange={(e) => updateItemValue(idx, 'title', e.target.value)}
                          placeholder="Slide title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Link</Label>
                        <Input
                          className="bg-[var(--card)] border-[var(--border)] h-10 rounded-xl text-sm"
                          value={item.link}
                          onChange={(e) => updateItemValue(idx, 'link', e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Description</Label>
                        <Textarea
                          className="bg-[var(--card)] border-[var(--border)] min-h-[60px] rounded-xl text-sm resize-none"
                          value={item.description}
                          onChange={(e) => updateItemValue(idx, 'description', e.target.value)}
                          placeholder="Slide description..."
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            className="bg-[var(--card)] border-[var(--border)] h-10 rounded-xl text-sm"
                            value={item.image}
                            onChange={(e) => updateItemValue(idx, 'image', e.target.value)}
                            placeholder="Paste image URL here"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              id={`file-upload-${idx}`}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(idx, e)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl h-10 px-4 whitespace-nowrap"
                              onClick={() => document.getElementById(`file-upload-${idx}`)?.click()}
                              disabled={uploadingIndex === idx}
                            >
                              {uploadingIndex === idx ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              {uploadingIndex === idx ? 'Uploading...' : 'Upload'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Message</Label>
              <Textarea
                placeholder="Type your video message here..."
                className="min-h-[100px] bg-[var(--background)] border-[var(--border)] resize-none rounded-xl p-4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Image Duration (sec)</Label>
                <Select value={imageDuration} onValueChange={setImageDuration}>
                  <SelectTrigger className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="rounded-xl border-[var(--border)] bg-[var(--card)]">
                    <SelectItem value="1">1 second</SelectItem>
                    <SelectItem value="2">2 seconds</SelectItem>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Transition Duration (sec)</Label>
                <Select value={transitionDuration} onValueChange={setTransitionDuration}>
                  <SelectTrigger className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="rounded-xl border-[var(--border)] bg-[var(--card)]">
                    <SelectItem value="0.5">0.5 seconds</SelectItem>
                    <SelectItem value="1">1 second</SelectItem>
                    <SelectItem value="1.5">1.5 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Images for Video</Label>
                <Button variant="outline" size="sm" className="rounded-xl h-9 border-primary text-primary font-bold">
                  <Plus className="w-3 h-3 mr-1" /> Add Images
                </Button>
              </div>
              <div className="p-10 border-2 border-dashed border-[var(--border)] rounded-2xl bg-primary/5 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">No images selected</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Upload at least 2 images to create a slideshow video</p>
                </div>
                <input
                  type="file"
                  id="video-images-upload"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleVideoImagesUpload}
                />
                <Button
                  variant="outline"
                  className="rounded-xl h-10 px-8 bg-white font-bold border-[var(--border)]"
                  onClick={() => document.getElementById('video-images-upload')?.click()}
                  disabled={isVideoUploading}
                >
                  {isVideoUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isVideoUploading ? 'Uploading...' : 'Upload Images'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--border)] space-y-6">
          <div className="flex items-center gap-3">
            <Switch
              checked={!isScheduling}
              onCheckedChange={(checked) => setIsScheduling(!checked)}
              className="data-[state=checked]:bg-primary"
            />
            <Label className="text-sm font-semibold">Post now</Label>
          </div>

          {isScheduling && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Schedule time</Label>
                  <div className="flex gap-2">
                    <Input type="date" className="bg-[var(--background)] border-[var(--border)] flex-1 h-11 rounded-xl" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                    <Input type="time" className="bg-[var(--background)] border-[var(--border)] flex-1 h-11 rounded-xl" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">Repeat this post</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="bg-[var(--background)] border-[var(--border)] h-11 rounded-xl" value={repeatTimes} onChange={(e) => setRepeatTimes(e.target.value)} />
                    <span className="text-xs text-[var(--muted-foreground)] font-bold">Times</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
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
                      <SelectItem value="10080" className="rounded-lg py-2.5">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-indigo-500" />
                          Every Week
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
          <Button variant="outline" className="px-8 border-[var(--border)] h-11 rounded-xl">Cancel</Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-10 font-bold h-11 rounded-xl"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Create Carousel
          </Button>
        </div>
      </div>
    </div>
  );
}
