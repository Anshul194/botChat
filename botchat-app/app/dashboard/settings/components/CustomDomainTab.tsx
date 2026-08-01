'use client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDomainRequests, requestDomainChange, checkDomainDns } from '@/store/slices/settingsSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Clock, Globe, Copy, AlertTriangle } from 'lucide-react';

const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export default function CustomDomainTab() {
    const dispatch = useAppDispatch();
    const { domainRequests, isLoading } = useAppSelector(state => state.settings);
    const [domainName, setDomainName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkingDnsId, setCheckingDnsId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchDomainRequests());
    }, [dispatch]);

    const handleRequestDomain = async () => {
        if (!domainName.trim()) {
            toast.error('Please enter a domain name');
            return;
        }

        // Client-side domain format validation
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

    const handleCheckDns = async (id: number) => {
        setCheckingDnsId(id);
        try {
            await dispatch(checkDomainDns(id)).unwrap();
            toast.success('DNS verification successful!');
        } catch (error: any) {
            toast.error(error || 'DNS check failed. Please verify your DNS records are configured correctly.');
        } finally {
            setCheckingDnsId(null);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard`);
        } catch {
            // Fallback for non-HTTPS or older browsers
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
                        Connect your own domain to your space. You will need to add a TXT record to your domain&apos;s DNS settings for verification, and an A Record to point to our server.
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
                    {domainRequests.map((req) => (
                        <Card key={req.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{req.domain_name}</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        {req.status === '0' && <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded-full flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>}
                                        {req.status === '1' && <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</span>}
                                        {req.status === '2' && <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full flex items-center"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>}
                                    </div>
                                </div>
                                <CardDescription>Requested on {new Date(req.created_at).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {req.status === '2' && (req.rejection_reason || req.suggested_fix) && (
                                    <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-md text-sm border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
                                        <p className="font-semibold flex items-center"><XCircle className="w-4 h-4 mr-2" /> Request Rejected</p>
                                        {req.rejection_reason && <p className="mt-2"><strong>Reason:</strong> {req.rejection_reason}</p>}
                                        {req.suggested_fix && <p className="mt-1"><strong>Suggested Fix:</strong> {req.suggested_fix}</p>}
                                    </div>
                                )}
                                
                                {!req.dns_verified && req.status === '0' && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md text-sm border border-slate-200 dark:border-slate-700">
                                        <p className="font-medium mb-3">DNS Configuration Required</p>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">Please add the following records to your domain&apos;s DNS settings. Automatic polling will verify these records in the background, or you can manually check below.</p>
                                        
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                                        <th className="p-2">Type</th>
                                                        <th className="p-2">Host / Name</th>
                                                        <th className="p-2">Value / Target</th>
                                                        <th className="p-2">TTL</th>
                                                        <th className="p-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                                        <td className="p-2 font-medium text-blue-700 dark:text-blue-400">TXT</td>
                                                        <td className="p-2">@</td>
                                                        <td className="p-2 break-all font-mono text-xs">{req.verification_token}</td>
                                                        <td className="p-2">Auto / 3600</td>
                                                        <td className="p-2 text-right">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(req.verification_token, 'TXT Value')}>
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white dark:bg-slate-900">
                                                        <td className="p-2 font-medium text-blue-700 dark:text-blue-400">A</td>
                                                        <td className="p-2">@</td>
                                                        <td className="p-2 break-all font-mono text-xs">{req.server_ip || '---.---.---.---'}</td>
                                                        <td className="p-2">Auto / 3600</td>
                                                        <td className="p-2 text-right">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(req.server_ip || '', 'A Record IP')} disabled={!req.server_ip}>
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {req.dns_verified && (
                                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center font-medium">
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> DNS Verified on {new Date(req.dns_verified_at!).toLocaleDateString()}
                                    </p>
                                )}
                                {req.ssl_status && (
                                    <p className="text-sm flex items-center text-slate-600 dark:text-slate-400">
                                        <Globe className="w-4 h-4 mr-2" /> SSL Status: 
                                        <span className={`ml-1 font-medium ${req.ssl_status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                            {req.ssl_status}
                                        </span>
                                        {req.ssl_expires_at && <span className="ml-2 text-xs opacity-75">(Expires: {new Date(req.ssl_expires_at).toLocaleDateString()})</span>}
                                    </p>
                                )}
                            </CardContent>
                            {!req.dns_verified && req.status === '0' && (
                                <CardFooter>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleCheckDns(req.id)} 
                                        disabled={checkingDnsId === req.id}
                                    >
                                        {checkingDnsId === req.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Manual DNS Check'}
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
