"use client";

import React, { useState } from 'react';
import { Search, Facebook, Instagram, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AccountSelectorProps {
  accounts: any[];
  isLoading: boolean;
  onSelectionChange: (selectedIds: string[]) => void;
}

export function AccountSelector({ accounts, isLoading, onSelectionChange }: AccountSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');

  const toggleAccount = (id: string) => {
    const newSelected = selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id];
    setSelected(newSelected);
    onSelectionChange(newSelected);
  };

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platform === 'all' || a.type === platform;
    return matchesSearch && matchesPlatform;
  });

  const fbCount = accounts.filter(a => a.type === 'facebook').length;
  const igCount = accounts.filter(a => a.type === 'instagram').length;

  return (
    <div className="flex flex-col h-full bg-[var(--card)] border-r border-[var(--border)] p-4 gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Accounts</h3>
        <p className="text-xs text-[var(--muted-foreground)]">Select pages to publish to</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
        <Input 
          placeholder="Quick find..." 
          className="bg-[var(--background)] border-[var(--border)] pl-9 text-[var(--foreground)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs value={platform} onValueChange={setPlatform} className="w-full">
        <TabsList className="w-full bg-[var(--background)] border border-[var(--border)] p-1 h-9">
          <TabsTrigger value="all" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex-1 text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white gap-1">
            <Facebook className="w-3 h-3" /> ({fbCount})
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex-1 text-xs data-[state=active]:bg-[var(--primary)]/100 data-[state=active]:text-white gap-1">
            <Instagram className="w-3 h-3" /> ({igCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] pb-2 border-b border-[var(--border)]">
        <span>{selected.length} Selected</span>
        {selected.length > 0 && (
            <button onClick={() => { setSelected([]); onSelectionChange([]); }} className="text-primary hover:underline lowercase normal-case">Clear</button>
        )}
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-widest">Fetching Accounts...</p>
          </div>
        ) : filteredAccounts.length > 0 ? (
          <div className="space-y-2 pb-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                onClick={() => toggleAccount(account.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  selected.includes(account.id) 
                  ? 'bg-primary/5 border-primary/30 shadow-sm' 
                  : 'bg-[var(--background)] border-[var(--border)] hover:border-primary/50'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10 border border-[var(--border)]">
                    <AvatarImage src={account.image} />
                    <AvatarFallback className="bg-[var(--secondary)] text-[var(--foreground)]">{account.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 border border-[var(--background)] ${
                    account.type === 'facebook' ? 'bg-[#1877F2]' : 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'
                  }`}>
                    {account.type === 'facebook' ? <Facebook className="w-3 h-3 text-white" /> : <Instagram className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">{account.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] capitalize truncate">{account.type} {account.type === 'facebook' ? 'Page' : 'Profile'}</p>
                </div>
                {selected.includes(account.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 opacity-50">
            <p className="text-sm text-[var(--muted-foreground)]">No accounts found.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
