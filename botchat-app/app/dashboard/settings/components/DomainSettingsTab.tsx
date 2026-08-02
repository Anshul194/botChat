'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGeneralSettings, updateDomainSettings } from '@/store/slices/settingsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export default function DomainSettingsTab() {
    const dispatch = useAppDispatch();
    const { domainSettings, isLoadingGeneral } = useAppSelector((state) => state.settings);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        domain_primary_hostname: '',
        domain_ipv4: '',
        domain_ipv6: '',
        domain_ttl: '3600',
        domain_txt_prefix: '@',
        domain_ssl_provider: 'manual',
        domain_verify_interval: '60',
        domain_allow_wildcard: false,
        domain_allow_root: true,
        domain_reserved_domains: '',
        domain_allowed_tlds: '',
    });

    useEffect(() => {
        dispatch(fetchGeneralSettings({}));
    }, [dispatch]);

    useEffect(() => {
        if (!domainSettings) return;

        setForm({
            domain_primary_hostname: domainSettings.primary_hostname || '',
            domain_ipv4: domainSettings.ipv4 || '',
            domain_ipv6: domainSettings.ipv6 || '',
            domain_ttl: String(domainSettings.ttl || 3600),
            domain_txt_prefix: domainSettings.txt_prefix || '@',
            domain_ssl_provider: domainSettings.ssl_provider || 'manual',
            domain_verify_interval: String(domainSettings.verify_interval || 60),
            domain_allow_wildcard: Boolean(domainSettings.allow_wildcard_domains),
            domain_allow_root: domainSettings.allow_root_domains !== false,
            domain_reserved_domains: (domainSettings.reserved_domains || []).join(','),
            domain_allowed_tlds: (domainSettings.allowed_tlds || []).join(','),
        });
    }, [domainSettings]);

    const updateField = (key: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await dispatch(updateDomainSettings(form)).unwrap();
            toast.success('Domain settings saved successfully.');
        } catch (error: any) {
            toast.error(error || 'Failed to save domain settings');
        } finally {
            setSaving(false);
        }
    };

    if (isLoadingGeneral && !domainSettings) {
        return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Domain Settings</CardTitle>
                <CardDescription>Configure DNS instructions and domain verification defaults used by tenant custom domain requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Primary Hostname" value={form.domain_primary_hostname} onChange={(value) => updateField('domain_primary_hostname', value)} placeholder="api.megadm.chat" />
                    <Field label="Public IPv4" value={form.domain_ipv4} onChange={(value) => updateField('domain_ipv4', value)} placeholder="203.0.113.10" />
                    <Field label="Public IPv6" value={form.domain_ipv6} onChange={(value) => updateField('domain_ipv6', value)} placeholder="2001:db8::1" />
                    <Field label="Default TTL" value={form.domain_ttl} onChange={(value) => updateField('domain_ttl', value)} placeholder="3600" type="number" />
                    <Field label="TXT Verification Host" value={form.domain_txt_prefix} onChange={(value) => updateField('domain_txt_prefix', value)} placeholder="@" />
                    <Field label="SSL Provider" value={form.domain_ssl_provider} onChange={(value) => updateField('domain_ssl_provider', value)} placeholder="manual, certbot, forge" />
                    <Field label="DNS Verify Interval (minutes)" value={form.domain_verify_interval} onChange={(value) => updateField('domain_verify_interval', value)} placeholder="60" type="number" />
                    <Field label="Allowed TLDs (comma separated)" value={form.domain_allowed_tlds} onChange={(value) => updateField('domain_allowed_tlds', value)} placeholder="com,net,chat" />
                </div>

                <Field label="Reserved Domains / Prefixes (comma separated)" value={form.domain_reserved_domains} onChange={(value) => updateField('domain_reserved_domains', value)} placeholder="admin,api,www,mail" />

                <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] p-4">
                        <input type="checkbox" checked={form.domain_allow_wildcard} onChange={(e) => updateField('domain_allow_wildcard', e.target.checked)} />
                        <span className="text-sm font-semibold">Allow Wildcard Domains</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] p-4">
                        <input type="checkbox" checked={form.domain_allow_root} onChange={(e) => updateField('domain_allow_root', e.target.checked)} />
                        <span className="text-sm font-semibold">Allow Root Domains</span>
                    </label>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Domain Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold">{label}</label>
            <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        </div>
    );
}
