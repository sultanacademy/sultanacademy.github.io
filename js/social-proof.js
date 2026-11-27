import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    'https://ezccynahgubalainoqkf.supabase.co',
    'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX'
);

const vibrantGradients = [
    "linear-gradient(135deg, #FF416C, #FF4B2B)",
    "linear-gradient(135deg, #10b981, #059669)",
    "linear-gradient(135deg, #38bdf8, #6366f1)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #8b5cf6, #ec4899)"
];

let feedItems = [];
let currentIndex = 0;

async function initSocialProof() {
    const container = document.getElementById("social-proof-container");
    if (!container) return;

    const { data } = await supabase
        .from("social_proof")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: false });

    // Hüquqi qaydaya görə: yalnız bazadakı real təsdiqlənmiş dəstəkçiləri göstəririk
    if (!data || data.length === 0) return;

    feedItems = data;
    setTimeout(showNextNotification, 4000);
}

function showNextNotification() {
    const container = document.getElementById("social-proof-container");
    if (!container || feedItems.length === 0) return;

    const item = feedItems[currentIndex];
    const initial = item.name.charAt(0).toUpperCase();
    const randomGrad = vibrantGradients[Math.floor(Math.random() * vibrantGradients.length)];

    const card = document.createElement("div");
    card.className = "sp-card";
    card.innerHTML = `
        <div class="sp-avatar" style="background: ${randomGrad};">${initial}</div>
        <div class="sp-details">
            <span class="sp-name">${item.name}</span>
            <span class="sp-action">${item.action}</span>
            <span class="sp-time"><i class="fas fa-check-circle" style="color: #10b981;"></i> ${item.time_text}</span>
        </div>`;

    container.appendChild(card);
    setTimeout(() => card.classList.add("show"), 100);

    setTimeout(() => {
        card.classList.remove("show");
        card.classList.add("exit");
        setTimeout(() => card.remove(), 600);
    }, 4500);

    currentIndex = (currentIndex + 1) % feedItems.length;
    setTimeout(showNextNotification, Math.floor(Math.random() * 4000) + 8000);
}

document.addEventListener("DOMContentLoaded", initSocialProof);
