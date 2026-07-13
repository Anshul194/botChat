import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { fetchMe } from "@/store/slices/authSlice";
import { useModal } from "@/components/providers/ModalProvider";
import { toast } from "sonner";
import api from "@/lib/api";

export function useSocialLogin() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const popupRef = useRef<Window | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        return () => {
            cleanupRef.current?.();
        };
    }, []);

    const handleSocialLogin = useCallback(async (platform: string) => {
        console.log(`[SOCIAL LOGIN] Starting ${platform} login`);
        if (socialLoading) return;
        setSocialLoading(platform);

        const width = 600;
        const height = 750;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        console.log(`[SOCIAL LOGIN] Opening popup`);
        const popup = window.open(
            'about:blank',
            `social-auth-${platform}`,
            `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
            console.error(`[SOCIAL LOGIN] Popup blocked`);
            showModal("error", "Error", "Popup blocked! Please allow popups for this site.");
            setSocialLoading(null);
            return;
        }

        popupRef.current = popup;

        const handleMessage = (event: MessageEvent) => {
            console.log(`[SOCIAL LOGIN] postMessage received`, { origin: event.origin, data: event.data });
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'oauth-success') {
                console.log(`[SOCIAL LOGIN] OAuth success, saving token`);
                cleanup();
                const { token } = event.data;
                console.log(`[SOCIAL LOGIN] Token preview:`, token?.substring(0, 30) + '...');

                localStorage.setItem('token', token);
                dispatch(fetchMe()).then((result) => {
                    if (fetchMe.fulfilled.match(result)) {
                        console.log(`[SOCIAL LOGIN] fetchMe succeeded, navigating to dashboard`);
                        toast.success(`Welcome back!`, {
                            description: "You've successfully connected your account."
                        });
                        router.push('/dashboard');
                    } else {
                        console.error(`[SOCIAL LOGIN] fetchMe failed`, result);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        toast.error('Failed to authenticate. Please try again.');
                        setSocialLoading(null);
                    }
                });
            } else if (event.data?.type === 'oauth-error') {
                console.error(`[SOCIAL LOGIN] OAuth error:`, event.data.error);
                cleanup();
                popup.close();
                toast.error(event.data.error || 'Authentication failed');
                setSocialLoading(null);
            }
        };

        const closedInterval = setInterval(() => {
            if (popup.closed) {
                console.log(`[SOCIAL LOGIN] Popup closed by user`);
                cleanup();

                const result = dispatch(fetchMe());
                if (typeof result === 'object' && 'then' in result) {
                    (result as ReturnType<typeof dispatch>).then((action) => {
                        if (fetchMe.fulfilled.match(action)) {
                            console.log(`[SOCIAL LOGIN] fetchMe succeeded after popup close`);
                            toast.success(`Welcome back!`, {
                                description: "You've successfully connected your account."
                            });
                            router.push('/dashboard');
                        } else {
                            console.warn(`[SOCIAL LOGIN] fetchMe failed after popup close`);
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setSocialLoading(null);
                        }
                    });
                }
            }
        }, 1000);

        const cleanup = () => {
            window.removeEventListener('message', handleMessage);
            clearInterval(closedInterval);
            cleanupRef.current = null;
        };

        cleanupRef.current = cleanup;

        window.addEventListener('message', handleMessage);

        try {
            console.log(`[SOCIAL LOGIN] Fetching redirect URL from API`);
            const response = await api.get(`/auth/social/${platform}`);
            console.log(`[SOCIAL LOGIN] API response:`, { success: response.data.success, has_redirect_url: !!response.data?.data?.redirect_url });

            if (response.data.success && response.data.data.redirect_url) {
                const redirectUrl = response.data.data.redirect_url;
                console.log(`[SOCIAL LOGIN] Navigating popup to:`, redirectUrl.substring(0, 150) + '...');
                popup.location.href = redirectUrl;
            } else {
                console.error(`[SOCIAL LOGIN] No redirect_url in API response`);
                popup.close();
                cleanup();
                toast.error(`Failed to initialize ${platform} login`);
                setSocialLoading(null);
            }
        } catch (err: any) {
            popup.close();
            cleanup();
            console.error(`[SOCIAL LOGIN] API error:`, {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });
            toast.error(err.response?.data?.message || `Error connecting to ${platform}`);
            setSocialLoading(null);
        }
    }, [socialLoading, router, dispatch, showModal]);

    return {
        handleSocialLogin,
        socialLoading,
    };
}
