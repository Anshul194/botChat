"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Inline SVG icons — no lucide-react dependency to avoid Turbopack HMR module factory bugs
const I = ({ d, ...p }: { d: string; className?: string; strokeWidth?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" className={p.className}><path d={d}/></svg>
);
const Sparkles = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>;
const MessageCircle = ({ className, fill, strokeWidth }: { className?: string; fill?: string; strokeWidth?: number }) => <svg viewBox="0 0 24 24" fill={fill ?? "none"} stroke="currentColor" strokeWidth={strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>;
const Send = ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>;
const Smile = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>;
const Instagram = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const ChevronLeft = ({ className }: { className?: string }) => <I d="m15 18-6-6 6-6" className={className}/>;
const CheckCircle = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
const Search = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const Home = ({ className }: { className?: string }) => <I d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10.77 12 3l9 7.77V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" className={className}/>;
const PlusSquare = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
const User = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Bookmark = ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => <I d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" className={className} strokeWidth={strokeWidth}/>;
const Heart = ({ className, fill, strokeWidth }: { className?: string; fill?: string; strokeWidth?: number }) => <svg viewBox="0 0 24 24" fill={fill ?? "none"} stroke="currentColor" strokeWidth={strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const Music2 = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/></svg>;
const Navigation = ({ className }: { className?: string }) => <I d="M3 11 22 2 13 21 11 13 3 11z" className={className}/>;
const Compass = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
const Utensils = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
const Dumbbell = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/></svg>;
const Cpu = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>;
const Sparkle = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>;
const Check = ({ className }: { className?: string }) => <I d="M20 6 9 17l-5-5" className={className}/>;

interface IndustryData {
  id: string;
  name: string;
  icon: React.ReactNode;
  username: string;
  avatarBg: string;
  postBg: string;
  postIcon: React.ReactNode;
  postTitle: string;
  postSubtitle: string;
  keyword: string;
  caption: string;
  reply1: string;
  followGateText: string;
  reply2: string;
  reply3: string;
  rewardLabel: string;
  rewardLink: string;
  bgImage: string;
  stats: {
    conversion: string;
    replies: string;
    followers: string;
  };
}

export default function Simulator() {
  const industries: IndustryData[] = [
    {
      id: "travel",
      name: "Travel",
      icon: <Compass className="w-3.5 h-3.5" />,
      username: "travel_explorer",
      avatarBg: "linear-gradient(135deg, #FF0844 0%, #FFB199 100%)",
      postBg: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      postIcon: <Compass className="w-12 h-12 text-white/90 animate-pulse" />,
      postTitle: "Swiss Alps Secret Cabin 🏔️",
      postSubtitle: "Valais, Switzerland",
      keyword: "LOCATION",
      caption: "Found the absolute most stunning hidden cabin in Switzerland. Comment LOCATION to get it! 🇨🇭",
      reply1: "Hey! 👋 I saw you commented 'LOCATION' on my latest reel.",
      followGateText: "Tap the button below and follow us to instantly receive the secret map! 🗺️",
      reply2: "It seems you haven't followed us yet! 😢\n\nTap the Follow button above so I can send you the location!",
      reply3: "Thanks! Here is the exact location coordinate:",
      rewardLabel: "Open Google Maps 🗺️",
      rewardLink: "g.co/swiss-cabin-location",
      bgImage: "/images/reels-bg.png",
      stats: { conversion: "18.4%", replies: "12,450", followers: "+3,210" }
    },
    {
      id: "fashion",
      name: "Fashion",
      icon: <Sparkles className="w-3.5 h-3.5" />,
      username: "fashionista_styles",
      avatarBg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      postBg: "linear-gradient(135deg, #e1306c 0%, #C968B7 100%)",
      postIcon: <Sparkles className="w-12 h-12 text-white/90 animate-pulse" />,
      postTitle: "Summer Linen Collection 👗",
      postSubtitle: "Paris, France",
      keyword: "LINK",
      caption: "Obsessed with this linen summer dress! Comment LINK to shop with a 15% discount. ✨",
      reply1: "Hey fashion lover! 👗 I saw you commented 'LINK' on my summer dress post.",
      followGateText: "Follow us to unlock the shop link and get your exclusive 15% off discount! 🛍️",
      reply2: "It seems you haven't followed us yet! 😢\n\nTap the Follow button above so I can send you the shop link!",
      reply3: "Yay! Here is your custom shop link and discount code:",
      rewardLabel: "Shop Summer Linen 🛒",
      rewardLink: "fashionista.co/summer-linen",
      bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=75&auto=format&fit=crop",
      stats: { conversion: "24.1%", replies: "24,800", followers: "+7,450" }
    },
    {
      id: "food",
      name: "Food",
      icon: <Utensils className="w-3.5 h-3.5" />,
      username: "wearefoodies",
      avatarBg: "linear-gradient(135deg, #F6D365 0%, #FDA085 100%)",
      postBg: "linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)",
      postIcon: <Utensils className="w-12 h-12 text-white/95 animate-pulse" />,
      postTitle: "10-Min Garlic Pasta 🍝",
      postSubtitle: "Naples, Italy",
      keyword: "RECIPE",
      caption: "The absolute creamiest garlic butter pasta ready in 10 minutes. Comment RECIPE! 😋",
      reply1: "Hey chef! 🍝 Ready to cook the best creamy garlic pasta tonight?",
      followGateText: "Follow us to unlock the full step-by-step PDF recipe card! 🍳",
      reply2: "It seems you haven't followed us yet! 😢\n\nTap the Follow button above so I can send you the recipe!",
      reply3: "Thanks for the support! Here is the link to download the PDF recipe card:",
      rewardLabel: "Download Recipe PDF 📝",
      rewardLink: "wearefoodies.com/garlic-pasta",
      bgImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=75&auto=format&fit=crop",
      stats: { conversion: "21.8%", replies: "18,920", followers: "+5,100" }
    },
    {
      id: "fitness",
      name: "Fitness",
      icon: <Dumbbell className="w-3.5 h-3.5" />,
      username: "madforfitness",
      avatarBg: "linear-gradient(135deg, #0BA360 0%, #3CBA92 100%)",
      postBg: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
      postIcon: <Dumbbell className="w-12 h-12 text-emerald-400 animate-pulse" />,
      postTitle: "7-Day Shred Meal Plan 💪",
      postSubtitle: "Gold's Gym, LA",
      keyword: "DIET",
      caption: "Get shredded in 7 days! Comment DIET to get my free high-protein meal prep guide. 🥗",
      reply1: "Hey athlete! 💪 Let's get shredded. Ready for the fat loss meal plan?",
      followGateText: "Follow us to instantly unlock the full 7-day macro meal plan chart! 🥗",
      reply2: "It seems you haven't followed us yet! 😢\n\nTap the Follow button above so I can send you the meal plan!",
      reply3: "Let's go! Here is your high-protein diet guide download:",
      rewardLabel: "Get Diet Plan PDF 🥗",
      rewardLink: "madforfitness.com/7-day-shred",
      bgImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=75&auto=format&fit=crop",
      stats: { conversion: "19.7%", replies: "15,200", followers: "+4,120" }
    },
    {
      id: "tech",
      name: "Tech",
      icon: <Cpu className="w-3.5 h-3.5" />,
      username: "superpumped_tech",
      avatarBg: "linear-gradient(135deg, #30CFD0 0%, #330867 100%)",
      postBg: "linear-gradient(135deg, #09090e 0%, #13111C 100%)",
      postIcon: <Cpu className="w-12 h-12 text-cyan-400 animate-pulse" />,
      postTitle: "Ultimate AI Tool Cheat Sheet 🤖",
      postSubtitle: "Silicon Valley",
      keyword: "AI",
      caption: "This new AI tool does 10 hours of manual coding in 5 minutes. Comment AI for access! ⚡",
      reply1: "Hey techie! 🤖 Ready to supercharge your workflow with AI?",
      followGateText: "Follow us to unlock the private beta cheat sheet and access link! ⚡",
      reply2: "It seems you haven't followed us yet! 😢\n\nTap the Follow button above so I can send you the access link!",
      reply3: "Awesome! Here is your private invitation and prompt guide link:",
      rewardLabel: "Claim AI Beta Access 🤖",
      rewardLink: "superpumped.tech/productivity-ai",
      bgImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=75&auto=format&fit=crop",
      stats: { conversion: "28.5%", replies: "31,400", followers: "+9,800" }
    },
    {
      id: "beauty",
      name: "Beauty",
      icon: <Sparkle className="w-3.5 h-3.5" />,
      username: "beauty_care",
      avatarBg: "linear-gradient(135deg, #FFC3A0 0%, #FFAFBD 100%)",
      postBg: "linear-gradient(135deg, #FFE4E1 0%, #FFF0F5 100%)",
      postIcon: <Sparkle className="w-12 h-12 text-rose-400 animate-pulse" />,
      postTitle: "4-Step Glass Skin Routine ✨",
      postSubtitle: "Seoul, South Korea",
      keyword: "SKINCARE",
      caption: "Get glass skin in 4 weeks. Comment SKINCARE for my step-by-step routine! 🧴",
      reply1: "Hey glow getter! ✨ Ready for the perfect glass skin routine?",
      followGateText: "Follow us to unlock the routine sheet and product checklist! 🧴",
      reply2: "It seems you haven't followed us yet! 😢\n\nTap the Follow button above so I can send you the routine sheet!",
      reply3: "Thank you for the support! Here is the complete routine sheet link:",
      rewardLabel: "Get Skincare Routine 🧴",
      rewardLink: "beautycare.com/glass-skin",
      bgImage: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=75&auto=format&fit=crop",
      stats: { conversion: "23.6%", replies: "21,300", followers: "+6,500" }
    }
  ];

  const [activeInd, setActiveInd] = useState<number>(0);
  const [state, setState] = useState({
    liked: false,
    commentsOpen: false,
    typedText: "",
    commentPosted: false,
    notifVisible: false,
    screen: "reels" as "reels" | "dm",
    dmPhase: 0,
    followed: false,
    cursor: { x: 150, y: 560, visible: false, tapping: false },
    activeStep: 0,
  });

  const set = (partial: Partial<typeof state>) => setState(prev => ({ ...prev, ...partial }));
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const current = industries[activeInd];

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const runSimulation = () => {
    clearAllTimers();

    // Reset state
    set({
      liked: false,
      commentsOpen: false,
      typedText: "",
      commentPosted: false,
      notifVisible: false,
      screen: "reels",
      dmPhase: 0,
      followed: false,
      cursor: { x: 150, y: 560, visible: false, tapping: false },
      activeStep: 0,
    });

    // 1. Move to comment button
    addTimer(() => set({ cursor: { x: 250, y: 440, visible: true, tapping: false } }), 2000);
    
    // 2. Tap comment button
    addTimer(() => set({ cursor: { x: 250, y: 440, visible: true, tapping: true } }), 2500);
    
    // 3. Open comment drawer, hide cursor
    addTimer(() => set({ commentsOpen: true, cursor: { x: 250, y: 440, visible: false, tapping: false } }), 2700);

    // 4. Type keyword
    addTimer(() => {
      const keyword = current.keyword;
      keyword.split("").forEach((_, i) => {
        addTimer(() => set({ typedText: keyword.slice(0, i + 1) }), 120 * i);
      });
    }, 3400);

    // 5. Move to Post comment button
    addTimer(() => set({ cursor: { x: 250, y: 585, visible: true, tapping: false } }), 5000);
    
    // 6. Tap Post button
    addTimer(() => set({ cursor: { x: 250, y: 585, visible: true, tapping: true } }), 5300);
    
    // 7. Comment posted, hide cursor
    addTimer(() => set({ commentPosted: true, activeStep: 1, cursor: { x: 250, y: 585, visible: false, tapping: false } }), 5500);

    // 8. Show DM push notification banner
    addTimer(() => set({ notifVisible: true }), 6500);
    
    // 9. Move cursor to push notification
    addTimer(() => set({ cursor: { x: 150, y: 100, visible: true, tapping: false } }), 7200);
    
    // 10. Tap push notification
    addTimer(() => set({ cursor: { x: 150, y: 100, visible: true, tapping: true } }), 7600);
    
    // 11. Switch to DMs screen, hide notification & cursor
    addTimer(() => set({ screen: "dm", notifVisible: false, cursor: { x: 150, y: 100, visible: false, tapping: false } }), 7800);

    // 12. DM Phase 1: Brand starts typing
    addTimer(() => set({ dmPhase: 1, activeStep: 2 }), 8600);
    
    // 13. DM Phase 2: Brand sends Message 1 (Intro + Follow Gate Check card)
    addTimer(() => set({ dmPhase: 2 }), 9800);
    
    // 14. DM Phase 3: Brand sends Message 2 (Reminder to follow)
    addTimer(() => set({ dmPhase: 3 }), 12800);

    // 15. Move cursor to follow button at the header
    addTimer(() => set({ cursor: { x: 230, y: 75, visible: true, tapping: false } }), 14400);
    
    // 16. Tap follow button
    addTimer(() => set({ cursor: { x: 230, y: 75, visible: true, tapping: true } }), 14900);
    
    // 17. Followed successfully, update follow status, trigger verification
    addTimer(() => set({ dmPhase: 4, followed: true, activeStep: 3, cursor: { x: 230, y: 75, visible: false, tapping: false } }), 15100);

    // 18. DM Phase 5: Brand starts typing reward delivery message
    addTimer(() => set({ dmPhase: 5 }), 15800);
    
    // 19. DM Phase 6: Brand sends Message 3 (Final coordinate delivery)
    addTimer(() => set({ dmPhase: 6 }), 16800);

    // 20. Move cursor to reward link button
    addTimer(() => set({ cursor: { x: 150, y: 460, visible: true, tapping: false } }), 18400);

    // 21. Tap reward button
    addTimer(() => set({ cursor: { x: 150, y: 460, visible: true, tapping: true } }), 18900);

    // 22. Open Success Overlay
    addTimer(() => set({ dmPhase: 7, activeStep: 4, cursor: { x: 150, y: 460, visible: false, tapping: false } }), 19100);

    // 23. Complete cycle and switch to next industry
    addTimer(() => {
      setActiveInd((prev) => (prev + 1) % industries.length);
    }, 24000);
  };

  useEffect(() => {
    runSimulation();
    return () => clearAllTimers();
  }, [activeInd]);

  const handleIndustryChange = (index: number) => {
    setActiveInd(index);
  };

  const handleManualFollow = () => {
    if (state.dmPhase >= 2 && !state.followed) {
      set({
        dmPhase: 4,
        followed: true,
        activeStep: 3,
        cursor: { x: 230, y: 75, visible: false, tapping: false }
      });
      
      clearAllTimers();
      addTimer(() => set({ dmPhase: 5 }), 800);
      addTimer(() => set({ dmPhase: 6 }), 1800);
      addTimer(() => set({ cursor: { x: 150, y: 460, visible: true, tapping: false } }), 3200);
      addTimer(() => set({ cursor: { x: 150, y: 460, visible: true, tapping: true } }), 3700);
      addTimer(() => set({ dmPhase: 7, activeStep: 4, cursor: { x: 150, y: 460, visible: false, tapping: false } }), 3900);
      addTimer(() => {
        setActiveInd((prev) => (prev + 1) % industries.length);
      }, 8000);
    }
  };

  return (
    <div className="w-full max-w-[340px] md:max-w-[360px] mx-auto flex flex-col items-center relative z-10 select-none" style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
      
      {/* ── TOP HORIZONTAL INDUSTRY SWITCHER ───────────────── */}
      <div className="w-full mb-6 relative z-30">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[12px] font-black tracking-widest text-[#FF2D78]/90 uppercase">
            ⚡ Select Niche
          </span>
          <span className="text-[11px] text-pink-400 font-extrabold animate-pulse">👉 Click to test</span>
        </div>
        
        {/* Switcher bar: Horizontal scroll wrapper with fading mask */}
        <div className="w-full p-1 bg-white/5 rounded-2xl border border-white/10 flex overflow-x-auto no-scrollbar gap-1 relative z-10">
          {industries.map((ind, idx) => (
            <button
              key={ind.id}
              onClick={() => handleIndustryChange(idx)}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-300 relative flex-shrink-0 cursor-pointer ${
                activeInd === idx 
                  ? "text-white shadow-[0_0_15px_rgba(255,45,120,0.2)]" 
                  : "text-white/60 hover:text-white"
              }`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {activeInd === idx && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF2D78]/25 to-[#9b3df3]/25 border border-[#FF2D78]/60"
                  style={{ zIndex: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 text-xs">{ind.icon}</span>
              <span className="relative z-10 text-[9px] font-black tracking-wider">{ind.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SMARTPHONE SIMULATOR ───────────────────────────── */}
      <div className="relative w-[320px] aspect-[9/19.5] rounded-[3.2rem] border-[3px] border-[#3f3b39] bg-black shadow-2xl overflow-hidden flex-shrink-0">
        
        {/* Camera notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[100px] h-[26px] bg-black rounded-full flex items-center px-3" style={{ border: '1px solid #1a1a1a' }}>
          <div className="w-2 h-2 rounded-full bg-[#111] absolute right-3 border border-[#222]" />
        </div>

        {/* Screen container */}
        <div className="absolute inset-[4px] rounded-[2.9rem] overflow-hidden bg-black z-0">
          
          {/* --- REELS VIEW --- */}
          {state.screen === "reels" && (
            <div className="absolute inset-0 w-full h-full bg-black z-10 overflow-hidden select-none">
              
              {/* Reels Background Image */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <motion.img
                  key={current.bgImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={current.bgImage}
                  alt="Reels Background"
                  className="absolute inset-0 w-full h-full object-cover scale-[1.03]"
                />
                {/* Deeper gradient for high-contrast text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-[50%] to-black/95" />
              </div>

              {/* Reels Header */}
              <div className="absolute top-12 left-4 right-4 flex justify-between text-white z-20">
                <span className="text-[15px] font-bold font-sans">Reels</span>
                <Search className="w-4 h-4 drop-shadow-md" />
              </div>

              {/* Promised Keyword Alert Overlay */}
              <div className="absolute top-[20%] w-full flex justify-center z-20 pointer-events-none px-4">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shadow-lg">
                  <p className="text-white text-[10px] font-semibold leading-tight">
                    📍 Want the promised content?<br />
                    <span className="text-[9px] opacity-90 block mt-1">Comment <span className="text-[#FF2D78] font-black tracking-wider text-xs mx-1">{current.keyword}</span> 👇</span>
                  </p>
                </div>
              </div>

              {/* Reels Right Engagement Icons */}
              <div className="absolute right-2.5 bottom-[95px] z-20 flex flex-col gap-5 items-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Heart className="w-[24px] h-[24px] text-white drop-shadow-md fill-white/10" strokeWidth={2.5} />
                  <span className="text-[9px] font-bold text-white drop-shadow-md">45.2K</span>
                </div>
                
                {/* TAPPING TARGET: Comment bubble (pulsing rings) */}
                <div className="flex flex-col items-center gap-0.5 relative">
                  {state.commentsOpen === false && (
                    <span className="absolute inset-0 w-full h-full rounded-full border border-pink-500 animate-ping opacity-60 pointer-events-none" />
                  )}
                  <MessageCircle className="w-[22px] h-[22px] text-white drop-shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all" strokeWidth={2.5} fill={state.commentPosted ? "white" : "transparent"} />
                  <span className="text-[9px] font-bold text-white drop-shadow-md">{state.commentPosted ? "8,401" : "8,400"}</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <Send className="w-[22px] h-[22px] text-white drop-shadow-md" strokeWidth={2.5} />
                  <span className="text-[9px] font-bold text-white drop-shadow-md">4,200</span>
                </div>
                <Bookmark className="w-[22px] h-[22px] text-white mb-1.5 drop-shadow-md" strokeWidth={2.5} />
                <div className="w-7 h-7 rounded-lg overflow-hidden border-2 border-white bg-zinc-800 shadow-md">
                  <div className="w-full h-full opacity-60" style={{ background: current.avatarBg }} />
                </div>
              </div>

              {/* Reels Bottom Caption Block */}
              <div className="absolute bottom-[80px] left-3 right-12 z-20">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-black border border-white/20 flex items-center justify-center text-[8px] text-white font-bold">
                      {current.username.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-white font-bold text-[14px] drop-shadow-md leading-none">{current.username}</span>
                </div>
                <p className="text-white text-[13px] leading-snug drop-shadow-md font-semibold">{current.caption}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Music2 className="w-2.5 h-2.5 text-white drop-shadow-md animate-pulse" />
                  <span className="text-[10px] text-white drop-shadow-md font-bold truncate max-w-[120px]">Original Audio - {current.username}</span>
                </div>
              </div>

              {/* Simulated IG Bottom Navigation */}
              <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-black/85 backdrop-blur-md z-20 flex justify-around items-center pb-2 border-t border-white/5">
                <Home className="w-5 h-5 text-white/60" />
                <Search className="w-5 h-5 text-white/60" />
                <PlusSquare className="w-5 h-5 text-white/60" />
                <div className="w-5 h-5 bg-white/50 rounded-full border border-white/25" />
                <User className="w-5 h-5 text-white/60" />
              </div>

              {/* COMMENTS SLIDE-UP DRAWER */}
              <AnimatePresence>
                {state.commentsOpen && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="absolute bottom-0 left-0 right-0 h-[65%] bg-[#1c1c1e] rounded-t-2xl z-30 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                  >
                    <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mt-2" />
                    <div className="text-center text-white font-bold text-[11px] py-2.5 border-b border-white/5">Comments</div>

                    <div className="flex-1 overflow-auto p-3 space-y-4 no-scrollbar">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/85 flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">ID</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-[11px] font-bold leading-tight">
                            <span className="font-bold text-white mr-1">island_dreamer</span>Is this actually real? 🤯
                          </div>
                          <div className="flex text-white/40 text-[8px] font-semibold mt-0.5 gap-2"><span>2h</span><span>Reply</span></div>
                        </div>
                      </div>

                      {/* Render posted comment */}
                      <AnimatePresence>
                        {state.commentPosted && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="flex gap-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#FF2D78] flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">U</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-[11px] font-bold leading-tight">
                                <span className="font-black text-pink-400 mr-1">you</span>
                                {state.typedText}
                              </div>
                              <div className="flex text-white/40 text-[8px] font-semibold mt-0.5 gap-2"><span>Just now</span><span>Reply</span></div>
                            </div>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="flex-shrink-0">
                              <CheckCircle className="w-[12px] h-[12px] text-[#FF2D78] mt-0.5" />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Input bar */}
                    <div className="p-2.5 pt-1.5 pb-5 border-t border-white/5 flex items-center gap-2.5 bg-[#1c1c1e] relative">
                      <div className="w-6 h-6 rounded-full bg-[#FF2D78] flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">U</div>
                      <div className="flex-1 border border-white/10 rounded-full px-3 py-1 flex items-center bg-white/5 h-8">
                        <span className={state.typedText ? "text-white text-[13px] font-semibold" : "text-white/40 text-[13px]"}>
                          {state.typedText || "Add comment..."}
                        </span>
                        {state.typedText && !state.commentPosted && (
                          <span className="w-[1.5px] h-3 bg-[#FF2D78] ml-0.5 animate-pulse" />
                        )}
                      </div>
                      
                      {/* TAPPING TARGET: Post comment button */}
                      {state.typedText && !state.commentPosted && (
                        <div className="relative">
                          <span className="absolute inset-0 w-full h-full rounded-md border border-pink-500 animate-ping opacity-60 pointer-events-none" />
                          <button className="text-[10.5px] font-bold text-[#FF2D78] hover:opacity-80 active:scale-95 cursor-pointer relative z-10 px-1 py-0.5">Post</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Push Notification Banner */}
              <AnimatePresence>
                {state.notifVisible && (
                  <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="absolute top-10 left-2.5 right-2.5 z-50 bg-[#1e1e1e]/98 backdrop-blur-xl rounded-2xl p-2.5 flex gap-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 items-center select-none cursor-pointer hover:bg-neutral-800/90 active:scale-98 transition-all"
                  >
                    <span className="absolute inset-0 rounded-2xl border border-pink-500/55 animate-pulse pointer-events-none" />
                    
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center flex-shrink-0 p-[1.5px]">
                      <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                        <Instagram className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center translate-y-[-1px] min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none">Instagram</span>
                        <span className="text-[8px] text-white/30">now</span>
                      </div>
                      <p className="text-[13px] font-bold text-white leading-tight mt-0.5 truncate">{current.username}</p>
                      <p className="text-[12px] text-white/80 leading-tight truncate">Sent you a message request.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* --- DM VIEW --- */}
          {state.screen === "dm" && (
            <div className="absolute inset-0 bg-[#000] flex flex-col z-10 w-full h-full select-none">
              
              {/* Header */}
              <div className="pt-12 pb-2.5 px-2.5 flex items-center bg-[#111] border-b border-white/5 z-20 flex-shrink-0 shadow-sm relative text-white">
                <ChevronLeft className="w-5 h-5 text-white -ml-0.5 cursor-pointer" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] mx-1.5 flex items-center justify-center text-[9px] font-bold flex-shrink-0 p-0.5">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                    {current.username.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold leading-tight truncate">{current.username}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <div className="text-white/50 text-[8px] font-semibold leading-none">Active now</div>
                  </div>
                </div>

                <motion.button
                  onClick={handleManualFollow}
                  animate={{
                    background: state.followed ? "rgba(255,255,255,0.08)" : "#FF2D78",
                    color: state.followed ? "#999" : "#fff",
                    border: state.followed ? "1px solid rgba(255,255,255,0.1)" : "1px solid #FF2D78"
                  }}
                  className="px-2.5 py-0.5 h-6 rounded-md text-[9px] font-bold mr-1 shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  {state.followed ? "Following" : "Follow"}
                </motion.button>
              </div>

              {/* DM Message Thread Area */}
              <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 flex flex-col justify-end space-y-2.5 pb-3 z-10 scroll-smooth no-scrollbar">
                <div className="text-center text-white/30 text-[8px] font-bold uppercase mb-1 tracking-wider">Today 2:14 PM</div>

                <AnimatePresence mode="popLayout">
                  
                  {/* Brand Trigger keyword message */}
                  <div className="flex justify-end w-full">
                    <div className="bg-[#FF2D78] text-white text-[12px] px-3.5 py-2 rounded-2xl rounded-tr-none max-w-[70%] font-extrabold shadow-md">
                      {current.keyword}
                    </div>
                  </div>

                  {/* Brand typing indicator */}
                  {(state.dmPhase === 1 || state.dmPhase === 5) && (
                    <motion.div
                      key="typing-indicator"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-1.5 w-full mt-0.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] mt-auto flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0">
                        {current.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="bg-[#262626] px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1 h-7">
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-[3.5px] h-[3.5px] bg-white/50 rounded-full" />
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-[3.5px] h-[3.5px] bg-white/50 rounded-full" />
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-[3.5px] h-[3.5px] bg-white/50 rounded-full" />
                      </div>
                    </motion.div>
                  )}

                  {/* Brand Message 1: Intro Message (High contrast white text) */}
                  {state.dmPhase >= 2 && (
                    <motion.div key="intro-msg" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1.5 w-full">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] mt-auto flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0">
                        {current.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="w-[85%]">
                        <div className="bg-[#262626] text-white text-[15px] font-bold p-3 rounded-2xl rounded-bl-sm leading-snug">
                          {current.reply1}
                        </div>

                        {/* Gated follow-check card (High contrast white text) */}
                        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#151515] text-white p-3 rounded-2xl rounded-bl-sm mt-1 border border-[#333] shadow-md relative">
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <div className="w-5 h-5 rounded-full bg-black border border-white/20 flex items-center justify-center text-[7px] font-bold">
                              {current.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-white leading-tight truncate">{current.username}</div>
                              <div className="text-[8px] text-white/50 mt-0.5 leading-none">38.2K Followers</div>
                            </div>
                          </div>
                          <p className="text-[11px] text-white font-semibold mb-3 leading-snug">{current.followGateText}</p>
                          
                          {/* TAPPING TARGET: Follow Button inside check card */}
                          <div className="relative">
                            {!state.followed && (
                              <span className="absolute inset-0 w-full h-full rounded-lg border border-pink-500 animate-ping opacity-60 pointer-events-none" />
                            )}
                            <motion.button
                              onClick={handleManualFollow}
                              animate={{
                                background: state.followed ? "rgba(255,255,255,0.08)" : "#FF2D78",
                                color: state.followed ? "#999" : "#fff",
                                border: state.followed ? "1px solid rgba(255,255,255,0.1)" : "1px solid #FF2D78"
                              }}
                              className="w-full py-2 rounded-lg text-[13px] font-black transition-all text-center shadow-md flex items-center justify-center cursor-pointer relative z-10"
                            >
                              {state.followed ? "Following ✓" : "Follow to Unlock Link"}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Brand Message 2: Reminder */}
                  {state.dmPhase === 3 && !state.followed && (
                    <motion.div key="reminder-msg" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1.5 w-full mt-1.5">
                      <div className="w-5 h-5 rounded-full bg-transparent mt-auto flex-shrink-0" />
                      <div className="bg-[#262626] text-white text-[15px] font-bold p-3 rounded-2xl rounded-bl-sm max-w-[85%] leading-snug">
                        {current.reply2}
                      </div>
                    </motion.div>
                  )}

                  {/* Brand Follower Verified Badge */}
                  {state.followed && state.dmPhase >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-1.5 py-0.5 text-[8.5px] text-green-400 bg-green-500/10 rounded-full border border-green-500/25 max-w-[180px] mx-auto font-black"
                    >
                      <Unlock className="w-2.5 h-2.5 text-green-400" /> Follower verified! Unlocking...
                    </motion.div>
                  )}

                  {/* Brand Message 3: Final delivery (High contrast white text) */}
                  {state.dmPhase >= 6 && (
                    <motion.div key="unlocked-msg" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-1.5 w-full mt-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] mt-auto flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0">
                        {current.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="bg-gradient-to-br from-[#1b2a22] to-[#0d1611] border border-green-500/30 text-white p-3.5 rounded-2xl rounded-bl-sm max-w-[85%] shadow-md">
                        <div className="flex items-center gap-1 mb-1.5 text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-black uppercase tracking-wider">Follow Verified</span>
                        </div>
                        <div className="text-[15px] leading-snug text-white font-bold">
                          {current.reply3}
                          
                          {/* TAPPING TARGET: Delivered link card */}
                          <div className="relative mt-2">
                            {state.dmPhase === 6 && (
                              <span className="absolute inset-0 w-full h-full rounded-lg border border-pink-500 animate-ping opacity-60 pointer-events-none" />
                            )}
                            <div className="p-2 bg-[#FF2D78]/10 rounded-lg border border-[#FF2D78]/25 flex items-center justify-between gap-1 shadow-inner cursor-pointer hover:bg-[#FF2D78]/20 transition-all relative z-10">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Navigation className="w-3.5 h-3.5 text-[#FF2D78] flex-shrink-0" />
                                <span className="font-extrabold text-[#FF2D78] break-all text-[10px] truncate">{current.rewardLink}</span>
                              </div>
                              <span className="text-[8px] bg-pink-500/20 text-[#FF2D78] font-bold px-1.5 py-0.5 rounded flex-shrink-0">Click</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Bottom bar */}
              <div className="p-2.5 pb-6 bg-[#111] border-t border-white/5 flex items-center gap-2 flex-shrink-0 z-20 relative">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center p-1.5 flex-shrink-0">
                  <Instagram className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 bg-[#262626] rounded-full px-3 py-1 flex items-center h-8">
                  <span className="text-white/40 text-[11px]">Message...</span>
                </div>
                <Smile className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          {/* SIMULATED TOUCH CURSOR */}
          <AnimatePresence>
            {state.cursor.visible && (
              <motion.div
                key="simulated-cursor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: state.cursor.x, y: state.cursor.y }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="absolute z-50 pointer-events-none w-8 h-8 -ml-4 -mt-4"
              >
                <div className="w-full h-full rounded-full border-2 border-white/70 bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                </div>
                
                <AnimatePresence>
                  {state.cursor.tapping && (
                    <motion.div
                      key="touch-ripple"
                      className="absolute inset-0 rounded-full border-[2px] border-white/80 bg-white/20"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Hardware side buttons */}
        <div className="absolute top-24 -left-[2px] w-[2px] h-6 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute top-34 -left-[2px] w-[2px] h-10 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute top-46 -left-[2px] w-[2px] h-10 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute top-30 -right-[2px] w-[2px] h-16 bg-[#2a2a2a] rounded-r-sm" />
      </div>

      {/* Success conversion banner overlay */}
      <AnimatePresence>
        {state.dmPhase === 7 && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-2xl flex items-center gap-3 z-40 shadow-xl backdrop-blur-xl"
          >
            <div className="w-7 h-7 rounded-full bg-green-500/30 flex items-center justify-center text-green-400 flex-shrink-0">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
            <div className="text-left min-w-0">
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider leading-none">Automation Successful!</h4>
              <p className="text-[9.5px] text-green-300/80 mt-1 leading-none">
                Verified Follow ➔ DM Delivered ➔ Lead Saved in CRM 🚀
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
