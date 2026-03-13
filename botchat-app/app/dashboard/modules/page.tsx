"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    fetchModuleById,
    clearSelectedModule,
    type Permission,
} from "@/store/slices/modulesSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Layers, Plus, Pencil, Trash2, Shield, Eye, Search,
    Loader2, CheckCircle2, MoreVertical, ShieldCheck,
    RefreshCw, X, LayoutGrid, List, Info,
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ── Permission palette ────────────────────────────────────────────────────
const PERMISSION_META: Record<Permission, { label: string; desc: string; color: string; icon: React.ElementType }> = {
    M: { label: "Manage", desc: "Full control", color: "#6C5CE7", icon: ShieldCheck },
    C: { label: "Create", desc: "Add records", color: "#10b981", icon: Plus },
    E: { label: "Edit", desc: "Modify records", color: "#f59e0b", icon: Pencil },
    D: { label: "Delete", desc: "Remove records", color: "#ef4444", icon: Trash2 },
    S: { label: "Show", desc: "View records", color: "#3b82f6", icon: Eye },
    U: { label: "Update", desc: "Bulk update", color: "#ec4899", icon: RefreshCw },
};

const ALL_PERMISSIONS: Permission[] = ["M", "C", "E", "D", "S", "U"];

function normalise(raw: string): Permission | null {
    const up = raw.toUpperCase() as Permission;
    return PERMISSION_META[up] ? up : null;
}

// ── Permission pill ───────────────────────────────────────────────────────
function PermTag({ perm, size = "md" }: { perm: string; size?: "xs" | "sm" | "md" }) {
    const key = normalise(perm);
    if (!key) {
        return (
            <span className={cn(
                "inline-flex items-center font-black rounded-md bg-muted text-muted-foreground",
                size === "xs" ? "px-1 py-px text-[8px]" : size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]"
            )}>{perm}</span>
        );
    }
    const m = PERMISSION_META[key];
    const sizes = {
        xs: "px-1 py-px text-[8px] gap-0.5",
        sm: "px-1.5 py-0.5 text-[9px] gap-1",
        md: "px-2 py-1 text-[10px] gap-1",
    };
    const iconSizes = { xs: "w-2 h-2", sm: "w-2.5 h-2.5", md: "w-3 h-3" };
    return (
        <span
            className={cn("inline-flex items-center font-black rounded-lg", sizes[size])}
            style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}35` }}
        >
            <m.icon className={iconSizes[size]} />
            {m.label}
        </span>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
                <Layers className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black mb-2">No modules yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Modules define what features live in your system and what permissions they expose.
            </p>
            <Button onClick={onAdd} className="rounded-xl font-black gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Create First Module
            </Button>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────
type ViewMode = "card" | "row";

export default function ModulesPage() {
    const dispatch = useAppDispatch();
    const { modules, isLoading, selectedModule, isFetching } = useAppSelector(s => s.modules);

    const [search, setSearch] = useState("");
    const [view, setView] = useState<ViewMode>("card");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [form, setForm] = useState<{ name: string; permissions: Permission[] }>({ name: "", permissions: [] });

    useEffect(() => { dispatch(fetchModules()); }, [dispatch]);

    // ── handlers ──────────────────────────────────────────────────────
    const openCreate = () => { setForm({ name: "", permissions: [] }); setIsCreateOpen(true); };

    const openEdit = async (id: number) => {
        await dispatch(fetchModuleById(id));
        setIsEditOpen(true);
    };

    const openDetail = async (id: number) => {
        await dispatch(fetchModuleById(id));
        setIsDetailOpen(true);
    };

    const openDelete = (id: number) => { setDeletingId(id); setIsDeleteOpen(true); };

    useEffect(() => {
        if (isEditOpen && selectedModule) {
            setForm({ name: selectedModule.name, permissions: [...selectedModule.permissions] });
        }
    }, [isEditOpen, selectedModule]);

    const togglePerm = (p: Permission) =>
        setForm(f => ({
            ...f,
            permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p],
        }));

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("Module name is required"); return; }
        if (!form.permissions.length) { toast.error("Select at least one permission"); return; }
        setIsSubmitting(true);
        const res = await dispatch(createModule(form));
        setIsSubmitting(false);
        if (createModule.fulfilled.match(res)) { toast.success("Module created"); setIsCreateOpen(false); }
        else toast.error(res.payload as string || "Failed to create module");
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedModule) return;
        if (!form.name.trim()) { toast.error("Module name is required"); return; }
        if (!form.permissions.length) { toast.error("Select at least one permission"); return; }
        setIsSubmitting(true);
        const res = await dispatch(updateModule({ id: selectedModule.id, ...form }));
        setIsSubmitting(false);
        if (updateModule.fulfilled.match(res)) { toast.success("Module updated"); setIsEditOpen(false); }
        else toast.error(res.payload as string || "Failed to update module");
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        const res = await dispatch(deleteModule(deletingId));
        setIsDeleting(false);
        if (deleteModule.fulfilled.match(res)) { toast.success("Module deleted"); setIsDeleteOpen(false); setDeletingId(null); }
        else toast.error(res.payload as string || "Failed to delete");
    };

    const filtered = modules.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
    const deletingModule = modules.find(m => m.id === deletingId);

    // ── Shared permission form ─────────────────────────────────────────
    const PermForm = ({ onSubmit, cta }: { onSubmit: (e: React.FormEvent) => void; cta: string }) => (
        <form onSubmit={onSubmit}>
            <div className="px-7 pb-6 space-y-5">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Module Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        placeholder="e.g. reports"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="rounded-xl bg-muted/40 border-none h-11 font-mono"
                        required
                    />
                    <p className="text-[10px] text-muted-foreground">Use lowercase slugs (reports, user-management)</p>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Permissions <span className="text-destructive">*</span>
                        </Label>
                        <button type="button"
                            onClick={() => setForm(f => ({
                                ...f,
                                permissions: f.permissions.length === ALL_PERMISSIONS.length ? [] : [...ALL_PERMISSIONS],
                            }))}
                            className="text-[10px] font-bold text-primary hover:underline">
                            {form.permissions.length === ALL_PERMISSIONS.length ? "Deselect all" : "Select all"}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {ALL_PERMISSIONS.map(p => {
                            const m = PERMISSION_META[p];
                            const on = form.permissions.includes(p);
                            return (
                                <button key={p} type="button" onClick={() => togglePerm(p)}
                                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 select-none"
                                    style={{
                                        background: on ? `${m.color}14` : "var(--muted)",
                                        border: `1.5px solid ${on ? m.color + "45" : "transparent"}`,
                                        boxShadow: on ? `0 0 12px ${m.color}20` : "none",
                                        transform: on ? "scale(1.02)" : "scale(1)",
                                    }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                                        style={{
                                            background: on ? m.color : `${m.color}20`,
                                            boxShadow: on ? `0 0 10px ${m.color}55` : "none",
                                        }}>
                                        <m.icon className="w-3.5 h-3.5" style={{ color: on ? "white" : m.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold leading-none" style={{ color: on ? m.color : "var(--foreground)" }}>{m.label}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                                    </div>
                                    {on && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: m.color }} />}
                                </button>
                            );
                        })}
                    </div>

                    {form.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {form.permissions.map(p => <PermTag key={p} perm={p} size="sm" />)}
                        </div>
                    )}
                </div>
            </div>
            <div className="px-7 py-4 border-t border-border flex gap-3 bg-muted/20">
                <Button type="button" variant="ghost" className="flex-1 rounded-xl font-bold"
                    onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl font-black gap-2 shadow-lg shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Shield className="w-4 h-4" />{cta}</>}
                </Button>
            </div>
        </form>
    );

    // ── Actions dropdown (shared) ──────────────────────────────────────
    const ActionsMenu = ({ id, compact = false }: { id: number; compact?: boolean }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"
                    className={cn("rounded-lg", compact ? "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" : "h-8 w-8")}>
                    <MoreVertical className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
                <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={() => openDetail(id)}>
                    <Info className="w-3.5 h-3.5" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={() => openEdit(id)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit Module
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => openDelete(id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter sm:text-3xl">
                        Modules<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Define system modules and their access permissions</p>
                </div>
                <Button className="rounded-xl font-black gap-2 shadow-lg shadow-primary/20 w-fit" onClick={openCreate}>
                    <Plus className="w-4 h-4" /> Create Module
                </Button>
            </div>

            {/* ── Stats bar ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Modules", value: modules.length, color: "#6C5CE7" },
                    { label: "Full Access", value: modules.filter(m => m.permissions.some(p => normalise(p) === "M")).length, color: "#10b981" },
                    { label: "CRUD Enabled", value: modules.filter(m => (["C", "E", "D"] as Permission[]).every(p => m.permissions.some(x => normalise(x) === p))).length, color: "#f59e0b" },
                    { label: "Unique Perms", value: [...new Set(modules.flatMap(m => m.permissions).map(p => normalise(p)).filter(Boolean))].length, color: "#ec4899" },
                ].map(s => (
                    <Card key={s.label} className="border-none bg-card/50 shadow-sm">
                        <CardContent className="pt-4 pb-3 px-4">
                            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: `${s.color}90` }}>{s.label}</p>
                            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Toolbar (search + view toggle) ── */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search modules…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 rounded-xl bg-card border-none h-10"
                    />
                    {search && (
                        <button onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted">
                    {(["card", "row"] as ViewMode[]).map(v => (
                        <button key={v} onClick={() => setView(v)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                                view === v
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}>
                            {v === "card" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline capitalize">{v}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading modules…</p>
                </div>
            ) : filtered.length === 0 ? (
                search ? (
                    <div className="flex flex-col items-center py-20 gap-3 text-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm font-bold">No modules matching "{search}"</p>
                        <button onClick={() => setSearch("")} className="text-xs text-primary hover:underline">Clear search</button>
                    </div>
                ) : <EmptyState onAdd={openCreate} />
            ) : (
                <AnimatePresence mode="wait">

                    {/* ═══════════ CARD VIEW ═══════════ */}
                    {view === "card" && (
                        <motion.div key="card"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((mod, idx) => (
                                <motion.div key={mod.id}
                                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.04, duration: 0.25 }}>
                                    <Card className="border-none bg-card/60 shadow-sm group hover:shadow-md transition-all duration-300 overflow-hidden relative">
                                        {/* Gradient top bar */}
                                        <div className="absolute top-0 left-0 right-0 h-[2.5px]"
                                            style={{ background: "linear-gradient(90deg,#6C5CE7,#ec4899,transparent)" }} />

                                        <CardHeader className="pb-2 pt-5 px-5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"
                                                        style={{ boxShadow: "0 0 14px rgba(108,92,231,0.15)" }}>
                                                        <Layers className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-sm font-mono tracking-tight leading-none">{mod.name}</h3>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">ID #{mod.id}</p>
                                                    </div>
                                                </div>
                                                <ActionsMenu id={mod.id} compact />
                                            </div>
                                        </CardHeader>

                                        <CardContent className="px-5 pb-5">
                                            {/* Permission tags */}
                                            <div className="flex flex-wrap gap-1.5 mt-1 mb-4 min-h-[28px]">
                                                {mod.permissions.length > 0
                                                    ? mod.permissions.map(p => <PermTag key={p} perm={p} size="sm" />)
                                                    : <span className="text-[11px] text-muted-foreground italic">No permissions set</span>}
                                            </div>

                                            {/* Permission coverage bar */}
                                            <div className="flex items-center gap-0.5 mb-4">
                                                {ALL_PERMISSIONS.map(p => {
                                                    const has = mod.permissions.some(x => normalise(x) === p);
                                                    return (
                                                        <div key={p} title={PERMISSION_META[p].label}
                                                            className="flex-1 h-1 rounded-full transition-all duration-300"
                                                            style={{ background: has ? PERMISSION_META[p].color : "var(--muted)" }} />
                                                    );
                                                })}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {mod.permissions.length}/{ALL_PERMISSIONS.length} permissions
                                                </span>
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => openEdit(mod.id)}
                                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                                                        style={{ background: "rgba(108,92,231,0.1)", color: "#6C5CE7", border: "1px solid rgba(108,92,231,0.25)" }}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => openDelete(mod.id)}
                                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                                                        style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* ═══════════ ROW / TABLE VIEW ═══════════ */}
                    {view === "row" && (
                        <motion.div key="row"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="rounded-2xl overflow-hidden border border-border/50 bg-card/50">

                            {/* Table header */}
                            <div className="grid grid-cols-[2fr_3fr_1fr_auto] items-center gap-4 px-5 py-3 border-b border-border/50 bg-muted/30">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Permissions</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Coverage</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-1">Actions</span>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-border/30">
                                {filtered.map((mod, idx) => {
                                    const coverage = mod.permissions.length / ALL_PERMISSIONS.length;
                                    return (
                                        <motion.div key={mod.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03, duration: 0.2 }}
                                            className="grid grid-cols-[2fr_3fr_1fr_auto] items-center gap-4 px-5 py-3.5 group hover:bg-primary/[0.03] transition-colors duration-150">

                                            {/* Module name + ID */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                    <Layers className="w-[15px] h-[15px]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black font-mono truncate">{mod.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">#{mod.id}</p>
                                                </div>
                                            </div>

                                            {/* Permission tags */}
                                            <div className="flex flex-wrap gap-1">
                                                {mod.permissions.length > 0
                                                    ? mod.permissions.map(p => <PermTag key={p} perm={p} size="xs" />)
                                                    : <span className="text-[10px] text-muted-foreground italic">None</span>}
                                            </div>

                                            {/* Coverage bar + fraction */}
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-0.5 w-full max-w-[80px]">
                                                    {ALL_PERMISSIONS.map(p => {
                                                        const has = mod.permissions.some(x => normalise(x) === p);
                                                        return (
                                                            <div key={p} title={PERMISSION_META[p].label}
                                                                className="flex-1 h-1.5 rounded-full"
                                                                style={{ background: has ? PERMISSION_META[p].color : "var(--muted)" }} />
                                                        );
                                                    })}
                                                </div>
                                                <span className="text-[9px] font-bold text-muted-foreground">
                                                    {mod.permissions.length}/{ALL_PERMISSIONS.length}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => openDetail(mod.id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                                                    title="View details">
                                                    <Info className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => openEdit(mod.id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Edit">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => openDelete(mod.id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <ActionsMenu id={mod.id} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Footer count */}
                            <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    {filtered.length} module{filtered.length !== 1 && "s"}{search && ` matching "${search}"`}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* ── Create Dialog ── */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[530px] rounded-3xl border-none bg-background shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="px-7 pt-7 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-black tracking-tight">Create Module</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Define a new system module with granular permissions.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <PermForm onSubmit={handleCreate} cta="Create Module" />
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ── */}
            <Dialog open={isEditOpen} onOpenChange={open => { setIsEditOpen(open); if (!open) dispatch(clearSelectedModule()); }}>
                <DialogContent className="sm:max-w-[530px] rounded-3xl border-none bg-background shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="px-7 pt-7 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Pencil className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-black tracking-tight">Edit Module</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Update the name and permissions of this module.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    {isFetching
                        ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : <PermForm onSubmit={handleEdit} cta="Save Changes" />
                    }
                </DialogContent>
            </Dialog>

            {/* ── Detail Dialog ── */}
            <Dialog open={isDetailOpen} onOpenChange={open => { setIsDetailOpen(open); if (!open) dispatch(clearSelectedModule()); }}>
                <DialogContent className="sm:max-w-[480px] rounded-3xl border-none bg-background shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="px-7 pt-7 pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Eye className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-black tracking-tight">Module Details</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Full view of this module.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {isFetching || !selectedModule
                        ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : (
                            <div className="px-7 py-6 space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30">
                                    <Layers className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Name</p>
                                        <p className="text-sm font-black font-mono mt-0.5">{selectedModule.name}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">ID</p>
                                        <p className="text-sm font-black mt-0.5">#{selectedModule.id}</p>
                                    </div>
                                </div>

                                {/* Coverage bar */}
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Permission Coverage</p>
                                    <div className="flex gap-1.5 mb-1">
                                        {ALL_PERMISSIONS.map(p => {
                                            const has = selectedModule.permissions.some(x => normalise(x) === p);
                                            return (
                                                <div key={p} className="flex-1 flex flex-col items-center gap-1">
                                                    <div className="w-full h-2 rounded-full"
                                                        style={{ background: has ? PERMISSION_META[p].color : "var(--muted)" }} />
                                                    <span className="text-[8px] font-bold" style={{ color: has ? PERMISSION_META[p].color : "var(--muted-foreground)" }}>
                                                        {p}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-right">{selectedModule.permissions.length}/{ALL_PERMISSIONS.length} enabled</p>
                                </div>

                                {/* Permission grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_PERMISSIONS.map(p => {
                                        const m = PERMISSION_META[p];
                                        const has = selectedModule.permissions.some(x => normalise(x) === p);
                                        return (
                                            <div key={p} className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                                                style={{ background: has ? `${m.color}10` : "var(--muted)", opacity: has ? 1 : 0.45 }}>
                                                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: has ? m.color : `${m.color}20` }}>
                                                    <m.icon className="w-3 h-3" style={{ color: has ? "white" : m.color }} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold" style={{ color: has ? m.color : "var(--muted-foreground)" }}>{m.label}</p>
                                                    <p className="text-[9px] text-muted-foreground">{m.desc}</p>
                                                </div>
                                                {has && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500 flex-shrink-0" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setIsDetailOpen(false)}>Close</Button>
                                    <Button className="flex-1 rounded-xl font-black gap-2"
                                        onClick={() => { setIsDetailOpen(false); openEdit(selectedModule.id); }}>
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </Button>
                                </div>
                            </div>
                        )}
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={isDeleteOpen} onOpenChange={open => { setIsDeleteOpen(open); if (!open) setDeletingId(null); }}>
                <DialogContent className="sm:max-w-[360px] rounded-3xl border-none bg-background shadow-2xl p-0 overflow-hidden">
                    <div className="px-8 pt-8 pb-2 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive"
                            style={{ boxShadow: "0 0 24px rgba(239,68,68,0.15)" }}>
                            <Trash2 className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black">Delete Module?</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Permanently delete{" "}
                                <span className="font-bold text-foreground font-mono">"{deletingModule?.name}"</span>{" "}
                                and all its permissions. This cannot be undone.
                            </p>
                        </div>
                    </div>
                    <div className="px-8 py-6 flex flex-col gap-2">
                        <Button className="w-full h-11 rounded-2xl font-black bg-destructive hover:bg-destructive/90 text-white gap-2"
                            onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : <><Trash2 className="w-4 h-4" />Yes, Delete</>}
                        </Button>
                        <Button variant="ghost" className="w-full h-11 rounded-2xl font-bold"
                            onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
