import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers, Trash2, LayoutTemplate, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOCK_COLORS, BLOCK_ICONS } from "./builder-utils";

export const PortfolioCanvas = ({ section, sidx, sectionsLength, isArranging, onReorder, onDeleteSection, onDeleteBlock, onOpenEditor, onAddBlock }: any) => (
    <motion.div layout key={section.id}
        className="group/sec mb-6 rounded-[24px] border border-[var(--border)]/50 dark:border-[var(--border)]/50 bg-[var(--card)]/60 dark:bg-[var(--background)]/80 backdrop-blur-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500 relative">
        
        {/* Sleek Subdued Header */}
        <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-950/30 border-b border-[var(--border)]/80 dark:border-[var(--border)]/50">
            {isArranging ? (
                <div className="flex items-center gap-1.5 mr-2">
                    <button disabled={sidx === 0} onClick={() => onReorder(sidx, sidx - 1)}
                        className="w-8 h-8 rounded-lg bg-[var(--card)] dark:bg-[var(--muted)] shadow-sm flex items-center justify-center disabled:opacity-30 hover:bg-[var(--background)] hover:text-white transition-all border border-[var(--border)] dark:border-[var(--border)]">
                        <ChevronLeft size={14} />
                    </button>
                    <button disabled={sidx === sectionsLength - 1} onClick={() => onReorder(sidx, sidx + 1)}
                        className="w-8 h-8 rounded-lg bg-[var(--card)] dark:bg-[var(--muted)] shadow-sm flex items-center justify-center disabled:opacity-30 hover:bg-[var(--background)] hover:text-white transition-all border border-[var(--border)] dark:border-[var(--border)]">
                        <ChevronRight size={14} />
                    </button>
                </div>
            ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--background)] dark:bg-[var(--card)] text-white dark:text-[var(--foreground)] shadow-sm">
                    <Layers size={14} />
                </div>
            )}
            <div className="flex-1">
                <span className="text-[13px] font-bold text-[var(--foreground)] dark:text-white uppercase tracking-wider">{section.title}</span>
                <div className="flex items-center gap-2 mt-0.5 opacity-60">
                    <span className="text-[11px] font-medium text-[var(--muted-foreground)]">{section.blocks?.length || 0} active modules</span>
                </div>
            </div>
            <button onClick={() => onDeleteSection(section.id)}
                className="w-8 h-8 rounded-lg opacity-0 group-hover/sec:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-[var(--muted-foreground)]/70 flex items-center justify-center transition-all">
                <Trash2 size={14} />
            </button>
        </div>

        {/* Portfolio Block Canvas */}
        <div className="p-6">
            {section.blocks?.length === 0 ? (
                <div className="py-10 text-center rounded-[20px] border-2 border-dashed border-[var(--border)] dark:border-[var(--border)] bg-[var(--muted)]/50">
                    <p className="text-[12px] font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest">No Content Added</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {section.blocks?.map((block: any, idx: number) => {
                        const color = BLOCK_COLORS[block.type] || "#64748b";
                        const icon = BLOCK_ICONS[block.type] || <LayoutTemplate size={18} />;
                        const isEditable = ['links_carousel', 'hero_single_link', 'links_grid', 'add_products', 'add_apps', 'vertical_media', 'square_media', 'horizontal_media', 'add_logos'].includes(block.type);
                        
                        // Extract title from settings if available to make the builder look real
                        const fallbackTitle = block.type.replace(/_/g, " ");
                        const blockTitle = block.settings?.name || block.settings?.text || fallbackTitle;

                        return (
                            <motion.div layout key={block.id} onClick={() => isEditable && onOpenEditor(block)}
                                className={cn("flex items-center gap-4 p-4 rounded-[18px] border transition-all group/block relative bg-[var(--card)] dark:bg-slate-950",
                                    isEditable ? "cursor-pointer border-[var(--border)] dark:border-[var(--border)] hover:border-[var(--border)]/70 dark:hover:border-slate-600 hover:shadow-lg active:scale-[0.99] hover:-translate-y-0.5"
                                        : "border-[var(--border)] dark:border-slate-900 opacity-70")}>
                                
                                {/* Grip for reorder (visual only unless react-beautiful-dnd implemented) */}
                                <div className="w-4 flex flex-col gap-1 opacity-20 group-hover/block:opacity-100 transition-opacity cursor-grab">
                                    <div className="w-1 h-1 rounded-full bg-[var(--background)] dark:bg-[var(--card)]" />
                                    <div className="w-1 h-1 rounded-full bg-[var(--background)] dark:bg-[var(--card)]" />
                                    <div className="w-1 h-1 rounded-full bg-[var(--background)] dark:bg-[var(--card)]" />
                                </div>

                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden" 
                                     style={{ backgroundColor: `${color}15`, color }}>
                                    {icon}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/block:opacity-100 transition-opacity" />
                                </div>
                                
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="text-[14px] font-bold text-[var(--foreground)] dark:text-white tracking-tight truncate capitalize">{blockTitle}</h4>
                                    <p className="text-[11px] font-medium text-[var(--muted-foreground)] mt-0.5 truncate">{isEditable ? block.settings?.location_url || "Tap to configure module settings" : "System Component"}</p>
                                </div>
                                
                                {!isArranging && (
                                    <button onClick={e => { e.stopPropagation(); onDeleteBlock(block.id); }}
                                        className="w-10 h-10 rounded-full opacity-0 group-hover/block:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-[var(--muted-foreground)]/50 flex items-center justify-center transition-all shrink-0 border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
            <button onClick={() => onAddBlock(section.id)}
                className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl border border-[var(--border)] dark:border-[var(--border)] bg-[var(--muted)]/50 hover:bg-[var(--muted)]/60 dark:bg-[var(--background)] dark:hover:bg-[var(--muted)] text-[var(--foreground)] dark:text-white transition-all text-[13px] font-bold mt-6">
                <Plus size={16} /> Add new module
            </button>
        </div>
    </motion.div>
);
