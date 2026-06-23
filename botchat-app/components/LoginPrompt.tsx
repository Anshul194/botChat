"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";
import Link from "next/link";

interface LoginPromptProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export default function LoginPrompt({
    open,
    onOpenChange,
    title = "Login Required",
    description = "You need to be logged in to access this feature.",
}: LoginPromptProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-[2rem] border-none bg-background shadow-2xl">
                <VisuallyHidden asChild>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
                        <Lock className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-black tracking-tight mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4">
                        {description}
                    </p>

                    <div className="flex flex-col w-full gap-3 mt-8">
                        <Link href="/auth/sign-in" className="w-full">
                            <Button className="w-full h-12 rounded-2xl font-black gap-2 shadow-lg">
                                <LogIn className="w-4 h-4" /> Sign In
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-2xl font-bold hover:bg-muted"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
