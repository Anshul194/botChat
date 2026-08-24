"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyPlans, fetchPlans, fetchCentralPlans, createPlan, updatePlan, deletePlan, setSelectedPlan } from "@/store/slices/plansSlice";
import {
    Plus, MoreHorizontal, Edit2, Trash2, Loader2, Copy,
    Users, DollarSign, CheckCircle2, FileText, Smartphone,
    Zap, CreditCard, Star, Crown
} from "lucide-react";
import { useTenantSettings } from "@/providers/TenantSettingsProvider";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import PlanForm from "./PlanForm";

export default function PlansPage() {
    const dispatch = useAppDispatch();
    const { myPlans, plans: rawCentralPlans, centralPlans, isLoading, isLoadingMyPlans, isLoadingCentralPlans, selectedPlan } = useAppSelector((state) => state.plans);
    const user = useAppSelector((state) => state.auth.user);
    const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.type === "Super Admin";
    const { showModal } = useModal();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<number | null>(null);

    // Super Admin manages central plans; Tenant Admin manages their own local plans
    const displayPlans = isSuperAdmin ? rawCentralPlans : myPlans;
    const isLoadingPlans = isSuperAdmin ? isLoading : isLoadingMyPlans;
    // Central SaaS plans available for Tenant to purchase (only shown to non-superadmin)
    const saasPlans = isSuperAdmin ? [] : centralPlans;

    useEffect(() => {
        if (isSuperAdmin) {
            dispatch(fetchPlans());
        } else {
            dispatch(fetchMyPlans());
            dispatch(fetchCentralPlans()); // Load purchasable SaaS plans from SuperAdmin
        }
    }, [dispatch, isSuperAdmin]);

    const handleAdd = () => {
        dispatch(setSelectedPlan(null));
        setIsFormOpen(true);
    };

    const handleEdit = (plan: any) => {
        dispatch(setSelectedPlan(plan));
        setIsFormOpen(true);
    };

    const handleDuplicate = (plan: any) => {
        const cloned = { ...plan, name: `${plan.name} Copy` };
        delete cloned.id;
        dispatch(setSelectedPlan(cloned));
        setIsFormOpen(true);
    };

    const handleDeletePrompt = (id: number) => {
        setPlanToDelete(id);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!planToDelete) return;
        setIsSubmitting(true);
        try {
            await dispatch(deletePlan(planToDelete)).unwrap();
            showModal("success", "Deleted", "Plan deleted successfully.");
            setIsDeleteOpen(false);
        } catch (error: any) {
            showModal("error", "Error", error || "Failed to delete plan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Full-page form view
    if (isFormOpen) {
        return (
            <PlanForm
                initialData={selectedPlan}
                isSubmitting={isSubmitting}
                onClose={() => setIsFormOpen(false)}
                onSubmit={async (data: any) => {
                    setIsSubmitting(true);
                    try {
                        if (selectedPlan) {
                            await dispatch(updatePlan({ id: selectedPlan.id, data })).unwrap();
                            showModal("success", "Updated", "Plan updated successfully.");
                        } else {
                            await dispatch(createPlan(data)).unwrap();
                            showModal("success", "Created", "Plan created successfully.");
                        }
                        setIsFormOpen(false);
                    } catch (error: any) {
                        showModal("error", "Error", error || "Something went wrong.");
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{isSuperAdmin ? "Plan Management" : "Local Plan Management"}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {isSuperAdmin ? "Manage your pricing tiers, features, and billing cycles." : "Manage the local pricing tiers that you can assign to your own users."}
                    </p>
                </div>
                <Button onClick={handleAdd} className="w-full sm:w-auto gap-2">
                    <Plus className="w-4 h-4" />
                    New Plan
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Plans", value: displayPlans.length, icon: FileText },
                    { label: "Active", value: displayPlans.filter(p => p.status).length, icon: CheckCircle2, accent: "text-emerald-600" },
                    { label: "Highest Price", value: displayPlans.length ? formatCurrency(Math.max(...displayPlans.map(p => Number(p.price)))) : formatCurrency(0), icon: DollarSign },
                    { label: "WhatsApp Enabled", value: displayPlans.filter(p => p.features?.whatsapp === "1").length, icon: Smartphone },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                            <stat.icon className={cn("w-4 h-4 text-muted-foreground", stat.accent)} />
                        </div>
                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Plans Grid */}
            {isLoadingPlans && displayPlans.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : displayPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm">No plans yet</h3>
                    <p className="text-muted-foreground text-sm mt-1">Create your first subscription plan to get started.</p>
                    <Button onClick={handleAdd} size="sm" className="mt-4 gap-2">
                        <Plus className="w-4 h-4" />
                        Create Plan
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
                    <AnimatePresence mode="popLayout">
                        {displayPlans.map((plan, index) => {
                            const getVal = (v: any) => (typeof v === "object" && v !== null ? v.value : v);
                            return (
                                <motion.div
                                    key={plan.id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05, duration: 0.2 }}
                                >
                                    <Card className={cn(
                                        "relative flex flex-col h-full border-border hover:border-primary/40 transition-colors duration-200",
                                        plan.is_highlighted && "ring-2 ring-primary"
                                    )}>
                                        {plan.is_highlighted && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 gap-1">
                                                    <Star className="w-3 h-3 fill-current" /> Featured
                                                </Badge>
                                            </div>
                                        )}

                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-[10px] font-medium px-2 py-0",
                                                                plan.status
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                                                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                                                            )}
                                                        >
                                                            {plan.status ? "Active" : "Draft"}
                                                        </Badge>
                                                    </div>
                                                    <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                                                    {plan.description && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                                                    )}
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEdit(plan)}>
                                                            <Edit2 className="w-3.5 h-3.5" /> Edit Plan
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleDuplicate(plan)}>
                                                            <Copy className="w-3.5 h-3.5" /> Duplicate Plan
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                            onClick={() => handleDeletePrompt(plan.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Delete Plan
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="mt-3">
                                                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                                                <span className="text-muted-foreground text-sm ml-1">/ {plan.duration} {plan.duration_type}</span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex-1 pb-3">
                                            <div className="space-y-2">
                                                {[
                                                    { icon: Users, label: `${getVal(plan.features?.connect_account) || 0} Connected Accounts` },
                                                    { icon: CreditCard, label: `${getVal(plan.features?.message_credit) || 0} Message Credits` },
                                                    { icon: Users, label: `${getVal(plan.features?.subscribers) || 0} Subscribers` },
                                                    { icon: Zap, label: `${getVal(plan.features?.bot_ai_token) || 0} AI Tokens` },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm">
                                                        <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <span className="text-muted-foreground">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Channel indicators */}
                                            <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                                                {plan.features?.whatsapp === "1" && (
                                                    <Badge variant="secondary" className="text-[10px] px-2 py-0">WhatsApp</Badge>
                                                )}
                                                {plan.features?.telegram === "1" && (
                                                    <Badge variant="secondary" className="text-[10px] px-2 py-0">Telegram</Badge>
                                                )}
                                                {plan.features?.facebook === "1" && (
                                                    <Badge variant="secondary" className="text-[10px] px-2 py-0">Facebook</Badge>
                                                )}
                                                {plan.features?.instagram === "1" && (
                                                    <Badge variant="secondary" className="text-[10px] px-2 py-0">Instagram</Badge>
                                                )}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="pt-3 border-t border-border">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleEdit(plan)}
                                            >
                                                Edit Plan
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* ── SaaS Plans from SuperAdmin (Tenant purchase/upgrade) ─────────── */}
            {!isSuperAdmin && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                                <Crown className="w-5 h-5 text-amber-500" />
                                Purchase SaaS Subscription
                            </h2>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                Upgrade or purchase your SaaS subscription to unlock higher limits and features.
                            </p>
                        </div>
                    </div>

                    {isLoadingCentralPlans && saasPlans.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : saasPlans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
                            <p className="text-sm text-muted-foreground">No SaaS plans configured by SuperAdmin yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {saasPlans.map((plan) => (
                                <Card key={plan.id} className={cn(
                                    "relative flex flex-col h-full border-border hover:border-amber-400/60 transition-colors duration-200",
                                    plan.is_highlighted && "ring-2 ring-amber-400"
                                )}>
                                    {plan.is_highlighted && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-amber-500 text-white text-[10px] font-semibold px-3 gap-1">
                                                <Star className="w-3 h-3 fill-current" /> Recommended
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                                                SuperAdmin
                                            </Badge>
                                            {plan.status ? (
                                                <Badge variant="outline" className="text-[10px] font-medium px-2 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">Active</Badge>
                                            ) : null}
                                        </div>
                                        <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                                        {plan.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                                        )}
                                        <div className="mt-3">
                                            <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                                            <span className="text-muted-foreground text-sm ml-1">/ {plan.duration} {plan.duration_type}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-3">
                                        <div className="space-y-2">
                                            {[
                                                { icon: Users, label: `${plan.features?.connect_account || 0} Connected Accounts` },
                                                { icon: CreditCard, label: `${plan.features?.message_credit || 0} Message Credits` },
                                                { icon: Users, label: `${plan.features?.subscribers || 0} Subscribers` },
                                                { icon: Zap, label: `${plan.features?.bot_ai_token || 0} AI Tokens` },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    <span className="text-muted-foreground">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                                            {plan.features?.facebook === "1" && <Badge variant="secondary" className="text-[10px] px-2 py-0">Facebook</Badge>}
                                            {plan.features?.instagram === "1" && <Badge variant="secondary" className="text-[10px] px-2 py-0">Instagram</Badge>}
                                            {plan.features?.whatsapp === "1" && <Badge variant="secondary" className="text-[10px] px-2 py-0">WhatsApp</Badge>}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-3 border-t border-border">
                                        <Button
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => window.location.href = '/dashboard/billing/plans'}
                                        >
                                            <CreditCard className="w-3.5 h-3.5" /> Purchase / Upgrade
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Plan</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this plan? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Delete Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
