"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Sparkles, Bot, ArrowRight, Lock, MessageCircle, Send, Smile, Instagram,
  ChevronLeft, Phone, Video, CheckCircle, Search, Home, PlusSquare, User, Bookmark, Heart, Music2, Navigation
} from "lucide-react";

export default function DMAutomationShowcase() {
  const [phase, setPhase] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [commentPosted, setCommentPosted] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [screen, setScreen] = useState<"reels" | "dm">("reels");

  // dmPhase maps heavily to the chatting timeline:
  // 1=Typing, 2=Msg1, 3=Typing, 4=Reminder, 5=TriggerFollow, 6=Typing, 7=GiveLocation
  const [dmPhase, setDmPhase] = useState(0);
  const [followed, setFollowed] = useState(false);

  const [cursor, setCursor] = useState({ x: 150, y: 500, visible: false, tapping: false });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    const run = () => {
      // RESET ALL STATE
      setPhase(0); setLiked(false); setCommentsOpen(false);
      setTypedText(""); setCommentPosted(false); setNotifVisible(false);
      setScreen("reels"); setDmPhase(0); setFollowed(false);
      setCursor({ x: 150, y: 560, visible: false, tapping: false });
      setActiveStep(0);

      // STEP 1: Reel plays (wait 3 seconds)
      t(() => { setCursor({ x: 282, y: 440, visible: true, tapping: false }); }, 3000);
      t(() => setCursor(p => ({ ...p, tapping: true })), 3500);
      t(() => { setCommentsOpen(true); setCursor(p => ({ ...p, visible: false, tapping: false })); }, 3700);

      // STEP 2: Type "LOCATION"
      t(() => {
        const word = "LOCATION";
        word.split("").forEach((_, i) => {
          t(() => setTypedText(word.slice(0, i + 1)), 150 * i);
        });
      }, 4500);

      t(() => { setCursor({ x: 288, y: 585, visible: true, tapping: false }); }, 6000);
      t(() => { setCursor(p => ({ ...p, tapping: true })); }, 6300);
      t(() => { setCommentPosted(true); setActiveStep(1); setCursor(p => ({ ...p, visible: false, tapping: false })); }, 6500);

      // STEP 3: Push Notification drops in
      t(() => { setNotifVisible(true); }, 7500);
      t(() => { setCursor({ x: 150, y: 100, visible: true, tapping: false }); }, 8200);
      t(() => setCursor(p => ({ ...p, tapping: true })), 8600);

      // Screen switches to DM 
      t(() => { setScreen("dm"); setNotifVisible(false); setCursor(p => ({ ...p, visible: false, tapping: false })); }, 8800);

      // STEP 4: Inside DM, Show Typing Indicator
      t(() => { setDmPhase(1); setActiveStep(2); }, 9800);

      // Bot sends FIRST message (Follow prompt)
      t(() => { setDmPhase(2); }, 11200);

      // Wait 3.5 seconds (User hesitates), Bot starts typing again...
      t(() => { setDmPhase(3); }, 14700);

      // Bot drops Reminder Message
      t(() => { setDmPhase(4); }, 15800);

      // User complies: Cursor moves to click Follow Button
      t(() => { setCursor({ x: 170, y: 350, visible: true, tapping: false }); }, 16800);
      t(() => setCursor(p => ({ ...p, tapping: true })), 17300);

      // Button clicked -> Transition to Followed state
      t(() => { setDmPhase(5); setFollowed(true); setActiveStep(3); setCursor(p => ({ ...p, visible: false, tapping: false })); }, 17500);

      // Bot sees follow -> typing indicator
      t(() => { setDmPhase(6); }, 18000);

      // Deliver secret location!
      t(() => { setDmPhase(7); }, 19000);

      // Restart Loop after viewing final state
      t(run, 25000);
    };

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[#050009]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full bg-[#FF2D78]/10 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-700/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF2D78]/10 border border-[#FF2D78]/20 text-[#FF2D78] text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
            <Sparkles className="w-3 h-3 fill-current" /> Auto-DM Simulator
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-5">
            See the Magic <span className="bg-gradient-to-r from-[#FF2D78] to-[#9b3df3] bg-clip-text text-transparent">In Action.</span>
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 justify-center items-center">

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative flex-shrink-0">
            <div className="absolute -inset-10 rounded-full bg-[#FF2D78]/10 blur-[80px]" />

            {/* iPhone Hardware Container */}
            <div className="relative w-[320px] aspect-[9/19.5] rounded-[3.5rem] border-[3px] border-[#3f3b39] bg-black shadow-2xl z-10 mx-auto overflow-hidden">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[110px] h-[30px] bg-black rounded-full flex items-center px-3" style={{ border: '1px solid #1a1a1a' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] absolute right-3 border border-[#222]" />
              </div>

              {/* Base Screen Div */}
              <div className="absolute inset-[4px] rounded-[3.2rem] overflow-hidden bg-black z-0">

                {/* --- REELS SCREEN --- */}
                {screen === "reels" && (
                  <div className="absolute inset-0 w-full h-full bg-black z-10 overflow-hidden">
                    <img src="/images/reels-bg.png" alt="Reels Background" className="absolute inset-0 w-full h-full object-cover scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-[40%] to-black/80" />

                    <div className="absolute top-14 left-5 right-5 flex justify-between text-white z-20">
                      <span className="text-xl font-bold font-sans">Reels</span>
                      <Search className="w-6 h-6 drop-shadow-md" />
                    </div>

                    <div className="absolute top-[20%] w-full flex justify-center z-20 pointer-events-none px-4">
                      <div className="bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center shadow-lg">
                        <p className="text-white text-sm font-semibold leading-tight">
                          📍 Want the Secret Location?<br />
                          <span className="text-[12px] opacity-90 block mt-1">Comment <span className="text-[#FF2D78] font-black tracking-wider text-sm mx-1">LOCATION</span> 👇</span>
                        </p>
                      </div>
                    </div>

                    <div className="absolute right-3 bottom-[110px] z-20 flex flex-col gap-6 items-center">
                      <div className="flex flex-col items-center gap-1"><Heart className="w-[28px] h-[28px] text-white drop-shadow-md" strokeWidth={2.5} /><span className="text-[10px] font-bold text-white drop-shadow-md">45.2K</span></div>
                      <div className="flex flex-col items-center gap-1"><MessageCircle className="w-[26px] h-[26px] text-white drop-shadow-md" strokeWidth={2.5} fill={commentPosted ? "white" : "transparent"} /><span className="text-[10px] font-bold text-white drop-shadow-md">{commentPosted ? "8,401" : "8,400"}</span></div>
                      <div className="flex flex-col items-center gap-1"><Send className="w-[26px] h-[26px] text-white drop-shadow-md" strokeWidth={2.5} /><span className="text-[10px] font-bold text-white drop-shadow-md">4,200</span></div>
                      <Bookmark className="w-[26px] h-[26px] text-white mb-2 drop-shadow-md" strokeWidth={2.5} />
                      <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white bg-zinc-800 shadow-md">
                        <img src="/images/reels-bg.png" className="w-full h-full object-cover opacity-60" alt="Audio Thumbnail" />
                      </div>
                    </div>

                    <div className="absolute bottom-[90px] left-4 right-16 z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] p-[2px]">
                          <div className="w-full h-full rounded-full bg-black border border-white/20 flex items-center justify-center text-[10px] text-white font-bold">TE</div>
                        </div>
                        <span className="text-white font-bold text-sm drop-shadow-md">travel_explorer</span>
                        <span className="px-2.5 py-0.5 rounded-full border border-white/40 text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm">Follow</span>
                      </div>
                      <p className="text-white text-[12px] leading-snug drop-shadow-md font-medium">Found the absolute most stunning hidden cove in Santorini. Details in DM! 🏝️</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Music2 className="w-3 h-3 text-white drop-shadow-md animate-pulse" />
                        <span className="text-[10px] text-white/90 drop-shadow-md font-semibold">Original Audio - travel_explorer</span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-black/80 backdrop-blur-md z-20 flex justify-around items-center pb-2">
                      <Home className="w-6 h-6 text-white/60" />
                      <Search className="w-6 h-6 text-white/60" />
                      <PlusSquare className="w-6 h-6 text-white/60" />
                      <div className="w-6 h-6 bg-white/70 rounded-full" />
                      <User className="w-6 h-6 text-white/60" />
                    </div>

                    <AnimatePresence>
                      {commentsOpen && (
                        <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="absolute bottom-0 left-0 right-0 h-[65%] bg-[#1c1c1e] rounded-t-3xl z-30 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                          <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto mt-3" />
                          <div className="text-center text-white font-bold text-[13px] py-3.5 border-b border-white/5">Comments</div>

                          <div className="flex-1 overflow-auto p-4 space-y-6">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/80 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">ID</div>
                              <div className="flex-1">
                                <div className="text-white text-[12px] leading-tight"><span className="font-bold text-white mr-1.5">island_dreamer</span>Is this actually real? 🤯</div>
                                <div className="flex text-white/40 text-[10px] font-semibold mt-1.5 gap-3"><span>2h</span><span>Reply</span></div>
                              </div>
                              <Heart className="w-[14px] h-[14px] text-white/40 mt-1" />
                            </div>

                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/80 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">JS</div>
                              <div className="flex-1">
                                <div className="text-white text-[12px] leading-tight"><span className="font-bold text-white mr-1.5">john_smith_tt</span>Adding to bucket list!! 🔥</div>
                                <div className="flex text-white/40 text-[10px] font-semibold mt-1.5 gap-3"><span>4h</span><span>Reply</span></div>
                              </div>
                              <Heart className="w-[14px] h-[14px] text-white/40 mt-1" />
                            </div>

                            <AnimatePresence>
                              {commentPosted && (
                                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#FF2D78] flex items-center justify-center text-xs text-white font-bold flex-shrink-0">U</div>
                                  <div className="flex-1">
                                    <div className="text-white text-[12px] leading-tight"><span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#9b3df3] mr-1.5">you</span>LOCATION</div>
                                    <div className="flex text-white/40 text-[10px] font-semibold mt-1.5 gap-3"><span>Just now</span><span>Reply</span></div>
                                  </div>
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}><CheckCircle className="w-[14px] h-[14px] text-[#FF2D78] mt-1" /></motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="p-4 pt-3 border-t border-white/5 flex items-center gap-3 bg-[#1c1c1e]">
                            <div className="w-8 h-8 rounded-full bg-[#FF2D78] flex items-center justify-center text-xs text-white font-bold flex-shrink-0">U</div>
                            <div className="flex-1 border border-white/10 rounded-full px-4 py-2 flex items-center bg-white/5 h-10">
                              <span className={typedText ? "text-white text-[13px]" : "text-white/40 text-[13px]"}>{typedText || "Add a comment..."}</span>
                              {typedText && !commentPosted && <span className="w-[2px] h-4 bg-[#FF2D78] ml-0.5 animate-pulse" />}
                            </div>
                            <button className={`text-[13px] font-bold ${typedText ? "text-[#FF2D78]" : "text-white/30"}`}>Post</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {notifVisible && (
                        <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} transition={{ type: "spring", damping: 20 }} className="absolute top-12 left-3 right-3 z-50 bg-[#1e1e1e]/98 backdrop-blur-xl rounded-2xl p-3 flex gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center flex-shrink-0 p-[1.5px]">
                            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                              <Instagram className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-center translate-y-[-1px]">
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">Instagram</span><span className="text-[10px] text-white/30">now</span></div>
                            <p className="text-[13px] font-bold text-white leading-tight mt-1">travel_explorer</p>
                            <p className="text-[12px] text-white/80 leading-tight">Sent you a message request.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* --- DM SCREEN --- */}
                {screen === "dm" && (
                  <div className="absolute inset-0 bg-[#000] flex flex-col z-10 w-full h-full">
                    {/* Header */}
                    <div className="pt-14 pb-3 px-3 flex items-center bg-[#111] border-b border-white/5 z-20 flex-shrink-0 shadow-sm relative text-white">
                      <ChevronLeft className="w-7 h-7 text-white -ml-1" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] mx-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 p-0.5">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">TE</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold leading-tight">travel_explorer</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <div className="text-white/50 text-[10px] font-semibold leading-none">Active now</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Phone className="w-5 h-5 text-white/80" />
                        <Video className="w-5 h-5 text-white/80" />
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 flex flex-col justify-end space-y-3 pb-2 z-10 scroll-smooth">
                      <div className="text-center text-white/40 text-[10px] font-bold uppercase mb-4 tracking-wider">Today 2:14 PM</div>

                      <AnimatePresence mode="popLayout">
                        {/* TYPING INDICATOR 1 */}
                        {(dmPhase === 1 || dmPhase === 3 || dmPhase === 6) && (
                          <motion.div key="typing" initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }} className="flex gap-2 w-full mt-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] mt-auto flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">TE</div>
                            <div className="bg-[#262626] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-[5px] h-[5px] bg-white/50 rounded-full" />
                              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-[5px] h-[5px] bg-white/50 rounded-full" />
                              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-[5px] h-[5px] bg-white/50 rounded-full" />
                            </div>
                          </motion.div>
                        )}

                        {/* MESSAGE 1: Intro + Follow Gated Card */}
                        {dmPhase >= 2 && (
                          <motion.div key="msg1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 22 }} className="flex gap-2 w-full">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] mt-auto flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">TE</div>
                            <div className="w-[85%]">
                              <div className="bg-[#262626] text-white text-[13px] p-3 rounded-2xl rounded-bl-sm leading-snug">
                                Hey! 👋 I saw you commented 'LOCATION' on my latest reel.
                              </div>

                              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#151515] text-white p-3.5 rounded-2xl rounded-bl-sm mt-1.5 border border-[#333]">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-7 h-7 rounded-full bg-black border border-white/20 flex items-center justify-center text-[10px] font-bold">TE</div>
                                  <div>
                                    <div className="text-[12px] font-bold text-white leading-tight">travel_explorer</div>
                                    <div className="text-[10px] text-white/50 mt-0.5">38.2K Followers</div>
                                  </div>
                                </div>
                                <p className="text-[12.5px] text-white/80 mb-3.5 leading-snug">Tap the button below and follow us to instantly receive the secret map! 🗺️</p>
                                <motion.button
                                  animate={{
                                    background: followed ? "#252525" : "#FF2D78",
                                    color: followed ? "#888" : "#fff",
                                    border: followed ? "1px solid #333" : "1px solid #FF2D78"
                                  }}
                                  className="w-full py-2.5 rounded-xl text-[13px] font-bold transition-all text-center shadow-lg"
                                >
                                  {followed ? "Following ✓" : "Follow"}
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* MESSAGE 2: Reminder */}
                        {dmPhase >= 4 && (
                          <motion.div key="msg2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 w-full mt-3">
                            <div className="w-6 h-6 rounded-full bg-transparent mt-auto flex-shrink-0" />
                            <div className="bg-[#262626] text-white text-[13px] p-3 rounded-2xl rounded-bl-sm max-w-[85%] leading-snug">
                              It seems you haven't followed us yet! 😢<br /><br />Tap the <span className="font-bold text-[#FF2D78]">Follow</span> button above so I can send you the location!
                            </div>
                          </motion.div>
                        )}

                        {/* MESSAGE 3: Final Delivery */}
                        {dmPhase >= 7 && (
                          <motion.div key="msg3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2 w-full mt-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#9b3df3] mt-auto flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">TE</div>
                            <div className="bg-gradient-to-br from-[#1b2a22] to-[#0d1611] border border-green-500/30 text-white p-3.5 rounded-2xl rounded-bl-sm max-w-[85%] shadow-md">
                              <div className="flex items-center gap-1.5 mb-1.5 text-green-400">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Follow Verified</span>
                              </div>
                              <div className="text-[13px] leading-snug text-white/90">Thanks! Here is the exact location coordinate:<br /><div className="mt-2 p-2 bg-[#FF2D78]/10 rounded-lg border border-[#FF2D78]/20 flex items-center gap-2"><Navigation className="w-4 h-4 text-[#FF2D78]" /><span className="font-bold text-[#FF2D78] break-all">g.co/santorini-secret</span></div></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Chat Input Field Bottom Bar */}
                    <div className="p-3 pb-8 bg-[#111] border-t border-white/5 flex items-center gap-3 flex-shrink-0 z-20 relative">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center p-1.5"><Instagram className="w-5 h-5 text-white" /></div>
                      <div className="flex-1 bg-[#262626] rounded-full px-4 py-2 flex items-center h-10">
                        <span className="text-white/40 text-[13px]">Message...</span>
                      </div>
                      <Smile className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}


                {/* SIMULATED TOUCH CURSOR */}
                <AnimatePresence>
                  {cursor.visible && (
                    <motion.div
                      key="cursor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, x: cursor.x, y: cursor.y }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 180, damping: 20 }}
                      className="absolute z-50 pointer-events-none w-10 h-10 -ml-5 -mt-5"
                    >
                      <div className="w-full h-full rounded-full border-2 border-white/70 bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                      </div>
                      <AnimatePresence>
                        {cursor.tapping && (
                          <motion.div
                            key="ripple"
                            className="absolute inset-0 rounded-full border-[3px] border-white/80 bg-white/20"
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

              {/* Hardware buttons on side of iPhone */}
              <div className="absolute top-28 -left-[2px] w-[2px] h-8 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute top-40 -left-[2px] w-[2px] h-14 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute top-56 -left-[2px] w-[2px] h-14 bg-[#2a2a2a] rounded-l-sm" />
              <div className="absolute top-36 -right-[2px] w-[2px] h-20 bg-[#2a2a2a] rounded-r-sm" />
            </div>
          </motion.div>

          <div className="max-w-md w-full z-20">
            <h3 className="text-3xl font-black text-white mb-8 leading-tight">
              Turn every comment into a <br />
              <span className="text-[#FF2D78]">qualified lead.</span>
            </h3>

            <div className="space-y-4">
              {[
                { step: "01", title: "Comment Trigger", description: "User comments your keyword on any Reel or Post and the bot fires instantly.", icon: MessageCircle },
                { step: "02", title: "Instant Auto-DM", description: "AI sends a personalised direct message in under 1 second, every time.", icon: Zap },
                { step: "03", title: "Follow Gating", description: "Require a follow before revealing links, discounts or secret content.", icon: Lock },
                { step: "04", title: "Smart Conversions", description: "Seamless UI keeps users engaged, finishing your conversion funnel.", icon: Bot }
              ].map((f, i) => {
                const isActive = activeStep >= i;
                return (
                  <div key={i} className={`p-4 rounded-2xl flex gap-4 transition-all duration-300 border ${isActive ? 'bg-[#FF2D78]/10 border-[#FF2D78]/20' : 'bg-white/5 border-white/5'}`}>
                    <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center shadow-sm ${isActive ? 'bg-[#FF2D78] text-white shadow-[#FF2D78]/50' : 'bg-white/5 text-white/40'}`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-xs font-black uppercase tracking-wider mb-1 ${isActive ? 'text-[#FF2D78]' : 'text-white/40'}`}>Step {f.step}</div>
                      <h4 className="text-white font-bold text-[15px] mb-1">{f.title}</h4>
                      <p className="text-white/60 text-sm leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-10">
              <a href="/dashboard" className="inline-flex py-3.5 px-8 bg-[#FF2D78] hover:bg-[#e02068] text-white font-bold rounded-xl shadow-xl shadow-[#FF2D78]/20 transition-all items-center gap-2 group w-full justify-center">
                Create Your First Automation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
