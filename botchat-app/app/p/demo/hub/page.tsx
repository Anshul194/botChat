"use client";

import React from "react";
import Link from "next/link";
import { Camera, Grid, ImageIcon, Layers, ArrowRight, Sparkles, Layout, Globe, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMOS = [
    { 
        id: 'standard', 
        name: 'Standard', 
        desc: 'The classic bio-link layout with a clean, centralized stack.', 
        url: '/p/demo/standard', 
        icon: <Layers className="text-blue-500" />,
        color: "from-blue-500/20 to-blue-600/20"
    },
    { 
        id: 'portfolio', 
        name: 'Portfolio', 
        desc: 'High-end layout for creatives with tabbed navigation.', 
        url: '/p/demo/portfolio', 
        icon: <Grid className="text-purple-500" />,
        color: "from-purple-500/20 to-purple-600/20"
    },
    { 
        id: 'ugc', 
        name: 'UGC Creator', 
        desc: 'Aesthetic, Parisian-style layout for content creators.', 
        url: '/p/demo/ugc', 
        icon: <Camera className="text-pink-500" />,
        color: "from-pink-500/20 to-pink-600/20"
    },
    { 
        id: 'olivia', 
        name: 'Olivia', 
        desc: 'Image-heavy layout with a sophisticated editorial feel.', 
        url: '/p/demo/olivia', 
        icon: <ImageIcon className="text-emerald-500" />,
        color: "from-emerald-500/20 to-emerald-600/20"
    },
    { 
        id: 'universal', 
        name: 'Universal', 
        desc: 'Versatile layout that adapts to any niche or content type.', 
        url: '/p/demo/universal', 
        icon: <Globe className="text-amber-500" />,
        color: "from-amber-500/20 to-amber-600/20"
    }
];

export default function DemoHub() {
    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] font-sans">
            <div className="max-w-5xl mx-auto px-6 py-20">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-xl mb-6 transform -rotate-6">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        Layout <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">Showcase</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg font-medium">
                        Explore our professionally curated layouts designed to maximize engagement and showcase your unique aesthetic.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DEMOS.map((demo) => (
                        <Link key={demo.id} href={demo.url} className="group">
                            <div className="h-full bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden">
                                <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-50 blur-3xl transition-opacity group-hover:opacity-100", demo.color)} />
                                
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    {React.cloneElement(demo.icon as any, { size: 28 })}
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                    {demo.name}
                                </h3>
                                
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 flex-1">
                                    {demo.desc}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        View Demo
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 pt-10 border-t border-slate-100 dark:border-white/5 text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Built with BotChat Bio Studio &copy; 2024
                    </p>
                </div>
            </div>
        </div>
    );
}
