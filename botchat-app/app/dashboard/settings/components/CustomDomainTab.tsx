'use client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDomainRequests, requestDomainChange } from '@/store/slices/settingsSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Clock, Globe, Copy, AlertTriangle } from 'lucide-react';

const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export default function CustomDomainTab() {
    const dispatch = useAppDispatch();
    const { domainRequests, isLoading } = useAppSelector(state => state.settings);
    const [domainName, setDomainName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchDomainRequests());
    }, [dispatch]);

    const handleRequestDomain = async () => {
        if (!domainName.trim()) {
            toast.error('Please enter a domain name');
            return;
        }

        if (!DOMAIN_REGEX.test(domainName.trim())) {
            toast.error('Please enter a valid domain (e.g., app.yourdomain.com)');
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(requestDomainChange(domainName.trim())).unwrap();
            toast.success('Domain change request submitted successfully');
            setDomainName('');
        } catch (error: any) {
            toast.error(error || 'Failed to submit domain request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard`);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success(`${label} copied to clipboard`);
            } catch {
                toast.error('Failed to copy to clipboard');
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Custom Domain</CardTitle>
                    <CardDescription>
                        Connect your own domain to your space. You will need to update your DNS records after your request is approved.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Domain Name</label>
                            <Input 
                                placeholder="e.g. app.yourdomain.com" 
                                value={domainName} 
                                onChange={(e) => setDomainName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRequestDomain()}
                            />
                            {domainName && !DOMAIN_REGEX.test(domainName) && (
                                <p className="text-xs text-amber-500 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Enter a valid domain (e.g., app.yourdomain.com)
                                </p>
                            )}
                        </div>
                        <Button onClick={handleRequestDomain} disabled={isLoading || isSubmitting || !domainName.trim()}>
                            {(isLoading || isSubmitting) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                            Request Domain
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {!domainRequests || domainRequests.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold mb-1">No domain requests yet</h3>
                        <p className="text-sm opacity-60">Submit a domain change request above to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Domain Requests</h3>
                    {domainRequests.map((req) => {
                        const ins = req.connection_instructions;

                        return (
                        <Card key={req.id}>
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-xl">Custom Domain</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 font-medium">Requested Domain</p>
                                    <p className="text-base font-semibold">{req.domain_name}</p>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 font-medium">Status</p>
                                    <div>
                                        {req.status === '0' && <span className="text-amber-500 font-semibold flex items-center gap-1.5"><Clock className="w-4 h-4" /> Pending</span>}
                                        {req.status === '1' && <span className="text-green-600 dark:text-green-500 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Approved</span>}
                                        {req.status === '2' && <span className="text-rose-500 font-semibold flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Rejected</span>}
                                    </div>
                                </div>

                                {req.status === '0' && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-500 font-medium">Next Step</p>
                                        <p className="text-sm">Your request is currently being reviewed. Once approved, you will be provided with DNS instructions to connect your domain.</p>
                                    </div>
                                )}

                                {req.status === '2' && (req.rejection_reason || req.suggested_fix) && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-500 font-medium">Rejection Details</p>
                                        <div className="text-sm">
                                            {req.rejection_reason && <p><strong>Reason:</strong> {req.rejection_reason}</p>}
                                            {req.suggested_fix && <p className="mt-1"><strong>Suggested Fix:</strong> {req.suggested_fix}</p>}
                                        </div>
                                    </div>
                                )}

                                {req.status === '1' && ins && (
                                    <>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-500 font-medium">Next Step</p>
                                                <p className="text-sm">Point your domain using one of the methods below.</p>
                                            </div>

                                            {ins.nameservers && ins.nameservers.ns1 && (
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                                                    <p className="font-semibold text-sm">Method 1 (Recommended)</p>
                                                    <p className="text-sm text-slate-500">Nameserver</p>
                                                    <div className="text-sm font-medium font-mono space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {ins.nameservers.ns1} <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => copyToClipboard(ins.nameservers.ns1, 'NS1')}><Copy className="w-3 h-3" /></Button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {ins.nameservers.ns2} <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => copyToClipboard(ins.nameservers.ns2, 'NS2')}><Copy className="w-3 h-3" /></Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {ins.a_record && (
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                                                    <p className="font-semibold text-sm">Method 2</p>
                                                    <p className="text-sm text-slate-500">A Record</p>
                                                    <div className="text-sm font-medium font-mono space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">Host:</span> {ins.a_record.host} 
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">Value:</span> {ins.a_record.value}
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => copyToClipboard(ins.a_record.value || '', 'A Record')}><Copy className="w-3 h-3" /></Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {ins.cname_record && (
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                                                    <p className="font-semibold text-sm">Method 3</p>
                                                    <p className="text-sm text-slate-500">CNAME</p>
                                                    <div className="text-sm font-medium font-mono space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">Host:</span> {ins.cname_record.host}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">Target:</span> {ins.cname_record.value}
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => copyToClipboard(ins.cname_record.value || '', 'CNAME')}><Copy className="w-3 h-3" /></Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="pt-2">
                                            <p className="text-sm text-slate-500 font-medium">Note:</p>
                                            <p className="text-sm text-slate-500">DNS propagation can take up to 24 hours.</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

