import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchGeneralSettings } from '../store/slices/settingsSlice';

export function useAppSettings() {
    const dispatch = useDispatch<AppDispatch>();
    const { general, isLoadingGeneral } = useSelector((state: RootState) => state.settings);
    const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isAuthenticated && !general) {
            dispatch(fetchGeneralSettings({}));
        }
    }, [isAuthenticated, general, dispatch]);

    const timezone = general?.timezone || 'UTC';
    const dateFormat = general?.dateFormat || 'MMM DD, YYYY';
    const timeFormat = general?.timeFormat || 'hh:mm A';
    const landingPageEnabled = general?.landingPageEnabled !== false;

    function formatDate(date: Date | string | number): string {
        const d = new Date(date);
        try {
            return new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: 'short',
                day: '2-digit',
            }).format(d);
        } catch {
            return d.toLocaleDateString();
        }
    }

    function formatTime(date: Date | string | number): string {
        const d = new Date(date);
        try {
            return new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: timeFormat.includes('A'),
            }).format(d);
        } catch {
            return d.toLocaleTimeString();
        }
    }

    function formatDateTime(date: Date | string | number): string {
        return `${formatDate(date)} ${formatTime(date)}`;
    }

    return {
        general,
        timezone,
        dateFormat,
        timeFormat,
        landingPageEnabled,
        isLoadingGeneral,
        formatDate,
        formatTime,
        formatDateTime,
    };
}
