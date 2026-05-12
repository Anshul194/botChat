import { useState } from "react";
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

    const handleSocialLogin = async (platform: string) => {
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

        try {
            const response = await api.get(`/auth/social/${platform}`);

            if (response.data.success && response.data.data.redirect_url) {
                popup.location.href = response.data.data.redirect_url;

                const pollTimer = setInterval(async () => {
                    if (popup.closed) {
                        clearInterval(pollTimer);
                        setSocialLoading(null);

                        const result = await dispatch(fetchMe());
                        if (fetchMe.fulfilled.match(result)) {
                            toast.success(`Welcome back!`, {
                                description: "You've successfully connected your account."
                            });
                            router.push('/dashboard');
                        }
                        return;
                    }

                    try {
                        if (popup.location.href.includes('/callback')) {
                            const bodyText = popup.document.body.innerText;
                            if (bodyText.includes('"success":true')) {
                                clearInterval(pollTimer);
                                const data = JSON.parse(bodyText);
                                if (data.data?.token) {
                                    localStorage.setItem('token', data.data.token);
                                    await dispatch(fetchMe());
                                    popup.close();
                                    router.push('/dashboard');
                                }
                            }
                        }
                    } catch (e) {
                        // Ignore cross-origin errors
                    }
                }, 1000);

            } else {
                popup.close();
                toast.error(`Failed to initialize ${platform} login`);
                setSocialLoading(null);
            }
        } catch (err: any) {
            popup.close();
            console.error(`${platform} Login Error:`, err);
            toast.error(err.response?.data?.message || `Error connecting to ${platform}`);
            setSocialLoading(null);
        }
    };

    return {
        handleSocialLogin,
        socialLoading,
    };
}
