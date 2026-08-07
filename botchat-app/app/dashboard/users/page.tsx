"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTenantSettings } from "@/providers/TenantSettingsProvider";
import { fetchUsers, toggleUserStatus, fetchUserById, createUser, assignPlanToUser, UserDetail } from "@/store/slices/usersSlice";
import { fetchPlans, fetchMyPlans } from "@/store/slices/plansSlice";
import { Users, Search, Filter, MoreVertical, Shield, UserCheck, UserMinus, Mail, X } from "lucide-react";
import { Phone, Globe, Calendar, ArrowUpRight, Loader2, CheckCircle2, XCircle, Eye, EyeOff, ShieldCheck, ShieldOff, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import FeatureGate from "@/components/subscription/FeatureGate";

/**
 * Plan Status Badge Component with Phase 4 & Phase 13 Badging
 */
function PlanStatusBadge({ planName, planStatus }: { planName?: string; planStatus?: string }) {
    const name = planName || "No Plan";
    const status = (planStatus || "").toLowerCase();

    if (status === "expired" || name.toLowerCase().includes("expired")) {
        return (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
                {name}
            </Badge>
        );
    }
    if (status === "cancelled" || name.toLowerCase().includes("cancelled")) {
        return (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
                {name}
            </Badge>
        );
    }
    if (status === "trial" || name.toLowerCase().includes("trial")) {
        return (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
                {name}
            </Badge>
        );
    }
    if (name === "No Plan" || !planName) {
        return (
            <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
                No Plan
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
            {name}
        </Badge>
    );
}

function UserMobileCard({ user, onView, onAssignPlan, onToggleStatus }: {
    user: UserDetail;
    onView: () => void;
    onAssignPlan: () => void;
    onToggleStatus: (e: React.MouseEvent) => void;
}) {
    const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U';
    return (
        <div className="bg-card/40 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <button onClick={onView} className="w-full text-left px-4 pt-4 pb-3">
                <div className="flex items-center gap-3 mb-2.5">
                    <Avatar className="h-11 w-11 border-2 border-background shadow-lg shrink-0">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-xs font-black text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                            <h4 className="text-sm font-black leading-none truncate">{user.name}</h4>
                            <PlanStatusBadge planName={user.current_plan} planStatus={user.plan_status} />
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground mt-1 truncate flex items-center gap-1">
                            <Mail className="h-2.5 w-2.5 shrink-0" /> {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-muted-foreground">
                            <Phone className="h-2.5 w-2.5" /> {user.phone || 'N/A'}
                            <span className="opacity-40">•</span>
                            <Globe className="h-2.5 w-2.5" /> {user.country || 'Global'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={cn(
                            "px-1.5 py-0 text-[9px] font-black uppercase tracking-wider",
                            user.type === 'Super Admin' ? "border-indigo-500/30 text-indigo-500 bg-indigo-500/5" : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                        )}>
                            {user.role || user.type}
                        </Badge>
                        {user.two_factor_enabled && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500">
                                <ShieldCheck className="h-2.5 w-2.5" /> 2FA
                            </span>
                        )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-bold flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {user.created_at ? formatDate(new Date(user.created_at), 'MMM D, YYYY') : 'N/A'}
                    </span>
                </div>
            </button>

            <div className="border-t border-white/5 grid grid-cols-3 divide-x divide-white/5">
                <button onClick={onView} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-primary hover:bg-primary/5 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide">View</span>
                </button>
                <button onClick={onAssignPlan} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide">Plan</span>
                </button>
                <button onClick={onToggleStatus} className={cn(
                    "py-2.5 flex flex-col items-center justify-center gap-0.5 transition-colors",
                    user.active_status ? "text-rose-500 hover:bg-rose-500/5" : "text-emerald-500 hover:bg-emerald-500/5"
                )}>
                    {user.active_status ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    <span className="text-[8px] font-bold uppercase tracking-wide">{user.active_status ? "Restrict" : "Activate"}</span>
                </button>
            </div>
        </div>
    );
}

export default function UserManagementPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { settings } = useTenantSettings();

    const { users, isLoading, selectedUser, total, page, totalPages } = useAppSelector((state) => state.users);
    const { plans, myPlans } = useAppSelector((state) => state.plans);
    const availableTenantPlans = myPlans && myPlans.length > 0 ? myPlans : plans;
    const { showModal } = useModal();

    // URL Search Params State Synchronization
    const urlSearch = searchParams.get("search") || "";
    const urlRole = searchParams.get("role") || "all";
    const urlStatus = searchParams.get("status") || "all";
    const urlPlanId = searchParams.get("plan_id") || "all";
    const urlTwoFactor = searchParams.get("two_factor") || "all";
    const urlSortBy = searchParams.get("sort_by") || "newest";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);

    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [isPending, startTransition] = useTransition();

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Add User Dialog State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [addUserForm, setAddUserForm] = useState({
        name: "",
        email: "",
        password: "",
        domains: "",
        country_code: "US",
        dial_code: "+1",
        phone: "",
        plan_id: "",
    });

    // Assign Plan Dialog State
    const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
    const [assignPlanTarget, setAssignPlanTarget] = useState<{ id: number; name: string } | null>(null);
    const [assignPlanData, setAssignPlanData] = useState({ plan_id: "", plan_expired_date: "" });
    const [isAssigningPlan, setIsAssigningPlan] = useState(false);

    // Confirmation States
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        userId: number | null;
        userName: string;
        currentStatus: boolean;
    }>({
        open: false,
        userId: null,
        userName: "",
        currentStatus: false
    });

    // Sync URL params update
    const updateUrlParams = useCallback((newParams: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all") {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [searchParams, pathname, router]);

    // Debounced search sync to URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== urlSearch) {
                updateUrlParams({ search: searchTerm, page: 1 });
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm, urlSearch, updateUrlParams]);

    // Fetch users when URL search parameters change
    useEffect(() => {
        const queryParams: Record<string, any> = {
            search: urlSearch || undefined,
            role: urlRole !== 'all' ? urlRole : undefined,
            status: urlStatus !== 'all' ? urlStatus : undefined,
            plan_id: urlPlanId !== 'all' ? urlPlanId : undefined,
            two_factor: urlTwoFactor !== 'all' ? urlTwoFactor : undefined,
            sort_by: urlSortBy,
            page: urlPage,
            per_page: 15,
        };

        dispatch(fetchUsers(queryParams));
        dispatch(fetchMyPlans());
        dispatch(fetchPlans());
        document.title = `User Management | ${settings.appName}`;
    }, [dispatch, urlSearch, urlRole, urlStatus, urlPlanId, urlTwoFactor, urlSortBy, urlPage, settings.appName]);

    const handleResetFilters = () => {
        setSearchTerm("");
        startTransition(() => {
            router.push(pathname);
        });
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addUserForm.name || !addUserForm.email || !addUserForm.password || !addUserForm.plan_id) {
            showModal("error", "Error", "Please fill in all required fields.");
            return;
        }
        setIsAddingUser(true);
        try {
            await dispatch(createUser({
                name: addUserForm.name,
                email: addUserForm.email,
                password: addUserForm.password,
                domains: addUserForm.domains,
                country_code: addUserForm.country_code,
                dial_code: addUserForm.dial_code,
                phone: addUserForm.phone,
                plan_id: Number(addUserForm.plan_id),
            })).unwrap();
            showModal("success", "Created", "User created successfully!");
            setIsAddUserOpen(false);
            setAddUserForm({ name: "", email: "", password: "", domains: "", country_code: "US", dial_code: "+1", phone: "", plan_id: "" });
            dispatch(fetchUsers({ page: urlPage, per_page: 15 }));
        } catch (error: any) {
            showModal("error", "Error", typeof error === 'string' ? error : "Failed to create user.");
        } finally {
            setIsAddingUser(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!confirmState.userId) return;

        try {
            await dispatch(toggleUserStatus(confirmState.userId)).unwrap();
            showModal("success", "Status Updated", `User ${confirmState.currentStatus ? 'deactivated' : 'activated'} successfully`);
            setConfirmState(s => ({ ...s, open: false }));
        } catch (error: any) {
            showModal("error", "Error", typeof error === 'string' ? error : "Failed to update status");
        }
    };

    const triggerConfirm = (e: React.MouseEvent, user: UserDetail) => {
        e.stopPropagation();
        setConfirmState({
            open: true,
            userId: user.id,
            userName: user.name,
            currentStatus: user.active_status
        });
    };

    const handleAssignPlan = async () => {
        if (!assignPlanTarget || !assignPlanData.plan_id) return;
        setIsAssigningPlan(true);
        try {
            await dispatch(assignPlanToUser({
                id: assignPlanTarget.id,
                plan_id: Number(assignPlanData.plan_id),
                plan_expired_date: assignPlanData.plan_expired_date || undefined,
            })).unwrap();
            showModal("success", "Plan Assigned", `Plan assigned to ${assignPlanTarget.name} successfully!`);
            setIsAssignPlanOpen(false);
            setAssignPlanData({ plan_id: "", plan_expired_date: "" });
            dispatch(fetchUsers({ page: urlPage, per_page: 15 }));
        } catch (error: any) {
            showModal("error", "Error", typeof error === 'string' ? error : "Failed to assign plan.");
        } finally {
            setIsAssigningPlan(false);
        }
    };

    const handleViewDetails = async (id: number) => {
        setIsFetchingDetail(true);
        setIsDetailOpen(true);
        try {
            await dispatch(fetchUserById(id)).unwrap();
        } catch (error: any) {
            showModal("error", "Error", typeof error === 'string' ? error : "Failed to fetch user details");
            setIsDetailOpen(false);
        } finally {
            setIsFetchingDetail(false);
        }
    };

    const hasActiveFilters = Boolean(urlSearch || urlRole !== 'all' || urlStatus !== 'all' || urlPlanId !== 'all' || urlTwoFactor !== 'all' || urlSortBy !== 'newest');

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter sm:text-3xl md:text-4xl">
                        User Management<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">Global directory, role assignments, and subscription control</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <FeatureGate feature="team_member" hide>
                        <Button
                            className="w-full sm:w-auto rounded-xl font-bold shadow-lg shadow-primary/20"
                            onClick={() => setIsAddUserOpen(true)}
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New User
                        </Button>
                    </FeatureGate>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-none bg-card/50 shadow-premium">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Directory</p>
                                <h3 className="text-2xl font-black mt-1">{total}</h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-card/50 shadow-premium">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active Users</p>
                                <h3 className="text-2xl font-black mt-1">{users.filter(u => u.active_status).length}</h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-card/50 shadow-premium">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Restricted / Suspended</p>
                                <h3 className="text-2xl font-black mt-1">{users.filter(u => !u.active_status || u.is_suspended).length}</h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <UserMinus className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Area with Phase 9 Server Filter Toolbar */}
            <Card className="border-none bg-card/30 shadow-premium overflow-hidden">
                <CardHeader className="flex flex-col gap-4 space-y-0 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                Active Directory
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            </CardTitle>
                            <CardDescription>Managing {total} registered accounts across subscriptions</CardDescription>
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs font-bold text-muted-foreground hover:text-primary gap-1 self-start sm:self-auto">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
                            </Button>
                        )}
                    </div>

                    {/* Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
                        {/* Server Global Search Bar */}
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search name, email, phone..."
                                className="pl-9 pr-8 rounded-xl bg-muted/40 border-none text-xs font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Role Filter */}
                        <Select value={urlRole} onValueChange={(val) => updateUrlParams({ role: val, page: 1 })}>
                            <SelectTrigger className="rounded-xl bg-muted/40 border-none text-xs font-bold">
                                <SelectValue placeholder="Filter Role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="Admin">Admin / Tenant Owner</SelectItem>
                                <SelectItem value="User">Standard User</SelectItem>
                                <SelectItem value="Super Admin">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Plan Filter */}
                        <Select value={urlPlanId} onValueChange={(val) => updateUrlParams({ plan_id: val, page: 1 })}>
                            <SelectTrigger className="rounded-xl bg-muted/40 border-none text-xs font-bold">
                                <SelectValue placeholder="Filter Plan" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Plans</SelectItem>
                                {availableTenantPlans.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={urlStatus} onValueChange={(val) => updateUrlParams({ status: val, page: 1 })}>
                            <SelectTrigger className="rounded-xl bg-muted/40 border-none text-xs font-bold">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active Only</SelectItem>
                                <SelectItem value="restricted">Restricted</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sorting */}
                        <Select value={urlSortBy} onValueChange={(val) => updateUrlParams({ sort_by: val, page: 1 })}>
                            <SelectTrigger className="rounded-xl bg-muted/40 border-none text-xs font-bold">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                                <SelectItem value="email">Email (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop DataTable with Phase 8 Columns */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-muted/20">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">User Profile</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Current Plan</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">2FA</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Joined</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-60 max-w-sm mx-auto">
                                                <Users className="h-12 w-12 text-muted-foreground" />
                                                <h4 className="text-base font-black">No Users Found</h4>
                                                <p className="text-xs text-muted-foreground font-medium text-center">
                                                    {urlSearch ? `No matching accounts found for "${urlSearch}".` : 'No accounts match the selected filter criteria.'}
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 rounded-xl text-xs font-bold">
                                                        Reset All Filters
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => handleViewDetails(user.id)}
                                            className="group hover:bg-primary/[0.03] transition-all cursor-pointer border-b border-white/[0.02]"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-lg transition-transform group-hover:scale-105">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback className="bg-primary/10 text-xs font-black text-primary">
                                                            {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-black leading-none">{user.name}</p>
                                                        <p className="text-[11px] font-medium text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Mail className="h-2.5 w-2.5" />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={cn(
                                                    "w-fit px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                                                    user.type === 'Super Admin' ? "border-indigo-500/30 text-indigo-500 bg-indigo-500/5" : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                                                )}>
                                                    {user.role || user.type}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <PlanStatusBadge planName={user.current_plan} planStatus={user.plan_status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => triggerConfirm(e, user)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black transition-all",
                                                        user.active_status
                                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/25"
                                                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/25"
                                                    )}
                                                >
                                                    <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px]", user.active_status ? "bg-emerald-500 shadow-emerald-500/50" : "bg-rose-500 shadow-rose-500/50")} />
                                                    {user.active_status ? "ACTIVE" : "RESTRICTED"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.two_factor_enabled ? (
                                                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                                        <ShieldCheck className="h-3.5 w-3.5" /> Enabled
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/60">
                                                        <ShieldOff className="h-3.5 w-3.5" /> Off
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {user.created_at ? formatDate(new Date(user.created_at), 'MMM D, YYYY') : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-card/10">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                                                        <DropdownMenuItem className="gap-2" onClick={() => handleViewDetails(user.id)}>
                                                            <ArrowUpRight className="h-3.5 w-3.5" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2" onClick={() => {
                                                            setAssignPlanTarget({ id: user.id, name: user.name });
                                                            setAssignPlanData({ plan_id: "", plan_expired_date: "" });
                                                            setIsAssignPlanOpen(true);
                                                        }}>
                                                            <Shield className="h-3.5 w-3.5" /> Assign Plan
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10" onClick={(e: React.MouseEvent) => triggerConfirm(e, user)}>
                                                            {user.active_status ? (
                                                                <><UserMinus className="h-3.5 w-3.5" /> Deactivate Account</>
                                                            ) : (
                                                                <><UserCheck className="h-3.5 w-3.5" /> Activate Account</>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden flex flex-col gap-3 p-4 sm:p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-3 py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-16 opacity-60">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm font-bold uppercase tracking-widest">No users found</p>
                            </div>
                        ) : (
                            users.map(user => (
                                <UserMobileCard
                                    key={user.id}
                                    user={user}
                                    onView={() => handleViewDetails(user.id)}
                                    onAssignPlan={() => {
                                        setAssignPlanTarget({ id: user.id, name: user.name });
                                        setAssignPlanData({ plan_id: "", plan_expired_date: "" });
                                        setIsAssignPlanOpen(true);
                                    }}
                                    onToggleStatus={(e) => triggerConfirm(e, user)}
                                />
                            ))
                        )}
                    </div>

                    {/* Phase 10 Server Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-card/20">
                            <p className="text-xs font-bold text-muted-foreground">
                                Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span> ({total} total users)
                            </p>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1 || isLoading}
                                    onClick={() => updateUrlParams({ page: page - 1 })}
                                    className="rounded-xl text-xs font-bold gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages || isLoading}
                                    onClick={() => updateUrlParams({ page: page + 1 })}
                                    className="rounded-xl text-xs font-bold gap-1"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}

            {/* Assign Plan Modal */}
            <Dialog open={isAssignPlanOpen} onOpenChange={setIsAssignPlanOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Assign Subscription Plan</DialogTitle>
                        <DialogDescription>
                            Assign a local plan and set expiration for {assignPlanTarget?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="plan_id" className="text-xs font-bold">Select Plan *</Label>
                            <Select
                                value={assignPlanData.plan_id}
                                onValueChange={(val) => setAssignPlanData(d => ({ ...d, plan_id: val }))}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Choose a plan" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {availableTenantPlans.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name} — ${p.price}/{p.duration_type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="plan_expired_date" className="text-xs font-bold">Expiration Date (Optional)</Label>
                            <Input
                                id="plan_expired_date"
                                type="date"
                                className="rounded-xl"
                                value={assignPlanData.plan_expired_date}
                                onChange={(e) => setAssignPlanData(d => ({ ...d, plan_expired_date: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setIsAssignPlanOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl font-bold" onClick={handleAssignPlan} disabled={isAssigningPlan || !assignPlanData.plan_id}>
                            {isAssigningPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Assign Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add User Modal */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Add New Team User</DialogTitle>
                        <DialogDescription>
                            Create a user account and assign plan access
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddUser} className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold">Full Name *</Label>
                            <Input
                                placeholder="John Doe"
                                className="rounded-xl"
                                value={addUserForm.name}
                                onChange={(e) => setAddUserForm(f => ({ ...f, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold">Email Address *</Label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                className="rounded-xl"
                                value={addUserForm.email}
                                onChange={(e) => setAddUserForm(f => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold">Password *</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="rounded-xl pr-10"
                                    value={addUserForm.password}
                                    onChange={(e) => setAddUserForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold">Phone Number</Label>
                            <Input
                                placeholder="+1 (555) 000-0000"
                                className="rounded-xl"
                                value={addUserForm.phone}
                                onChange={(e) => setAddUserForm(f => ({ ...f, phone: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold">Subscription Plan *</Label>
                            <Select
                                value={addUserForm.plan_id}
                                onValueChange={(val) => setAddUserForm(f => ({ ...f, plan_id: val }))}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Assign plan" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {availableTenantPlans.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name} — ${p.price}/{p.duration_type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsAddUserOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="rounded-xl font-bold" disabled={isAddingUser}>
                                {isAddingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Create Account
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Details Drawer/Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[550px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Account Summary</DialogTitle>
                        <DialogDescription>Detailed profile and plan access status</DialogDescription>
                    </DialogHeader>

                    {isFetchingDetail ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Account Details...</p>
                        </div>
                    ) : selectedUser ? (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-white/5">
                                <Avatar className="h-14 w-14 border-2 border-background shadow-lg">
                                    <AvatarImage src={selectedUser.avatar} />
                                    <AvatarFallback className="bg-primary/10 text-base font-black text-primary">
                                        {selectedUser.name ? selectedUser.name.split(' ').map(n => n[0]).join('') : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-black">{selectedUser.name}</h3>
                                    <p className="text-xs font-medium text-muted-foreground">{selectedUser.email}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                                            {selectedUser.role || selectedUser.type}
                                        </Badge>
                                        <PlanStatusBadge planName={selectedUser.current_plan} planStatus={selectedUser.plan_status} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-card/40 border border-white/5">
                                    <p className="font-bold text-muted-foreground text-[10px] uppercase">Account Status</p>
                                    <p className="font-black mt-1 text-emerald-500 flex items-center gap-1">
                                        {selectedUser.active_status ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                                        {selectedUser.status || (selectedUser.active_status ? "Active" : "Restricted")}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-card/40 border border-white/5">
                                    <p className="font-bold text-muted-foreground text-[10px] uppercase">Two-Factor Authentication</p>
                                    <p className="font-black mt-1 flex items-center gap-1">
                                        {selectedUser.two_factor_enabled ? (
                                            <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Enabled</span>
                                        ) : (
                                            <span className="text-muted-foreground flex items-center gap-1"><ShieldOff className="h-3.5 w-3.5" /> Disabled</span>
                                        )}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-card/40 border border-white/5">
                                    <p className="font-bold text-muted-foreground text-[10px] uppercase">Phone / Contact</p>
                                    <p className="font-black mt-1 truncate">{selectedUser.phone || 'Not provided'}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-card/40 border border-white/5">
                                    <p className="font-bold text-muted-foreground text-[10px] uppercase">Member Since</p>
                                    <p className="font-black mt-1">{selectedUser.created_at ? formatDate(new Date(selectedUser.created_at), 'MMM D, YYYY') : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setIsDetailOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Status Change Modal */}
            <Dialog open={confirmState.open} onOpenChange={(open) => setConfirmState(s => ({ ...s, open }))}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Confirm Status Change</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {confirmState.currentStatus ? 'deactivate' : 'activate'} <strong>{confirmState.userName}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-2">
                        <Button variant="outline" className="rounded-xl" onClick={() => setConfirmState(s => ({ ...s, open: false }))}>
                            Cancel
                        </Button>
                        <Button
                            variant={confirmState.currentStatus ? "destructive" : "default"}
                            className="rounded-xl font-bold"
                            onClick={handleToggleStatus}
                        >
                            Confirm {confirmState.currentStatus ? 'Deactivation' : 'Activation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
