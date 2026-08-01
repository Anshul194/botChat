'use client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDomainRequests, requestDomainChange, checkDomainDns } from '@/store/slices/settingsSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Clock, Globe, Copy } from 'lucide-react';

export default function CustomDomainTab() {
    const dispatch = useAppDispatch();
    const { domainRequests, isLoading } = useAppSelector(state => state.settings);
    const [domainName, setDomainName] = useState('');

    useEffect(() => {
        dispatch(fetchDomainRequests());
    }, [dispatch]);

    const handleRequestDomain = async () => {
        if (!domainName) {
            toast.error('Please enter a domain name');
            return;
        }
        
        try {
            await dispatch(requestDomainChange(domainName)).unwrap();
            toast.success('Domain change request submitted successfully');
            setDomainName('');
            dispatch(fetchDomainRequests());
        } catch (error: any) {
            toast.error(error || 'Failed to submit domain request');
        }
    };

    const handleCheckDns = async (id: number) => {
        try {
            await dispatch(checkDomainDns(id)).unwrap();
            toast.success('DNS Check completed');
            dispatch(fetchDomainRequests());
        } catch (error: any) {
            toast.error(error || 'DNS check failed');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Custom Domain</CardTitle>
                    <CardDescription>
                        Connect your own domain to your space. You will need to add a TXT record to your domain's DNS settings for verification, and an A Record to point to our server.
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
                            />
                        </div>
                        <Button onClick={handleRequestDomain} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                            Request Domain
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {domainRequests && domainRequests.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Domain Requests</h3>
                    {domainRequests.map((req) => (
                        <Card key={req.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{req.domain_name}</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        {req.status === '0' && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>}
                                        {req.status === '1' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</span>}
                                        {req.status === '2' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>}
                                    </div>
                                </div>
                                <CardDescription>Requested on {new Date(req.created_at).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {req.status === '2' && (req.rejection_reason || req.suggested_fix) && (
                                    <div className="bg-red-50 p-4 rounded-md text-sm border border-red-200 text-red-900">
                                        <p className="font-semibold flex items-center"><XCircle className="w-4 h-4 mr-2" /> Request Rejected</p>
                                        {req.rejection_reason && <p className="mt-2"><strong>Reason:</strong> {req.rejection_reason}</p>}
                                        {req.suggested_fix && <p className="mt-1"><strong>Suggested Fix:</strong> {req.suggested_fix}</p>}
                                    </div>
                                )}
                                
                                {!req.dns_verified && req.status === '0' && (
                                    <div className="bg-slate-50 p-4 rounded-md text-sm border">
                                        <p className="font-medium mb-3">DNS Configuration Required</p>
                                        <p className="text-slate-600 mb-4">Please add the following records to your domain's DNS settings. Automatic polling will verify these records in the background, or you can manually check below.</p>
                                        
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 border-b">
                                                        <th className="p-2">Type</th>
                                                        <th className="p-2">Host / Name</th>
                                                        <th className="p-2">Value / Target</th>
                                                        <th className="p-2">TTL</th>
                                                        <th className="p-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b bg-white">
                                                        <td className="p-2 font-medium text-blue-700">TXT</td>
                                                        <td className="p-2">@</td>
                                                        <td className="p-2 break-all font-mono">{req.verification_token}</td>
                                                        <td className="p-2">Auto / 3600</td>
                                                        <td className="p-2 text-right">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(req.verification_token, 'TXT Value')}>
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b bg-white">
                                                        <td className="p-2 font-medium text-blue-700">A</td>
                                                        <td className="p-2">@</td>
                                                        <td className="p-2 break-all font-mono">{req.server_ip || '---.---.---.---'}</td>
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
                                    <p className="text-sm text-green-600 flex items-center font-medium">
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> DNS Verified on {new Date(req.dns_verified_at!).toLocaleDateString()}
                                    </p>
                                )}
                                {req.ssl_status && (
                                    <p className="text-sm flex items-center text-slate-600">
                                        <Globe className="w-4 h-4 mr-2" /> SSL Status: 
                                        <span className={`ml-1 font-medium ${req.ssl_status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {req.ssl_status}
                                        </span>
                                        {req.ssl_expires_at && <span className="ml-2 text-xs opacity-75">(Expires: {new Date(req.ssl_expires_at).toLocaleDateString()})</span>}
                                    </p>
                                )}
                            </CardContent>
                            {!req.dns_verified && req.status === '0' && (
                                <CardFooter>
                                    <Button variant="outline" size="sm" onClick={() => handleCheckDns(req.id)} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Manual DNS Check'}
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
