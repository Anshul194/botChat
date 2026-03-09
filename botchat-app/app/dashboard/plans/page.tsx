"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPlans, createPlan, updatePlan, deletePlan, setSelectedPlan } from "@/store/slices/plansSlice";
import {
    Plus, CreditCard, Check, Shield, Zap,
    MoreVertical, Edit2, Trash2, Loader2, AlertCircle,
    Users, Layout, FileText, Globe, Clock, DollarSign,
    ArrowRight, CheckCircle2, Star, Sparkles, Gem
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "../../../components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PlansPage() {
    const dispatch = useAppDispatch();
    const { plans, isLoading, selectedPlan } = useAppSelector((state) => state.plans);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        duration: 1,
        durationtype: "Month",
        max_users: 5,
        max_roles: 3,
        max_documents: -1,
        max_blogs: -1,
        active_status: true
    });

    useEffect(() => {
        dispatch(fetchPlans());
        document.title = "Plan Management | BotChat Admin";
    }, [dispatch]);

    const handleOpenAdd = () => {
        dispatch(setSelectedPlan(null));
        setFormData({
            name: "",
            price: 0,
            duration: 1,
            durationtype: "Month",
            max_users: 5,
            max_roles: 3,
            max_documents: -1,
            max_blogs: -1,
            active_status: true
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (plan: any) => {
        dispatch(setSelectedPlan(plan));
        setFormData({
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            durationtype: plan.durationtype,
            max_users: plan.max_users,
            max_roles: plan.max_roles,
            max_documents: plan.max_documents,
            max_blogs: plan.max_blogs,
            active_status: plan.active_status
        });
        setIsAddModalOpen(true);
    };

    const handleOpenDelete = (id: number) => {
        setPlanToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (selectedPlan) {
                await dispatch(updatePlan({ id: selectedPlan.id, data: formData })).unwrap();
                toast.success("Plan updated successfully");
            } else {
                await dispatch(createPlan(formData)).unwrap();
                toast.success("Plan created successfully");
            }
            setIsAddModalOpen(false);
        } catch (error: any) {
            toast.error(error || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePlan = async () => {
        if (!planToDelete) return;
        setIsSubmitting(true);
        try {
            await dispatch(deletePlan(planToDelete)).unwrap();
            toast.success("Plan deleted successfully");
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            toast.error(error || "Failed to delete plan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-10 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Trendy Header Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-card/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-premium">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Gem className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Admin Console</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
                            Subscription Tiers<span className="text-primary text-6xl leading-none">.</span>
                        </h1>
                        <p className="text-muted-foreground text-base max-w-xl font-medium leading-relaxed">
                            Craft the perfect value proposition for your customers. Manage resource quotas,
                            durations, and premium feature access from one unified dashboard.
                        </p>
                    </div>
                    <Button
                        onClick={handleOpenAdd}
                        className="rounded-2xl h-14 px-8 font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.05] active:scale-[0.95] bg-primary hover:bg-primary/90"
                    >
                        <Plus className="mr-2 h-5 w-5 stroke-[3px]" />
                        New Tier
                    </Button>
                </div>
            </div>

            {/* Quick Stats / Feedback */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Plans", value: plans.filter(p => p.active_status).length, icon: CheckCircle2, color: "text-emerald-500" },
                    { label: "Draft Plans", value: plans.filter(p => !p.active_status).length, icon: FileText, color: "text-amber-500" },
                    { label: "Highest Price", value: `$${Math.max(...plans.map(p => p.price), 0)}`, icon: DollarSign, color: "text-primary" },
                    { label: "Unlimited Docs", value: plans.filter(p => p.max_documents === -1).length, icon: Sparkles, color: "text-indigo-500" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-card/30 p-4 rounded-3xl border border-white/5 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                            <p className="text-xl font-black mt-1">{stat.value}</p>
                        </div>
                        <stat.icon className={cn("w-5 h-5 opacity-40", stat.color)} />
                    </motion.div>
                ))}
            </div>

            {/* Premium Plans Grid */}
            {isLoading && plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card/20 rounded-[3rem] border border-dashed border-white/10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse"></div>
                        <Loader2 className="h-14 w-14 animate-spin text-primary relative z-10 stroke-[3px]" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Orchestrating Tiers...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                transition={{ type: "spring", damping: 20, stiffness: 100, delay: index * 0.1 }}
                                className="group h-full"
                            >
                                <Card className="border-none bg-card/30 backdrop-blur-3xl shadow-premium group-hover:bg-card/50 transition-all duration-500 relative overflow-hidden h-full flex flex-col rounded-[2.5rem] border border-white/[0.03] group-hover:border-primary/20">
                                    {/* Animated Gradient Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Corner Shine */}
                                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-700" />

                                    <CardHeader className="relative p-8 pb-4">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        plan.active_status ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted"
                                                    )} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                        {plan.active_status ? "Live Product" : "Draft Tier"}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-3xl font-black tracking-tight">{plan.name}</CardTitle>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-2xl w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/5">
                                                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 bg-popover/90 backdrop-blur-2xl border-white/10 shadow-2xl">
                                                    <DropdownMenuItem className="gap-3 p-3 rounded-xl font-bold cursor-pointer transition-all" onClick={() => handleOpenEdit(plan)}>
                                                        <Edit2 className="h-4 w-4 text-primary" /> Edit Settings
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5" />
                                                    <DropdownMenuItem
                                                        className="gap-3 p-3 rounded-xl font-bold text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer transition-all"
                                                        onClick={() => handleOpenDelete(plan.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Decommission Tier
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="relative inline-flex flex-col">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">${plan.price}</span>
                                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">/{plan.durationtype}</span>
                                            </div>
                                            <div className="h-1 w-12 bg-primary/40 rounded-full mt-2" />
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-8 pt-4 space-y-6 flex-1 relative">
                                        <div className="space-y-4">
                                            <QuickFeature icon={Users} label="Users" value={plan.max_users} unit="Limit" />
                                            <QuickFeature icon={FileText} label="Docs" value={plan.max_documents} unit="Quota" />
                                            <QuickFeature icon={Shield} label="Security" value={plan.max_roles} unit="Roles" />
                                            <QuickFeature icon={Zap} label="Growth" value={plan.max_blogs} unit="Blogs" />
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 mb-3">Included Benefits</p>
                                            <ul className="space-y-2.5">
                                                <Benefit text="Premium API Integration" />
                                                <Benefit text="Advanced Analytics" />
                                                <Benefit text="24/7 Priority Support" />
                                            </ul>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-8 pt-2">
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 rounded-2xl bg-white/5 border-white/5 font-black text-xs uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-white transition-all duration-500 overflow-hidden relative shadow-inner"
                                            onClick={() => handleOpenEdit(plan)}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                Manage Tier <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modern Slide-up Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-[3rem] border-none bg-background/95 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.4)]">
                    <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                        <div className="p-10 pb-4 space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
                                <Star className="w-3 h-3 fill-current" /> {selectedPlan ? "Update Tier" : "Configuration Mode"}
                            </div>
                            <h2 className="text-4xl font-black tracking-tight">{selectedPlan ? "Global Refinement" : "Architect New Value"}</h2>
                            <p className="text-muted-foreground font-medium">Fine-tune pricing, duration, and resource boundaries.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 pt-4 space-y-8 scrollbar-none">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="col-span-2 sm:col-span-1 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Identity</label>
                                    <Input
                                        required
                                        className="rounded-3xl h-14 bg-card/50 border-white/5 focus:ring-2 focus:ring-primary/20 px-6 font-bold text-lg"
                                        placeholder="Tier Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Monetization ($)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-primary stroke-[3px]" />
                                        </div>
                                        <Input
                                            required
                                            type="number"
                                            step="0.01"
                                            className="rounded-3xl h-14 bg-card/50 border-white/5 pl-14 pr-6 font-black text-xl"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-1 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Cycle Duration</label>
                                    <Input
                                        required
                                        type="number"
                                        className="rounded-3xl h-14 bg-card/50 border-white/5 px-6 font-black"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-1 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Billing Interval</label>
                                    <select
                                        className="w-full rounded-3xl h-14 bg-card/50 border border-white/5 px-6 font-black appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                                        value={formData.durationtype}
                                        onChange={e => setFormData({ ...formData, durationtype: e.target.value })}
                                    >
                                        <option value="Day">Day</option>
                                        <option value="Month">Month</option>
                                        <option value="Year">Year</option>
                                    </select>
                                </div>

                                <div className="col-span-2 pt-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-px bg-white/5 flex-1" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">Resource Allocation</span>
                                        <div className="h-px bg-white/5 flex-1" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <QuotaInput label="Max Users" icon={Users} value={formData.max_users} onChange={(v) => setFormData({ ...formData, max_users: v })} />
                                        <QuotaInput label="Max Roles" icon={Shield} value={formData.max_roles} onChange={(v) => setFormData({ ...formData, max_roles: v })} />
                                        <QuotaInput label="Documents" icon={FileText} value={formData.max_documents} onChange={(v) => setFormData({ ...formData, max_documents: v })} />
                                        <QuotaInput label="Blog Posts" icon={Zap} value={formData.max_blogs} onChange={(v) => setFormData({ ...formData, max_blogs: v })} />
                                    </div>
                                </div>

                                <div className="col-span-2 py-4">
                                    <div className="flex items-center justify-between p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                        <div>
                                            <p className="text-sm font-black mb-0.5">Commercial Status</p>
                                            <p className="text-[10px] text-muted-foreground font-bold leading-none uppercase tracking-widest">Visibility in Customer Portal</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, active_status: !formData.active_status })}
                                            className={cn(
                                                "h-8 px-5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                                formData.active_status ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {formData.active_status ? "Production Ready" : "Staging / Draft"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 pt-4 bg-card/20 border-t border-white/5 flex gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-16 rounded-[1.5rem] font-bold px-8 hover:bg-muted"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (selectedPlan ? "Save Configurations" : "Launch Tier")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Premium Alert Portal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-[3rem] border-none bg-background shadow-premium">
                    <div className="p-10 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8 relative">
                            <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full"></div>
                            <Trash2 className="w-10 h-10 relative z-10 stroke-[2.5px]" />
                        </div>
                        <h3 className="text-2xl font-black mb-3">Retire this Tier?</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed mb-10 px-4">
                            You are about to permanently decommission this subscription plan.
                            Users currently enrolled will need to be migrated. Action is <span className="text-rose-500 font-black">irreversible</span>.
                        </p>

                        <div className="flex flex-col w-full gap-4">
                            <Button
                                disabled={isSubmitting}
                                onClick={handleDeletePlan}
                                className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-transform"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Decommission"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-14 rounded-2xl font-bold text-muted-foreground hover:bg-muted"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Revert Change
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function QuickFeature({ icon: Icon, label, value, unit }: { icon: any, label: string, value: any, unit: string }) {
    return (
        <div className="flex items-center justify-between group/feat">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center group-hover/feat:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover/feat:text-primary transition-colors" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{unit}</span>
                    <span className="text-xs font-black text-foreground">{label}</span>
                </div>
            </div>
            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 font-black text-xs">
                {value === -1 ? "∞" : value}
            </div>
        </div>
    );
}

function Benefit({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 group/ben">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Check className="w-3 h-3 stroke-[4px]" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground group-hover/ben:text-foreground transition-colors">{text}</span>
        </li>
    );
}

function QuotaInput({ label, icon: Icon, value, onChange }: { label: string, icon: any, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                <Icon className="w-3 h-3" /> {label}
            </label>
            <div className="relative group">
                <Input
                    type="number"
                    className="rounded-3xl h-14 bg-card/30 border-white/5 px-6 font-black transition-all focus:bg-card/50"
                    value={value}
                    onChange={e => onChange(parseInt(e.target.value))}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-[8px] font-black text-muted-foreground bg-white/5 px-2 py-1 rounded-md uppercase tracking-tight">-1 = ∞</span>
                </div>
            </div>
        </div>
    );
}
