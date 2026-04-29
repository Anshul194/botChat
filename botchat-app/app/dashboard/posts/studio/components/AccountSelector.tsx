"use client";

import React, { useState } from 'react';
import { Search, Facebook, Instagram, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AccountSelectorProps {
  accounts: any[];
  isLoading: boolean;
  onSelectionChange: (selectedIds: string[]) => void;
}

export function AccountSelector({ accounts, isLoading, onSelectionChange }: AccountSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const toggleAccount = (id: string) => {
    const newSelected = selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id];
    setSelected(newSelected);
    onSelectionChange(newSelected);
  };

  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[var(--card)]/50 backdrop-blur-xl border-r border-[var(--border)] p-4 gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Accounts</h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          {selected.length} Selected
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
        <Input 
          placeholder="Search accounts..." 
          className="bg-[var(--background)] border-[var(--border)] pl-9 focus:ring-primary/20 transition-all text-[var(--foreground)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-widest">Fetching Accounts...</p>
          </div>
        ) : filteredAccounts.length > 0 ? (
          <div className="space-y-2">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                onClick={() => toggleAccount(account.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  selected.includes(account.id) 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'hover:bg-[var(--secondary)] border-transparent'
                }`}
              >
                <div className="relative">
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
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{account.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] capitalize">{account.type} {account.type === 'facebook' ? 'Page' : 'Profile'}</p>
                </div>
                {selected.includes(account.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-[var(--border)]" />
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
