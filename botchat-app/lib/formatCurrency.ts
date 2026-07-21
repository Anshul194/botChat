const CURRENCY_MAP: Record<string, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    AED: 'ar-AE',
    SAR: 'ar-SA',
    CAD: 'en-CA',
    AUD: 'en-AU',
};

let cachedCurrency: string | null = null;
let cachedLocale: string | null = null;

function getCurrencyCode(): string {
    if (cachedCurrency) return cachedCurrency;

    if (typeof window !== 'undefined') {
        try {
            const settingsStr = localStorage.getItem('settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                const code = settings?.currency || settings?.data?.currency;
                if (code) {
                    cachedCurrency = code;
                    cachedLocale = CURRENCY_MAP[code] || 'en-US';
                    return code;
                }
            }
        } catch {
            // ignore
        }
    }

    cachedCurrency = 'INR';
    cachedLocale = 'en-IN';
    return cachedCurrency;
}

export function formatCurrency(v: number): string {
    const code = getCurrencyCode();
    const locale = cachedLocale || 'en-US';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 0,
    }).format(v);
}

export function resetCurrencyCache(): void {
    cachedCurrency = null;
    cachedLocale = null;
}
