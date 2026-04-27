import React from "react";
import { cn } from "@/lib/utils";

export const StandardLayout = ({ 
    topAvatar, 
    groupedRows, 
    profile, 
    renderBlockUI 
}: any) => {
    return (
        <div className="w-full">
            {/* Always Pin the single primary Avatar to top */}
            {topAvatar && renderBlockUI(topAvatar, false, -1, true)}

            <div className="flex flex-col gap-2">
                {groupedRows.map((row: any, ridx: number) => {
                    const isFisher = profile.theme === 'modern_fisher';
                    const cardClass = isFisher ? "bg-white/90 backdrop-blur-sm p-7 rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-white/50 mb-8" : "mb-10";

                    if (row.type === 'section') {
                        return (
                            <div key={ridx} className={cardClass}>
                                {renderBlockUI(row.heading, true, ridx)}
                                <div className="space-y-3 mt-4">
                                    {row.blocks.map((b: any, bidx: number) => renderBlockUI(b, false, bidx))}
                                </div>
                            </div>
                        );
                    }
                    if (row.type === 'grid') {
                        return (
                            <div key={ridx} className={cn(
                                row.blocks.length > 1 ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3',
                                cardClass
                            )}>
                                {row.blocks.map((b: any, bidx: number) => renderBlockUI(b, row.blocks.length > 1, bidx))}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};
