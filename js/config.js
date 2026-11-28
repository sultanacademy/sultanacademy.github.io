import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SULTAN_CONFIG = {
    SUPABASE_URL: 'https://ezccynahgubalainoqkf.supabase.co',
    SUPABASE_KEY: 'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX',
    WISE_LINK: 'https://wise.com/pay/me/sultana1680',
    DISCORD_INVITE: 'https://discord.gg/rPbq3sWNCQ',
    PATREON_URL: 'https://www.patreon.com/SultanAlizada',
    ADMIN_DISCORD_WEBHOOK: '', // İstəsən öz Discord Webhook linkini bura qoy
    ADSTERRA_BOOK_URL: 'https://arwf.org/4/3946e81041ccc9d120f1b729feb68fae',
    ADSTERRA_TUTOR_URL: 'https://araplhn.org/4/88e5821febc3aed060a93ce3587926fc'
};

export const supabase = createClient(SULTAN_CONFIG.SUPABASE_URL, SULTAN_CONFIG.SUPABASE_KEY);

// XSS qoruyucu
export function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Link təhlükəsizliyi (javascript: hücumlarını bloklayır)
export function safeUrl(url, fallback = '#') {
    if (!url) return fallback;
    const clean = String(url).trim();
    if (/^https?:\/\//i.test(clean) || /^[a-z0-9_.-]+\.(html|png|jpg|jpeg|webp|ico)(\?.*)?$/i.test(clean)) {
        return clean;
    }
    return fallback;
}

// Bütün saytda vahid username formatı
export function cleanHandle(str) {
    if (!str) return '';
    return String(str).trim().toLowerCase().replace(/\s+/g, '').slice(0, 20);
}

// Global istifadə üçün (sadə HTML səhifələrə də çatır)
window.SULTAN_CONFIG = SULTAN_CONFIG;
window.escapeHTML = escapeHTML;
window.safeUrl = safeUrl;
window.cleanHandle = cleanHandle;
