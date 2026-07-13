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
        if (socialLoading) return;
        setSocialLoading(platform);

        const width = 600;
        const height = 750;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        const popup = window.open(
            'about:blank',
            `social-auth-${platform}`,
            `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
            showModal("error", "Error", "Popup blocked! Please allow popups for this site.");
            setSocialLoading(null);
            return;
        }

        popupRef.current = popup;

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'oauth-success') {
                cleanup();
                const { token } = event.data;

                localStorage.setItem('token', token);
                dispatch(fetchMe()).then((result) => {
                    if (fetchMe.fulfilled.match(result)) {
                        toast.success(`Welcome back!`, {
                            description: "You've successfully connected your account."
                        });
                        router.push('/dashboard');
                    } else {
                        setSocialLoading(null);
                    }
                });
            } else if (event.data?.type === 'oauth-error') {
                cleanup();
                popup.close();
                toast.error(event.data.error || 'Authentication failed');
                setSocialLoading(null);
            }
        };

        const closedInterval = setInterval(() => {
            if (popup.closed) {
                cleanup();

                const result = dispatch(fetchMe());
                if (typeof result === 'object' && 'then' in result) {
                    (result as ReturnType<typeof dispatch>).then((action) => {
                        if (fetchMe.fulfilled.match(action)) {
                            toast.success(`Welcome back!`, {
                                description: "You've successfully connected your account."
                            });
                            router.push('/dashboard');
                        } else {
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
            const response = await api.get(`/auth/social/${platform}`);

            if (response.data.success && response.data.data.redirect_url) {
                popup.location.href = response.data.data.redirect_url;
            } else {
                popup.close();
                cleanup();
                toast.error(`Failed to initialize ${platform} login`);
                setSocialLoading(null);
            }
        } catch (err: any) {
            popup.close();
            cleanup();
            console.error(`${platform} Login Error:`, err);
            toast.error(err.response?.data?.message || `Error connecting to ${platform}`);
            setSocialLoading(null);
        }
    }, [socialLoading, router, dispatch, showModal]);

    return {
        handleSocialLogin,
        socialLoading,
    };
}
