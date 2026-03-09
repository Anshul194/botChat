"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers, toggleUserStatus, fetchUserById } from "@/store/slices/usersSlice";
import { Users, Search, Filter, MoreVertical, Shield, UserCheck, UserMinus, Mail } from "lucide-react";
import { Phone, Globe, Calendar, ArrowUpRight, Loader2, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { Settings, AlertCircle, Trash2, UserPlus, Info } from "lucide-react";
import {
    AnimatePresence,
    motion
} from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { format } from "date-fns";

export default function UserManagementPage() {
    const dispatch = useAppDispatch();
    const { users, isLoading, selectedUser } = useAppSelector((state) => state.users);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

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

    useEffect(() => {
        dispatch(fetchUsers());
        document.title = "User Management | BotChat Admin";
    }, [dispatch]);

    const handleToggleStatus = async () => {
        if (!confirmState.userId) return;

        try {
            await dispatch(toggleUserStatus(confirmState.userId)).unwrap();
            toast.success(`User ${confirmState.currentStatus ? 'deactivated' : 'activated'} successfully`);
            setConfirmState(s => ({ ...s, open: false }));
        } catch (error: any) {
            toast.error(error || "Failed to update status");
        }
    };

    const triggerConfirm = (e: React.MouseEvent, user: any) => {
        e.stopPropagation();
        setConfirmState({
            open: true,
            userId: user.id,
            userName: user.name,
            currentStatus: user.active_status
        });
    };

    const handleViewDetails = async (id: number) => {
        setIsFetchingDetail(true);
        setIsDetailOpen(true);
        try {
            await dispatch(fetchUserById(id)).unwrap();
        } catch (error: any) {
            toast.error(error || "Failed to fetch user details");
            setIsDetailOpen(false);
        } finally {
            setIsFetchingDetail(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" ||
            (filter === "active" && user.active_status) ||
            (filter === "inactive" && !user.active_status) ||
            (filter === "super_admin" && user.type === "Super Admin");
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter sm:text-3xl md:text-4xl">
                        User Management<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">Monitor and control access for all platform users</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
                        <Users className="mr-2 h-4 w-4" />
                        Add New User
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-none bg-card/50 shadow-premium">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Users</p>
                                <h3 className="text-2xl font-black mt-1">{users.length}</h3>
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
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active Sessions</p>
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
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Restricted</p>
                                <h3 className="text-2xl font-black mt-1">{users.filter(u => !u.active_status).length}</h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <UserMinus className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Area */}
            <Card className="border-none bg-card/30 shadow-premium overflow-hidden">
                <CardHeader className="flex flex-col gap-4 space-y-0 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Active Directory</CardTitle>
                        <CardDescription>Filtering through {users.length} registered accounts</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-9 rounded-xl bg-muted/30 border-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-xl border-none bg-muted/30">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                                <DropdownMenuItem onClick={() => setFilter("all")}>All Users</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("active")}>Active Only</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("inactive")}>Inactive Only</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFilter("super_admin")}>Super Admins</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-muted/20">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">User Profile</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Role/Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Joined</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-50">
                                                <Users className="h-12 w-12" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleViewDetails(user.id)}
                                            className="group hover:bg-primary/[0.03] transition-all cursor-pointer border-b border-white/[0.02]"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-lg transition-transform group-hover:scale-110">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback className="bg-primary/10 text-xs font-black text-primary">
                                                            {user.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-black leading-none">{user.name}</p>
                                                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Mail className="h-2.5 w-2.5" />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className={cn(
                                                        "w-fit px-1.5 py-0 text-[9px] font-black uppercase tracking-wider",
                                                        user.type === 'Super Admin' ? "border-indigo-500/30 text-indigo-500 bg-indigo-500/5" : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                                                    )}>
                                                        {user.type}
                                                    </Badge>
                                                    {user.type === 'Super Admin' && (
                                                        <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 italic">
                                                            <Shield className="h-2 w-2" /> Global Access
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-[11px] font-bold">
                                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                                        {user.phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] font-bold">
                                                        <Globe className="h-3 w-3 text-muted-foreground" />
                                                        {user.country}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => triggerConfirm(e, user)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all",
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
                                                <div className="flex items-center gap-2 text-[11px] font-black text-muted-foreground uppercase italic">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(user.created_at), "MMM d, yyyy")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                                                        <DropdownMenuItem className="gap-2" onClick={() => handleViewDetails(user.id)}>
                                                            <ArrowUpRight className="h-3.5 w-3.5" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2">
                                                            <Settings className="h-3.5 w-3.5" /> Edit Permissions
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
                </CardContent>
            </Card>

            {/* User Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={(open) => {
                setIsDetailOpen(open);
                if (!open) dispatch({ type: 'users/clearSelectedUser' });
            }}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none bg-background shadow-2xl">
                    {isFetchingDetail || !selectedUser ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Retrieving Profile...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Modal Header/Cover */}
                            <div className="h-24 w-full bg-primary/10 relative">
                                <div className="absolute -bottom-10 left-6">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                        <AvatarImage src={selectedUser.avatar} />
                                        <AvatarFallback className="bg-primary text-2xl font-black text-white">
                                            {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>

                            <div className="px-6 pt-12 pb-8 space-y-6">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black tracking-tight">{selectedUser.name}</h2>
                                        <Badge variant="outline" className={cn(
                                            "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
                                            selectedUser.active_status ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-rose-500/30 text-rose-500 bg-rose-500/5"
                                        )}>
                                            {selectedUser.active_status ? "Active" : "Restricted"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">{selectedUser.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-2xl bg-muted/30 border border-white/5">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Account Type</p>
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5 text-primary" />
                                            {selectedUser.type}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-muted/30 border border-white/5">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Location</p>
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <Globe className="h-3.5 w-3.5 text-primary" />
                                            {selectedUser.country || "N/A"}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-muted/30 border border-white/5">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Phone Number</p>
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-primary" />
                                            {selectedUser.phone || "Not set"}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-muted/30 border border-white/5">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Joined Date</p>
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                            {format(new Date(selectedUser.created_at), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[11px] font-black uppercase tracking-wider text-primary">System Verification</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-muted-foreground">Email Verified</span>
                                            {selectedUser.email_verified_at ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-muted-foreground">Phone Verified</span>
                                            {selectedUser.phone_verified_at ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-muted/20 border-t border-white/5 flex gap-3">
                                <Button className="flex-1 rounded-xl font-bold" onClick={() => setIsDetailOpen(false)}>
                                    Close Overview
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-xl font-bold bg-transparent border-primary/20 text-primary hover:bg-primary/5"
                                    onClick={(e) => {
                                        setIsDetailOpen(false);
                                        triggerConfirm(e, selectedUser);
                                    }}>
                                    {selectedUser.active_status ? "Restrict Access" : "Grant Access"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmState.open} onOpenChange={(open) => setConfirmState(s => ({ ...s, open }))}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-[2rem] border-none bg-background shadow-2xl">
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-3xl flex items-center justify-center mb-6",
                            confirmState.currentStatus ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                            {confirmState.currentStatus ? <AlertCircle className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
                        </div>

                        <h3 className="text-xl font-black tracking-tight mb-2">
                            {confirmState.currentStatus ? "Deactivate User?" : "Activate User?"}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4">
                            You are about to {confirmState.currentStatus ? "restrict" : "grant"} access for <span className="text-foreground font-black">"{confirmState.userName}"</span>.
                            This action can be reversed at any time.
                        </p>

                        <div className="flex flex-col w-full gap-3 mt-8">
                            <Button
                                className={cn(
                                    "w-full h-12 rounded-2xl font-black text-white shadow-lg transition-transform active:scale-95",
                                    confirmState.currentStatus ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                                )}
                                onClick={handleToggleStatus}
                            >
                                {confirmState.currentStatus ? "Yes, Deactivate" : "Yes, Activate User"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-2xl font-bold hover:bg-muted"
                                onClick={() => setConfirmState(s => ({ ...s, open: false }))}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
