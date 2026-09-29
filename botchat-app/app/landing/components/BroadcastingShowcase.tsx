"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, AlertCircle, CheckCircle2, MessageCircle, Activity } from "lucide-react";

export default function BroadcastingShowcase() {
    // Animation State
    const [message, setMessage] = useState("");
    const [btnText, setBtnText] = useState("");
    
    // Steps: 0=typing msg, 1=typing btn, 2=ready to click, 3=sending, 4=sent (phones appear)
    const [step, setStep] = useState(0);

    const targetMessage = "Hey {{first_name}}! 🌟\nWe just dropped our exclusive VIP deals early! Tap below to get your code.";
    const targetBtn = "Claim 50% OFF 🎁";

    // Auto-interaction loop
    useEffect(() => {
        let isCancelled = false;

        const runAnimation = async () => {
            while (!isCancelled) {
                setStep(0);
                setMessage("");
                setBtnText("");

                // Wait before starting
                await new Promise(r => setTimeout(r, 1000));
                if (isCancelled) break;

                // Type message
                for (let i = 0; i <= targetMessage.length; i++) {
                    if (isCancelled) return;
                    setMessage(targetMessage.slice(0, i));
                    await new Promise(r => setTimeout(r, 30));
                }

                await new Promise(r => setTimeout(r, 500));
                if (isCancelled) break;

                // Type button text
                setStep(1);
                for (let i = 0; i <= targetBtn.length; i++) {
                    if (isCancelled) return;
                    setBtnText(targetBtn.slice(0, i));
                    await new Promise(r => setTimeout(r, 50));
                }

                await new Promise(r => setTimeout(r, 800));
                if (isCancelled) break;

                // Ready to click
                setStep(2);
                await new Promise(r => setTimeout(r, 400));
                if (isCancelled) break;

                // Clicked (Sending)
                setStep(3);
                await new Promise(r => setTimeout(r, 1500));
                if (isCancelled) break;

                // Sent (Phones Pop Up)
                setStep(4);
                await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds before restarting loop
            }
        };

        runAnimation();
        return () => { isCancelled = true; };
    }, []);

    return (
        <section className="relative py-24 lg:py-32 overflow-hidden bg-[#06000d]">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#FF2D78]/10 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full translate-x-1/4 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* LEFT: Text Content */}
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#FF2D78] text-xs font-black tracking-widest uppercase mb-8 shadow-sm"
                        >
                            <Send size={14} fill="currentColor" />
                            Interactive Demo
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6"
                        >
                            Try out the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#FF80AB] to-[#E1306C]">
                                Broadcaster.
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-xl"
                        >
                            Watch how a custom broadcast message is created and instantly delivered to Facebook and Instagram users in real-time.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4 mb-10"
                        >
                            {[
                                { title: "Smart Audience Segmentation", desc: "Filter contacts by tags, variables, or recent engagement." },
                                { title: "Rich Media Messages", desc: "Send carousels, buttons, images, and quick replies." },
                                { title: "Live Analytics", desc: "Track delivery, open rates, and direct click-throughs in real-time." }
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1 border border-white/10">
                                        <CheckCircle2 size={16} className="text-[#FF2D78]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                                        <p className="text-sm text-white/50">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Critical Compliance Warning */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 max-w-xl"
                        >
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-amber-500/90 font-bold mb-1">Meta Policy Note</p>
                                <p className="text-xs text-amber-500/70 leading-relaxed">
                                    Broadcasting availability is subject to Meta's 24-hour messaging window and platform rules. You can only broadcast to contacts who have interacted with your page within the last 24 hours.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT: Auto-Interactive Dashboard Mockup (Mobile iPhone Canvas) */}
                    <div className="lg:w-1/2 order-1 lg:order-2 w-full flex justify-center items-center relative perspective-[1000px] mt-10 lg:mt-0 pt-0 sm:pt-4 min-h-[500px]">
                        
                        {/* Glowing backdrop specifically for the mockups */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF2D78]/20 via-purple-500/10 to-blue-500/20 blur-[80px] rounded-full scale-90" />

                        {/* Wrapper for the entire phone assembly to prevent overflow-hidden clipping */}
                        <div className="relative w-[320px] h-[680px] mx-auto scale-[0.85] sm:scale-100">
                            
                            {/* Main iPhone Mockup (MegaDM Mobile App Style) */}
                            <motion.div 
                                className="absolute inset-0 z-10 bg-[#f8f9fa] rounded-[3rem] border-[12px] border-[#18181b] shadow-2xl overflow-hidden shadow-[#FF2D78]/20 flex flex-col"
                                initial={{ opacity: 0, y: 50, rotateX: 5 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                {/* Dynamic Island */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[35%] h-6 bg-black rounded-full z-40" />

                                {/* Mobile App Header */}
                                <div className="pt-12 pb-4 px-6 bg-white border-b border-gray-200 flex items-center justify-between z-30 relative shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FF2D78] to-[#E1306C] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-pink-500/20">M</div>
                                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-1.5 shadow-sm">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        12.4k Active
                                    </div>
                                </div>

                                {/* Main Content area */}
                                <div className="flex-1 p-5 relative overflow-y-auto bg-[#fafafa]">
                                    <div className="mb-6">
                                        <h3 className="text-gray-900 font-bold text-xl mb-1 flex items-center gap-2">
                                            <span className="bg-pink-100 p-1.5 rounded-lg text-[#FF2D78]"><Send size={16} /></span>
                                            Broadcasting
                                        </h3>
                                        <p className="text-gray-500 text-xs">Reach audience on FB & IG</p>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {step < 4 ? (
                                            <motion.div 
                                                key="form"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                                                transition={{ duration: 0.3 }}
                                                className="flex flex-col gap-6"
                                            >
                                                {/* Editor Form (Animated) */}
                                                <div className="space-y-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative">
                                                    {/* Mouse cursor for animation effect */}
                                                    <AnimatePresence>
                                                        {(step === 2 || step === 3) && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, scale: 1.5, x: 20, y: 50 }}
                                                                animate={{ opacity: 1, scale: 1, x: 0, y: 150 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="absolute top-0 right-10 z-50 pointer-events-none"
                                                            >
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                                                                    <path d="M5.5 3.21V20.8C5.5 21.46 6.27 21.82 6.78 21.39L10.74 18.02H16.5C17.05 18.02 17.5 17.57 17.5 17.02V13.88L5.5 3.21Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
                                                                </svg>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className="space-y-2 relative">
                                                        <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Message</label>
                                                        <div className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 text-[13px] font-medium leading-relaxed resize-none focus:outline-none relative">
                                                            {message}
                                                            {step === 0 && <span className="inline-block w-1 h-3.5 bg-[#FF2D78] ml-0.5 animate-pulse" />}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 relative">
                                                        <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Button Text</label>
                                                        <div className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-[13px] font-bold focus:outline-none relative flex items-center">
                                                            {btnText}
                                                            {step === 1 && <span className="inline-block w-1 h-3.5 bg-[#FF2D78] ml-0.5 animate-pulse" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-center pb-4">
                                                    <button 
                                                        className={`w-full py-3.5 rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-all shadow-lg border border-transparent ${
                                                            step === 3 ? 'bg-gradient-to-r from-pink-400 to-rose-400 shadow-pink-500/30 opacity-80 scale-95' : 
                                                            'bg-gradient-to-r from-[#FF2D78] to-[#E1306C] shadow-[#FF2D78]/30'
                                                        }`}
                                                    >
                                                        {step < 3 && <><Send size={16} /> Send Broadcast</>}
                                                        {step === 3 && <><Clock size={16} className="animate-spin" /> Sending...</>}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ type: "spring", bounce: 0.4 }}
                                                className="flex flex-col items-center justify-center py-10 px-4 bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 rounded-3xl shadow-sm text-center mt-2"
                                            >
                                                <motion.div 
                                                    initial={{ scale: 0, rotate: -90 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                                                    className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-5 relative"
                                                >
                                                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                                                    <CheckCircle2 size={32} />
                                                </motion.div>
                                                <h4 className="font-black text-gray-900 text-xl mb-2">Broadcast Sent!</h4>
                                                <p className="text-gray-500 text-xs font-medium leading-relaxed px-2">
                                                    Successfully delivered to <strong className="text-emerald-600 font-black">12,408</strong> contacts on Facebook and Instagram.
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                
                                {/* Mobile Bottom Nav */}
                                <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center px-4 shrink-0 pb-2 z-30">
                                    <div className="flex flex-col items-center gap-1 text-[#FF2D78]">
                                        <Send size={20} />
                                        <span className="text-[9px] font-bold">Broadcast</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-gray-400">
                                        <MessageCircle size={20} />
                                        <span className="text-[9px] font-medium">Inbox</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-gray-400">
                                        <Activity size={20} />
                                        <span className="text-[9px] font-medium">Analytics</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Mobile Phones Receiving Message (Foreground / Floating) */}
                            {/* Placed OUTSIDE the overflow-hidden main phone! */}
                            
                            {/* Instagram Style Phone */}
                            <AnimatePresence>
                                {step === 4 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 80, x: 40, rotate: 15, scale: 0.7 }}
                                        animate={{ opacity: 1, y: 0, x: 0, rotate: 6, scale: 1 }}
                                        exit={{ opacity: 0, y: 40, scale: 0.9 }}
                                        transition={{ type: "spring", bounce: 0.4 }}
                                        className="absolute z-40 w-[140px] sm:w-[200px] bg-black border-[6px] sm:border-[8px] border-[#1f1f23] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden right-[-10px] md:-right-[60px] bottom-[20px] sm:bottom-[60px] shadow-purple-500/30"
                                        style={{ transformOrigin: 'bottom right' }}
                                    >
                                        {/* Dynamic Island */}
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[40%] h-4 sm:h-5 bg-black rounded-full z-50 border border-white/5" />
                                        
                                        {/* Header */}
                                        <div className="h-10 sm:h-14 bg-[#121212] border-b border-white/10 flex items-end justify-center pb-1.5 sm:pb-2 relative z-30">
                                            <div className="text-[9px] sm:text-[10px] font-bold bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">Instagram</div>
                                        </div>
                                        
                                        <div className="p-2 sm:p-4 bg-[#0a0a0a] min-h-[140px] sm:min-h-[180px] flex flex-col justify-end bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10 relative z-20">
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.5, x: 20, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                                transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
                                                className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl sm:rounded-2xl rounded-tl-sm p-2 sm:p-4 shadow-lg border border-white/10"
                                            >
                                                <p className="text-white text-[9px] sm:text-[11px] mb-2 sm:mb-3 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {targetMessage.replace('{{first_name}}', 'John')}
                                                </p>
                                                {targetBtn && (
                                                    <div className="w-full py-1.5 sm:py-2 bg-white/20 text-white text-[8px] sm:text-[10px] font-bold text-center rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/20">
                                                        {targetBtn}
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Facebook Messenger Style Phone */}
                            <AnimatePresence>
                                {step === 4 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -80, x: -40, rotate: -15, scale: 0.7 }}
                                        animate={{ opacity: 1, y: 0, x: 0, rotate: -12, scale: 1 }}
                                        exit={{ opacity: 0, y: -40, scale: 0.9 }}
                                        transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                                        className="absolute z-50 w-[130px] sm:w-[180px] bg-black border-[6px] sm:border-[8px] border-[#1f1f23] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden left-[-10px] md:-left-[40px] top-[40px] sm:top-[100px] shadow-blue-500/30"
                                        style={{ transformOrigin: 'top left' }}
                                    >
                                        {/* Dynamic Island */}
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[40%] h-4 sm:h-5 bg-black rounded-full z-50 border border-white/5" />
                                        
                                        {/* Header */}
                                        <div className="h-10 sm:h-14 bg-[#121212] border-b border-white/10 flex items-end justify-center pb-1.5 sm:pb-2 relative z-30">
                                            <div className="text-[9px] sm:text-[10px] font-bold text-blue-500">Messenger</div>
                                        </div>

                                        <div className="p-2 sm:p-3 bg-[#0a0a0a] min-h-[120px] sm:min-h-[160px] flex flex-col justify-end relative z-20">
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.5, x: -20, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                                transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                                                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl rounded-tl-sm p-2 sm:p-3 shadow-lg border border-white/10"
                                            >
                                                <p className="text-white text-[9px] sm:text-[10px] mb-1.5 sm:mb-2 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {targetMessage.replace('{{first_name}}', 'Sarah')}
                                                </p>
                                                {targetBtn && (
                                                    <div className="w-full py-1 sm:py-1.5 bg-white/20 text-white text-[8px] sm:text-[9px] font-bold text-center rounded-md sm:rounded-lg backdrop-blur-sm border border-white/20">
                                                        {targetBtn}
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
