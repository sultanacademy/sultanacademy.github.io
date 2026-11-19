import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ezccynahgubalainoqkf.supabase.co';
const supabaseKey = 'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 1. GOOGLE AUTH & WHITELISTING (Super Secure Admin) ---
// Sənin rəsmi Admin Gmail ünvanın:
const SUPER_ADMIN_EMAIL = "sultanacademyinfo@gmail.com"; 

export async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/index.html'
        }
    });
}

// --- 2. DUAL ROLE (STUDENT <-> EDUCATOR) SWITCHER ---
const btnModeLearner = document.getElementById('btnModeLearner');
const btnModeEducator = document.getElementById('btnModeEducator');
const viewLearner = document.getElementById('viewLearner');
const viewEducator = document.getElementById('viewEducator');
const dashboardModal = document.getElementById('dashboardModal');
const closeDashboardModal = document.getElementById('closeDashboardModal');
const navAuthBtn = document.getElementById('navAuthBtn');

let currentActiveRole = localStorage.getItem('sultan_role') || 'learner';

function switchRole(newRole) {
    currentActiveRole = newRole;
    localStorage.setItem('sultan_role', newRole);

    if (newRole === 'learner') {
        btnModeLearner.classList.add('active');
        btnModeEducator.classList.remove('active');
        viewLearner.classList.remove('hidden');
        viewEducator.classList.add('hidden');
    } else {
        btnModeEducator.classList.add('active');
        btnModeLearner.classList.remove('active');
        viewEducator.classList.remove('hidden');
        viewLearner.classList.add('hidden');
    }
}

if (btnModeLearner && btnModeEducator) {
    btnModeLearner.addEventListener('click', () => switchRole('learner'));
    btnModeEducator.addEventListener('click', () => switchRole('educator'));
}

if (navAuthBtn) {
    navAuthBtn.addEventListener('click', () => {
        dashboardModal.classList.remove('hidden');
        switchRole(currentActiveRole);
    });
}

if (closeDashboardModal) {
    closeDashboardModal.addEventListener('click', () => {
        dashboardModal.classList.add('hidden');
    });
}



// Discord Admin Kanalına Webhook ilə Bildiriş Göndərmək
async function notifyDiscordOnNewTutor(tutorData) {
    // Sənin Discord Admin Kanalının Webhook URL-i:
    const DISCORD_WEBHOOK_URL = "BURAYA_OZ_DISCORD_WEBHOOK_LINKINI_YAPISDIR";

    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("BURAYA")) return;

    const embedPayload = {
        username: "Sultan Academy Bot",
        avatar_url: "https://sultanalizada.github.io/logo.png",
        embeds: [{
            title: "🎓 Yeni Mentor / Tutor Müraciəti!",
            color: 3711992, // Neon Mavi Rəng (#38BDF8)
            fields: [
                { name: "👤 Ad / Soyad", value: tutorData.name, inline: true },
                { name: "🌍 Dil", value: tutorData.language, inline: true },
                { name: "📚 Fənn / Sahə", value: tutorData.subject, inline: true },
                { name: "💰 Qiymət", value: tutorData.price, inline: true },
                { name: "🔴 Canlı Yayım / Dərs?", value: tutorData.offers_live_sessions ? "✅ Bəli (Sultan Academy Discord)" : "❌ Xeyr", inline: true },
                { name: "💬 Discord Otağı", value: tutorData.discord_channel, inline: false },
                { name: "📅 Cal.com", value: tutorData.cal_link || "Qoşulmayıb", inline: false }
            ],
            footer: { text: "admin.html portalına daxil olub təsdiqləyin və ya rədd edin." },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(embedPayload)
        });
    } catch (err) {
        console.error("Discord Webhook Error:", err);
    }
}




// --- 3. MENTOR MÜRACİƏTİ VƏ DISCORD WEBHOOK ---
const tutorForm = document.getElementById('tutorApplicationForm');

if (tutorForm) {
    tutorForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tutorData = {
            name: document.getElementById('tutorName').value.trim(),
            avatar_url: document.getElementById('tutorAvatar').value.trim(),
            language: document.getElementById('tutorLanguage').value.trim(),
            subject: document.getElementById('tutorSubject').value.trim(),
            price: document.getElementById('tutorPrice').value.trim(),
            discord_channel: document.getElementById('tutorDiscordChannel').value.trim(),
            offers_live_sessions: document.getElementById('tutorOffersLive').checked,
            cal_link: document.getElementById('tutorCalLink').value.trim()
        };

        // 1. Supabase-ə əlavə et ('pending' statusu ilə)
        const { error } = await supabase.from('tutors').insert([tutorData]);

        if (!error) {
            // 2. Discord Admin Kanalına Webhook göndər
            await notifyDiscordOnNewTutor(tutorData);

            alert("🎉 Your Educator card has been submitted! It will appear on the site once reviewed by Sultan Academy admin.");
            dashboardModal.classList.add('hidden');
            tutorForm.reset();
        } else {
            alert("Error saving profile. Please verify your fields.");
        }
    });
}

// --- 4. CAL.COM VƏ DISCORD ÜÇÜN ADSTERRA REKLAM AÇILIŞI ---
export function attachAdUnlocker(buttonElement, targetUrl, unlockType) {
    buttonElement.addEventListener('click', (e) => {
        e.preventDefault();

        const adUrl = "https://www.profitableratecpmnetwork.com/fspm49jkm?key=88e5821febc3aed060a93ce3587926fc";
        const adWindow = window.open(adUrl, "_blank");

        if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
            alert("⚠️ Pop-up Blocked!\nPlease allow pop-ups to verify the sponsor ad and unlock the " + unlockType + ".");
            return;
        }

        buttonElement.style.pointerEvents = 'none';
        let timeLeft = 10;
        buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;

        const timer = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;
            } else {
                clearInterval(timer);
                buttonElement.innerHTML = `<i class="fas fa-check"></i> Opened`;
                buttonElement.style.pointerEvents = 'auto';
                window.open(targetUrl, "_blank");
            }
        }, 1000);
    });
}


